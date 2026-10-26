import { randomUUID } from 'node:crypto';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { askClaude, parseJson } from './claude.js';
import { DATA_DIR } from './paths.js';

// Resume grilling: the uploaded resume (text + generated questions) and STARL stories.
const RESUME_FILE = path.join(DATA_DIR, 'resume.json');
const STORIES_FILE = path.join(DATA_DIR, 'stories.json');

const MODEL = process.env.PM_PREP_ANALYSIS_MODEL || 'opus';

export const STARL = ['situation', 'task', 'action', 'result', 'learning'];

// The four stories most behavioral loops probe; the user can rename them.
const STARTER_TITLES = ['Biggest impact', 'Conflict or disagreement', 'Failure or mistake', 'Leading without authority'];

const read = (file, fallback) => (existsSync(file) ? JSON.parse(readFileSync(file, 'utf8')) : fallback);
const write = (file, data) => writeFileSync(file, JSON.stringify(data, null, 2));

const newStory = (title = 'Untitled story') => ({
  id: randomUUID(),
  title,
  ...Object.fromEntries(STARL.map((k) => [k, ''])),
  feedback: null,
  updatedAt: new Date().toISOString(),
});

export function getResume() {
  return read(RESUME_FILE, null);
}

export function listStories() {
  if (!existsSync(STORIES_FILE)) write(STORIES_FILE, STARTER_TITLES.map(newStory));
  return read(STORIES_FILE, []);
}

// Model call that must return JSON; retries once if the reply doesn't parse.
async function askJson(system, prompt) {
  const opts = { system, model: MODEL, timeoutMs: 300_000 };
  try {
    return parseJson(await askClaude({ ...opts, prompt }));
  } catch {
    return parseJson(await askClaude({ ...opts, prompt: `${prompt}\n\nReturn only valid JSON. Escape any double quotes inside strings.` }));
  }
}

// ---- resume + questions ----

const QUESTIONS_SYSTEM = `You are a senior PM hiring manager preparing to grill a candidate on their resume. The candidate is interviewing for PM / senior PM roles.

Read the resume closely and write the questions a sharp interviewer would actually ask about it: dig into specific claims, numbers, projects, transitions and gaps. Every question must point at something on this resume, never a generic behavioural question. Cover: verifying impact numbers, the candidate's own role vs the team's, decisions and trade-offs, failures and what went wrong, stakeholder conflict, career moves and gaps, and depth on the most impressive lines.

Return ONLY a JSON object with this shape:
{
  "questions": [{"question": string, "area": "the resume line or role it targets, short", "why": "what the interviewer is testing, one sentence"}]
}
Write 15 to 20 questions, most important first.`;

export async function saveResume({ fileName, text }) {
  if (!text?.trim()) throw new Error('No text found in the resume. Try a text-based PDF or paste it in.');
  const resume = { fileName: fileName || 'Pasted resume', text: text.trim(), uploadedAt: new Date().toISOString(), questions: [] };
  write(RESUME_FILE, resume);
  return generateQuestions();
}

export async function generateQuestions() {
  const resume = getResume();
  if (!resume) throw new Error('Upload a resume first');
  resume.questions = (await askJson(QUESTIONS_SYSTEM, `<resume>\n${resume.text}\n</resume>`)).questions;
  resume.questionsAt = new Date().toISOString();
  write(RESUME_FILE, resume);
  return resume;
}

// ---- stories ----

function updateStories(fn) {
  const stories = listStories();
  const result = fn(stories);
  write(STORIES_FILE, stories);
  return result;
}

const findIn = (stories, id) => {
  const story = stories.find((s) => s.id === id);
  if (!story) throw new Error('Story not found');
  return story;
};

export const createStory = () => updateStories((stories) => {
  const story = newStory();
  stories.push(story);
  return story;
});

export const updateStory = (id, fields) => updateStories((stories) => {
  const story = findIn(stories, id);
  for (const k of ['title', ...STARL]) if (typeof fields[k] === 'string') story[k] = fields[k];
  story.updatedAt = new Date().toISOString();
  return story;
});

export const deleteStory = (id) => updateStories((stories) => {
  stories.splice(stories.indexOf(findIn(stories, id)), 1);
  return { ok: true };
});

const REVIEW_SYSTEM = `You are a demanding PM interview coach reviewing one behavioural story the candidate has written in STARL form (Situation, Task, Action, Result, Learning). The candidate is interviewing for PM / senior PM roles.

Judge it the way a hiring manager grilling them on it would. Be specific to this story: reference what they wrote, and where the resume is given, point at details from it that the story should use. No generic advice.

Return ONLY a JSON object with this shape:
{
  "missing": ["something a strong answer needs that this story lacks, e.g. no measurable result, unclear personal role"],
  "add": ["a concrete detail, number or angle to add that would make it stronger"],
  "followUps": ["a follow-up question the interviewer will likely ask about this story"]
}
Keep each list to 2-5 short items. Use an empty array if nothing is genuinely missing.`;

export async function reviewStory(id) {
  const story = findIn(listStories(), id);
  if (!STARL.some((k) => story[k].trim())) throw new Error('Write some of the story first');
  const resume = getResume();
  const review = await askJson(
    REVIEW_SYSTEM,
    `Story title: ${story.title}
${STARL.map((k) => `${k[0].toUpperCase() + k.slice(1)}: ${story[k].trim() || '(empty)'}`).join('\n')}${
      resume ? `\n\n<resume>\n${resume.text}\n</resume>` : ''
    }`,
  );
  const feedback = { ...review, at: new Date().toISOString() };
  // Re-read so edits saved while the review ran are kept.
  return updateStories((stories) => Object.assign(findIn(stories, id), { feedback }));
}
