import express from 'express';
import { generateModelAnswer, getModelAnswer } from './answers.js';
import { existsSync } from 'node:fs';
import path from 'node:path';
import {
  analyze,
  answer,
  deleteInterview,
  endInterview,
  getInterview,
  listInterviews,
  loadQuestions,
  startInterview,
} from './interviews.js';
import { ROOT } from './paths.js';
import {
  createStory,
  deleteStory,
  generateQuestions,
  getResume,
  listStories,
  reviewStory,
  saveResume,
  updateStory,
} from './resume.js';
import { bookPath, listBooks, saveProgress } from './study.js';
import { TOPICS } from './topics.js';

const PORT = process.env.PORT || 4000;
const app = express();
app.use(express.json({ limit: '1mb' }));

const handle = (fn) => async (req, res) => {
  try {
    res.json(await fn(req));
  } catch (e) {
    console.error(e);
    res.status(400).json({ error: e.message });
  }
};

app.get('/api/topics', handle(() => {
  const questions = loadQuestions();
  return TOPICS.map(({ id, name, description }) => ({
    id,
    name,
    description,
    questionCount: questions.filter((q) => q.topic === id).length,
  }));
}));

app.get('/api/questions', handle((req) =>
  loadQuestions().filter((q) => !req.query.topic || q.topic === req.query.topic),
));

app.get('/api/questions/:id', handle((req) => {
  const question = loadQuestions().find((q) => q.id === req.params.id);
  if (!question) throw new Error('Question not found');
  return { question, model: getModelAnswer(req.params.id) };
}));
app.post('/api/questions/:id/answer', handle((req) => generateModelAnswer(req.params.id)));

app.get('/api/interviews', handle(() => listInterviews()));
app.post('/api/interviews', handle((req) => startInterview(req.body)));

app.get('/api/interviews/:id', handle((req) => {
  const interview = getInterview(req.params.id);
  if (!interview) throw new Error('Interview not found');
  return interview;
}));

app.post('/api/interviews/:id/answer', handle((req) => answer(req.params.id, req.body)));
app.post('/api/interviews/:id/end', handle((req) => endInterview(req.params.id)));
app.post('/api/interviews/:id/analyze', handle((req) => analyze(getInterview(req.params.id))));
app.delete('/api/interviews/:id', handle((req) => {
  deleteInterview(req.params.id);
  return { ok: true };
}));

app.get('/api/study/books', handle(() => listBooks()));
app.get('/api/study/books/:file/pdf', (req, res) => {
  try {
    res.sendFile(bookPath(req.params.file));
  } catch (e) {
    res.status(404).json({ error: e.message });
  }
});
app.put('/api/study/books/:file/progress', handle((req) => saveProgress(req.params.file, req.body)));

app.get('/api/resume', handle(() => ({ resume: getResume(), stories: listStories() })));
app.put('/api/resume', handle((req) => saveResume(req.body)));
app.post('/api/resume/questions', handle(() => generateQuestions()));
app.post('/api/resume/stories', handle(() => createStory()));
app.put('/api/resume/stories/:id', handle((req) => updateStory(req.params.id, req.body)));
app.delete('/api/resume/stories/:id', handle((req) => deleteStory(req.params.id)));
app.post('/api/resume/stories/:id/review', handle((req) => reviewStory(req.params.id)));

// Serve the built UI (npm start). In dev, Vite serves it and proxies /api here.
const dist = path.join(ROOT, 'dist');
if (existsSync(dist)) {
  app.use(express.static(dist));
  app.get(/^(?!\/api).*/, (_req, res) => res.sendFile(path.join(dist, 'index.html')));
}

app.listen(PORT, '127.0.0.1', () => console.log(`PM Prep running at http://localhost:${PORT}`));
