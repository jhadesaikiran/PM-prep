import { PlusIcon, TrashIcon, UploadIcon } from '@radix-ui/react-icons';
import {
  Badge,
  Box,
  Button,
  Callout,
  Card,
  Dialog,
  Flex,
  Grid,
  Heading,
  IconButton,
  Spinner,
  Text,
  TextArea,
  TextField,
  Tooltip,
} from '@radix-ui/themes';
import { useEffect, useRef, useState } from 'react';
import { pdfjs } from 'react-pdf';
import { useNavigate } from 'react-router-dom';
import { api, formatDate } from '../api.js';

pdfjs.GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url).toString();

const STARL = [
  { key: 'situation', label: 'Situation', hint: 'Context: company, product, team, what was going on and why it mattered.' },
  { key: 'task', label: 'Task', hint: 'Your goal or responsibility. What were you on the hook for?' },
  { key: 'action', label: 'Action', hint: 'What you did, step by step, in "I" terms. Decisions, trade-offs, who you influenced.' },
  { key: 'result', label: 'Result', hint: 'The outcome, with numbers: metric moved, revenue, time saved, adoption.' },
  { key: 'learning', label: 'Learning', hint: 'What you took away and what you do differently now.' },
];

async function pdfText(file) {
  const pdf = await pdfjs.getDocument({ data: await file.arrayBuffer() }).promise;
  const pages = [];
  for (let i = 1; i <= pdf.numPages; i++) {
    const { items } = await (await pdf.getPage(i)).getTextContent();
    pages.push(items.map((it) => it.str + (it.hasEOL ? '\n' : ' ')).join(''));
  }
  return pages.join('\n\n');
}

export default function ResumeGrilling() {
  const [resume, setResume] = useState(null);
  const [stories, setStories] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .resume()
      .then((r) => {
        setResume(r.resume);
        setStories(r.stories);
      })
      .catch((e) => setError(e.message));
  }, []);

  return (
    <Flex direction="column" gap="5">
      <Box>
        <Heading size="6">Resume grilling</Heading>
        <Text color="gray" size="2">Upload your resume to see what interviewers will dig into, and build the STARL stories you'll answer with.</Text>
      </Box>

      {error && <Callout.Root color="red"><Callout.Text>{error}</Callout.Text></Callout.Root>}

      {stories ? (
        <Grid columns={{ initial: '1', md: '2' }} gap="5" align="start">
          <Flex direction="column" gap="4">
            <UploadCard resume={resume} setResume={setResume} setError={setError} />
            <QuestionsCard resume={resume} setResume={setResume} setError={setError} />
          </Flex>
          <Stories stories={stories} setStories={setStories} setError={setError} />
        </Grid>
      ) : (
        !error && <Spinner />
      )}
    </Flex>
  );
}

// ---- left: resume + questions ----

function UploadCard({ resume, setResume, setError }) {
  const inputRef = useRef(null);
  const [busy, setBusy] = useState('');
  const [pasted, setPasted] = useState('');

  async function upload(fileName, getText) {
    setError('');
    try {
      setBusy('Reading resume');
      const text = await getText();
      setBusy('Writing questions from your resume. This takes about a minute.');
      setResume(await api.uploadResume({ fileName, text }));
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy('');
    }
  }

  function onFile(e) {
    const file = e.target.files[0];
    e.target.value = '';
    if (!file) return;
    upload(file.name, () => (file.name.toLowerCase().endsWith('.pdf') ? pdfText(file) : file.text()));
  }

  return (
    <Card size="2">
      <input ref={inputRef} type="file" accept=".pdf,.txt,.md" hidden onChange={onFile} />
      <Flex justify="between" align="center" gap="3">
        <Box>
          <Text as="div" weight="medium">{resume ? resume.fileName : 'Upload your resume'}</Text>
          <Text as="div" size="1" color="gray">
            {resume ? `Uploaded ${formatDate(resume.uploadedAt)}` : 'PDF or text file. It stays on this machine.'}
          </Text>
        </Box>
        <Flex gap="2" flexShrink="0">
          <Dialog.Root>
            <Dialog.Trigger>
              <Button variant="soft" color="gray" disabled={Boolean(busy)}>Paste</Button>
            </Dialog.Trigger>
            <Dialog.Content maxWidth="640px">
              <Dialog.Title>Paste your resume</Dialog.Title>
              <TextArea rows={14} placeholder="Paste the resume text here" value={pasted} onChange={(e) => setPasted(e.target.value)} />
              <Flex justify="end" gap="2" mt="3">
                <Dialog.Close><Button variant="soft" color="gray">Cancel</Button></Dialog.Close>
                <Dialog.Close>
                  <Button disabled={!pasted.trim()} onClick={() => upload('Pasted resume', async () => pasted)}>Use this resume</Button>
                </Dialog.Close>
              </Flex>
            </Dialog.Content>
          </Dialog.Root>
          <Button onClick={() => inputRef.current.click()} disabled={Boolean(busy)}>
            <UploadIcon /> {resume ? 'Replace' : 'Upload'}
          </Button>
        </Flex>
      </Flex>
      {busy && (
        <Flex gap="2" align="center" mt="3">
          <Spinner />
          <Text size="2" color="gray">{busy}</Text>
        </Flex>
      )}
    </Card>
  );
}

