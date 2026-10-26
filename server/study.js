import { existsSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { CASEBOOK_DIR, DATA_DIR } from './paths.js';

// Reading progress per book, keyed by file name: { page, pages, updatedAt }
const PROGRESS_FILE = path.join(DATA_DIR, 'study.json');

const readProgress = () => (existsSync(PROGRESS_FILE) ? JSON.parse(readFileSync(PROGRESS_FILE, 'utf8')) : {});

export function listBooks() {
  const progress = readProgress();
  return readdirSync(CASEBOOK_DIR)
    .filter((f) => f.toLowerCase().endsWith('.pdf'))
    .map((file) => ({
      file,
      title: file.replace(/\.pdf$/i, ''),
      sizeMb: +(statSync(path.join(CASEBOOK_DIR, file)).size / 1e6).toFixed(1),
      ...progress[file],
    }))
    .sort((a, b) => (b.updatedAt || '').localeCompare(a.updatedAt || '') || a.title.localeCompare(b.title));
}

// Only files that are actually in the case book folder can be served.
export function bookPath(file) {
  const name = path.basename(file);
  const full = path.join(CASEBOOK_DIR, name);
  if (!name.toLowerCase().endsWith('.pdf') || !existsSync(full)) throw new Error('Book not found');
  return full;
}

export function saveProgress(file, { page, pages }) {
  bookPath(file);
  const progress = readProgress();
  progress[path.basename(file)] = { page, pages, updatedAt: new Date().toISOString() };
  writeFileSync(PROGRESS_FILE, JSON.stringify(progress, null, 2));
  return progress[path.basename(file)];
}
