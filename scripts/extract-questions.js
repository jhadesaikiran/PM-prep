// Builds data/questions.json from the PDF case books.
// Usage: npm run extract-questions [-- /path/to/case_books]
import { execFileSync } from 'node:child_process';
import { readdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { askClaude, parseJson } from '../server/claude.js';
import { TOPICS } from '../server/topics.js';
import { CASEBOOK_DIR, QUESTIONS_FILE } from '../server/paths.js';

const dir = process.argv[2] || CASEBOOK_DIR;
const CHUNK = 70_000;
const CONCURRENCY = 4;

const topicList = TOPICS.map((t) => `- ${t.id}: ${t.description}`).join('\n');

const SYSTEM = `You extract product manager interview questions from case book text.
Return ONLY a JSON array. Each item:
{"question": string, "topic": one of the topic ids, "company": string or null, "hint": string or null}

Topics:
${topicList}

Rules:
- Only include real interview questions or case prompts that could be asked in a PM interview.
- Rewrite each question so it is self-contained and phrased as an interviewer would ask it aloud.
- "hint": if the text includes a worked answer, summarise its approach and key points in 2-3 sentences. Otherwise null.
- Skip resume walkthroughs, SQL/coding tasks, company-culture chatter and duplicates.
- If there are no questions, return [].`;

function chunk(text) {
  const out = [];
  for (let i = 0; i < text.length; i += CHUNK) out.push(text.slice(i, i + CHUNK));
  return out;
}

async function pool(items, fn) {
  const results = [];
  let next = 0;
  await Promise.all(
    Array.from({ length: CONCURRENCY }, async () => {
      while (next < items.length) {
        const i = next++;
        results[i] = await fn(items[i]);
      }
    }),
  );
  return results;
}

const pdfs = readdirSync(dir).filter((f) => f.toLowerCase().endsWith('.pdf'));
const jobs = [];
for (const file of pdfs) {
  const text = execFileSync('pdftotext', ['-layout', path.join(dir, file), '-'], { maxBuffer: 64 * 1024 * 1024 })
    .toString()
    .replace(/[ \t]+/g, ' ');
  const source = file.replace(/\.pdf$/i, '');
  chunk(text).forEach((part, i, all) => jobs.push({ source, part, label: `${source} [${i + 1}/${all.length}]` }));
}
console.log(`${pdfs.length} books, ${jobs.length} chunks`);

const results = await pool(jobs, async ({ source, part, label }) => {
  try {
    const reply = await askClaude({ system: SYSTEM, prompt: part, model: 'sonnet', timeoutMs: 600_000 });
    const items = parseJson(reply).map((q) => ({ ...q, source }));
    console.log(`${label}: ${items.length}`);
    return items;
  } catch (e) {
    console.error(`${label}: failed - ${e.message}`);
    return [];
  }
});

const valid = new Set(TOPICS.map((t) => t.id));
const seen = new Set();
const questions = [];
for (const q of results.flat()) {
  if (!q.question || !valid.has(q.topic)) continue;
  const key = q.question.toLowerCase().replace(/[^a-z0-9]/g, '');
  if (seen.has(key)) continue;
  seen.add(key);
  questions.push({ id: `q${questions.length + 1}`, ...q });
}

writeFileSync(QUESTIONS_FILE, JSON.stringify(questions, null, 2));
const counts = Object.fromEntries(TOPICS.map((t) => [t.id, questions.filter((q) => q.topic === t.id).length]));
console.log(`Saved ${questions.length} questions to ${QUESTIONS_FILE}`, counts);