function QuestionsCard({ resume, setResume, setError }) {
  const navigate = useNavigate();
  const [regenerating, setRegenerating] = useState(false);
  const [starting, setStarting] = useState(null);

  async function regenerate() {
    setRegenerating(true);
    setError('');
    try {
      setResume(await api.regenerateQuestions());
    } catch (e) {
      setError(e.message);
    } finally {
      setRegenerating(false);
    }
  }

  async function practice(i, question) {
    setStarting(i);
    setError('');
    try {
      const interview = await api.start({ topicId: 'behavioral', customQuestion: question });
      navigate(`/interviews/${interview.id}`);
    } catch (e) {
      setError(e.message);
      setStarting(null);
    }
  }

  const questions = resume?.questions || [];

  return (
    <Card size="2">
      <Flex justify="between" align="center" mb="3">
        <Heading size="4">Questions they'll ask</Heading>
        {resume && (
          <Button variant="ghost" color="gray" onClick={regenerate} disabled={regenerating}>
            {regenerating && <Spinner />} Regenerate
          </Button>
        )}
      </Flex>
      {questions.length === 0 ? (
        <Text size="2" color="gray">
          {resume ? 'No questions yet. Click Regenerate.' : 'Upload your resume to get questions tailored to it.'}
        </Text>
      ) : (
        <Flex direction="column" gap="3" className="grill-questions">
          {questions.map((q, i) => (
            <Flex key={i} gap="3" align="start" justify="between" className="grill-question">
              <Box>
                <Text as="div" size="2" weight="medium">{i + 1}. {q.question}</Text>
                <Flex gap="2" align="center" mt="1" wrap="wrap">
                  {q.area && <Badge variant="soft" color="gray">{q.area}</Badge>}
                  <Text size="1" color="gray">{q.why}</Text>
                </Flex>
              </Box>
              <Button size="1" variant="soft" disabled={starting !== null} onClick={() => practice(i, q.question)}>
                {starting === i && <Spinner />} Practice
              </Button>
            </Flex>
          ))}
        </Flex>
      )}
    </Card>
  );
}

// ---- right: STARL stories ----

function Stories({ stories, setStories, setError }) {
  const [openId, setOpenId] = useState(null);

  const patch = (id, fields) => setStories((list) => list.map((s) => (s.id === id ? { ...s, ...fields } : s)));

  async function add() {
    try {
      const story = await api.createStory();
      setStories((list) => [...list, story]);
      setOpenId(story.id);
    } catch (e) {
      setError(e.message);
    }
  }

  async function remove(id) {
    try {
      await api.deleteStory(id);
      setStories((list) => list.filter((s) => s.id !== id));
    } catch (e) {
      setError(e.message);
    }
  }

  return (
    <Flex direction="column" gap="3">
      <Flex justify="between" align="center">
        <Box>
          <Heading size="4">Stories</Heading>
          <Text size="1" color="gray">Situation · Task · Action · Result · Learning</Text>
        </Box>
        <Button variant="soft" onClick={add}><PlusIcon /> Add story</Button>
      </Flex>
      {stories.map((s) => (
        <StoryCard
          key={s.id}
          story={s}
          open={openId === s.id}
          onToggle={() => setOpenId(openId === s.id ? null : s.id)}
          patch={(fields) => patch(s.id, fields)}
          onDelete={() => remove(s.id)}
          setError={setError}
        />
      ))}
    </Flex>
  );
}

const filled = (story) => STARL.filter((f) => story[f.key].trim());

// Instant checks that don't need a model call.
function quickGaps(story) {
  const gaps = STARL.filter((f) => !story[f.key].trim()).map((f) => `No ${f.label.toLowerCase()} yet. ${f.hint}`);
  if (story.result.trim() && !/\d/.test(story.result)) gaps.push('Result has no number. Add the metric that moved and by how much.');
  if (story.action.trim() && !/\bI\b/.test(story.action)) gaps.push('Action never says "I". Make your own part clear, not just the team\'s.');
  return gaps;
}

