import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { askClaude, parseJson } from './claude.js';
import { loadQuestions } from './interviews.js';
import { ANSWERS_DIR } from './paths.js';
import { topicById } from './topics.js';

mkdirSync(ANSWERS_DIR, { recursive: true });

const ANSWER_MODEL = process.env.PM_PREP_ANALYSIS_MODEL || 'opus';

const file = (id) => path.join(ANSWERS_DIR, `${path.basename(id)}.json`);
const pending = new Map(); // question id -> in-flight generation

const SYSTEM = `You are a PM interview coach who has run hundreds of interview loops at top tech companies. Write the model answer a strong candidate (about 4 years of PM experience, interviewing for PM / senior PM roles) would give to the question, so the reader can study it before practising.

Make it specific to this exact question, not a generic framework: name real user segments, concrete pain points, actual feature ideas, real numbers and named metrics. Pick a clear recommendation and defend it. The "say" fields are what the candidate would actually say out loud in the interview, in first person, natural spoken English.

Return ONLY a JSON object with this shape:
{
  "approach": "2-3 sentences: the winning approach and why it fits this question",
  "structure": ["short name of each step, in order"],
  "walkthrough": [{"step": "step name", "say": "what the candidate says at this step, 3-8 sentences", "why": "what the interviewer is looking for here, one sentence"}],
  "clarifyingQuestions": [{"question": string, "assumedAnswer": "a plausible answer to proceed with"}],
  "recommendation": "the final recommendation as the candidate would state it, 2-4 sentences",
  "metrics": ["metric: why it matters"],
  "pitfalls": ["common mistake candidates make on this question"],
  "followUps": [{"question": "likely interviewer follow-up", "answer": "strong short answer"}],
  "takeaways": ["reusable lesson from this question"]
}
Use an empty array for metrics if they genuinely don't apply (for example a behavioural question).`;

export function getModelAnswer(id) {
  return existsSync(file(id)) ? JSON.parse(readFileSync(file(id), 'utf8')) : null;
}

export function generateModelAnswer(id) {
  if (pending.has(id)) return pending.get(id);
  const job = generate(id).finally(() => pending.delete(id));
  pending.set(id, job);
  return job;
}

async function generate(id) {
  const question = loadQuestions().find((q) => q.id === id);
  if (!question) throw new Error('Question not found');
  const topic = topicById(question.topic);

  const reply = await askClaude({
    system: SYSTEM,
    prompt: `Interview type: ${topic?.name || question.topic}
What a good answer covers: ${topic?.guide || ''}
Question: "${question.question}"${question.company ? `\nCompany: ${question.company}` : ''}${
      question.hint ? `\nReference approach from a case book: ${question.hint}` : ''
    }`,
    model: ANSWER_MODEL,
    timeoutMs: 300_000,
  });

  const saved = { question, answer: parseJson(reply), createdAt: new Date().toISOString() };
  writeFileSync(file(id), JSON.stringify(saved, null, 2));
  return saved;
}
