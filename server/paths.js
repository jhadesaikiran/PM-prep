import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const DATA_DIR = process.env.PM_PREP_DATA || path.join(ROOT, 'data');
export const INTERVIEWS_DIR = path.join(DATA_DIR, 'interviews');
export const ANSWERS_DIR = path.join(DATA_DIR, 'answers');
export const QUESTIONS_FILE = path.join(DATA_DIR, 'questions.json');
export const CASEBOOK_DIR =
  process.env.PM_PREP_CASEBOOKS || path.join(ROOT, 'casebooks');