function StoryCard({ story, open, onToggle, patch, onDelete, setError }) {
  const [reviewing, setReviewing] = useState(false);
  const [dirty, setDirty] = useState(false);
  const done = filled(story);

  // Autosave edits shortly after typing stops.
  useEffect(() => {
    if (!dirty) return;
    const t = setTimeout(() => {
      const { title, situation, task, action, result, learning } = story;
      api
        .updateStory(story.id, { title, situation, task, action, result, learning })
        .then((saved) => {
          setDirty(false);
          patch({ updatedAt: saved.updatedAt });
        })
        .catch((e) => setError(e.message));
    }, 700);
    return () => clearTimeout(t);
  }, [dirty, story.title, story.situation, story.task, story.action, story.result, story.learning]);

  const edit = (key) => (e) => {
    patch({ [key]: e.target.value });
    setDirty(true);
  };

  async function review() {
    setReviewing(true);
    setError('');
    try {
      if (dirty) {
        const { title, situation, task, action, result, learning } = story;
        await api.updateStory(story.id, { title, situation, task, action, result, learning });
        setDirty(false);
      }
      const saved = await api.reviewStory(story.id);
      patch({ feedback: saved.feedback, updatedAt: saved.updatedAt });
    } catch (e) {
      setError(e.message);
    } finally {
      setReviewing(false);
    }
  }

  const fb = story.feedback;
  const stale = fb && (dirty || story.updatedAt > fb.at);

  return (
    <Box>
      <Card size="2" className={open ? 'story-card story-open' : 'story-card'}>
        <Flex justify="between" align="center" gap="3" className="clickable" onClick={onToggle}>
          <Box minWidth="0">
            <Text as="div" weight="medium" truncate>{story.title || 'Untitled story'}</Text>
            {!open && (
              <Text as="div" size="1" color="gray" truncate>{story.situation || 'Click to write this story'}</Text>
            )}
          </Box>
          <Flex gap="1" flexShrink="0">
            {STARL.map((f) => (
              <Tooltip key={f.key} content={f.label}>
                <Badge color={story[f.key].trim() ? 'green' : 'gray'} variant={story[f.key].trim() ? 'solid' : 'soft'}>
                  {f.label[0]}
                </Badge>
              </Tooltip>
            ))}
          </Flex>
        </Flex>

        {open && (
          <Flex direction="column" gap="3" mt="3">
            <TextField.Root value={story.title} onChange={edit('title')} placeholder="Story title, e.g. Launching payments in 6 weeks" />
            {STARL.map((f) => (
              <Box key={f.key}>
                <Text as="label" size="2" weight="medium">{f.label}</Text>
                <Text as="div" size="1" color="gray" mb="1">{f.hint}</Text>
                <TextArea rows={f.key === 'action' ? 5 : 3} value={story[f.key]} onChange={edit(f.key)} />
              </Box>
            ))}
            <Flex justify="between" align="center">
              <Text size="1" color="gray">{dirty ? 'Saving…' : 'Saved'}</Text>
              <Flex gap="2" align="center">
                <Tooltip content="Delete story">
                  <IconButton variant="ghost" color="red" onClick={onDelete}><TrashIcon /></IconButton>
                </Tooltip>
                <Button onClick={review} disabled={reviewing || done.length === 0}>
                  {reviewing && <Spinner />} {fb ? 'Review again' : 'Review story'}
                </Button>
              </Flex>
            </Flex>
          </Flex>
        )}
      </Card>

      <Gaps story={story} feedback={fb} stale={stale} reviewing={reviewing} />
    </Box>
  );
}

function Gaps({ story, feedback, stale, reviewing }) {
  const missing = [...(feedback?.missing || []), ...quickGaps(story)];
  const add = feedback?.add || [];
  const followUps = feedback?.followUps || [];
  if (!missing.length && !feedback && !reviewing) return null;

  return (
    <Box className="story-gaps">
      {reviewing && (
        <Flex gap="2" align="center" mb="2">
          <Spinner size="1" />
          <Text size="1" color="gray">Reviewing the story…</Text>
        </Flex>
      )}
      {missing.length > 0 && <GapList label="Missing" color="red" items={missing} />}
      {add.length > 0 && <GapList label="Could add" color="amber" items={add} />}
      {followUps.length > 0 && <GapList label="Expect follow-ups" color="indigo" items={followUps} />}
      {feedback && (
        <Text as="div" size="1" color="gray" mt="1">
          Reviewed {formatDate(feedback.at)}{stale ? ' · story changed since, review again' : ''}
        </Text>
      )}
      {!feedback && story.situation.trim() && (
        <Text as="div" size="1" color="gray" mt="1">Open the story and click Review story for detailed feedback.</Text>
      )}
    </Box>
  );
}

function GapList({ label, color, items }) {
  return (
    <Box mb="2">
      <Badge color={color} variant="soft" mb="1">{label}</Badge>
      <ul>
        {items.map((s, i) => <li key={i}><Text size="1">{s}</Text></li>)}
      </ul>
    </Box>
  );
}
