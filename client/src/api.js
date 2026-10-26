async function request(method, url, body) {
  const res = await fetch(url, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => {
    throw new Error(`${method} ${url} returned ${res.status}, not JSON. Restart the server (npm start) to pick up new routes.`);
  });
  if (!res.ok) throw new Error(data.error || res.statusText);
  return data;
}

export const api = {
  topics: () => request('GET', '/api/topics'),
  questions: (topic) => request('GET', `/api/questions?topic=${encodeURIComponent(topic)}`),
  question: (id) => request('GET', `/api/questions/${id}`),
  generateAnswer: (id) => request('POST', `/api/questions/${id}/answer`),
  interviews: () => request('GET', '/api/interviews'),
  interview: (id) => request('GET', `/api/interviews/${id}`),
  start: (body) => request('POST', '/api/interviews', body),
  answer: (id, body) => request('POST', `/api/interviews/${id}/answer`, body),
  end: (id) => request('POST', `/api/interviews/${id}/end`),
  analyze: (id) => request('POST', `/api/interviews/${id}/analyze`),
  remove: (id) => request('DELETE', `/api/interviews/${id}`),
  books: () => request('GET', '/api/study/books'),
  bookUrl: (file) => `/api/study/books/${encodeURIComponent(file)}/pdf`,
  saveProgress: (file, body) => request('PUT', `/api/study/books/${encodeURIComponent(file)}/progress`, body),
  resume: () => request('GET', '/api/resume'),
  uploadResume: (body) => request('PUT', '/api/resume', body),
  regenerateQuestions: () => request('POST', '/api/resume/questions'),
  createStory: () => request('POST', '/api/resume/stories'),
  updateStory: (id, body) => request('PUT', `/api/resume/stories/${id}`, body),
  deleteStory: (id) => request('DELETE', `/api/resume/stories/${id}`),
  reviewStory: (id) => request('POST', `/api/resume/stories/${id}/review`),
};

export const formatDate = (iso) =>
  new Date(iso).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
