import {
  AlertDialog,
  Badge,
  Box,
  Button,
  Callout,
  Card,
  Flex,
  Heading,
  Separator,
  Spinner,
  Table,
  Text,
  TextArea,
} from '@radix-ui/themes';
import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api, formatDate } from '../api.js';
import { speechSupported, useDictation } from '../speech.js';
import { STATUS } from './InterviewsHome.jsx';

export default function Interview() {
  const { id } = useParams();
  const [interview, setInterview] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.interview(id).then(setInterview).catch((e) => setError(e.message));
  }, [id]);

  // Poll while the analysis runs (also covers reopening the page mid-analysis).
  useEffect(() => {
    if (interview?.status !== 'analyzing') return;
    const t = setInterval(() => api.interview(id).then(setInterview), 4000);
    return () => clearInterval(t);
  }, [id, interview?.status]);

  if (error) return <Callout.Root color="red"><Callout.Text>{error}</Callout.Text></Callout.Root>;
  if (!interview) return <Spinner />;

  return (
    <Flex direction="column" gap="5">
      <Header interview={interview} />
      {interview.status === 'active' ? (
        <LiveInterview interview={interview} setInterview={setInterview} />
      ) : (
        <Review interview={interview} setInterview={setInterview} />
      )}
    </Flex>
  );
}

function Header({ interview }) {
  const navigate = useNavigate();
  const { question } = interview;
  return (
    <Flex justify="between" align="start" gap="4">
      <Box>
        <Flex gap="2" align="center" mb="2">
          <Link to="/interviews"><Text size="2" color="gray">Mock interviews</Text></Link>
          <Text size="2" color="gray">/</Text>
          <Badge variant="soft">{interview.topicName}</Badge>
          <Text size="2" color="gray">{formatDate(interview.createdAt)}</Text>
        </Flex>
        <Heading size="5">{question.question}</Heading>
        <Text size="1" color="gray">{[question.company, question.source].filter(Boolean).join(' · ')}</Text>
      </Box>
      {interview.status !== 'active' && (
        <AlertDialog.Root>
          <AlertDialog.Trigger>
            <Button variant="ghost" color="gray">Delete</Button>
          </AlertDialog.Trigger>
          <AlertDialog.Content maxWidth="400px">
            <AlertDialog.Title>Delete this interview?</AlertDialog.Title>
            <AlertDialog.Description size="2">The transcript and analysis will be removed.</AlertDialog.Description>
            <Flex gap="3" mt="4" justify="end">
              <AlertDialog.Cancel><Button variant="soft" color="gray">Cancel</Button></AlertDialog.Cancel>
              <AlertDialog.Action>
                <Button color="red" onClick={() => api.remove(interview.id).then(() => navigate('/interviews'))}>Delete</Button>
              </AlertDialog.Action>
            </Flex>
          </AlertDialog.Content>
        </AlertDialog.Root>
      )}
    </Flex>
  );
}

// ---------- live interview ----------

export const INTERVIEW_MINUTES = 30;

// Seconds left of the interview (negative once over time).
function useCountdown(since) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  return INTERVIEW_MINUTES * 60 - Math.floor((now - new Date(since).getTime()) / 1000);
}

function Countdown({ since }) {
  const left = useCountdown(since);
  const abs = Math.abs(left);
  const clock = `${Math.floor(abs / 60)}:${String(abs % 60).padStart(2, '0')}`;
  const color = left <= 60 ? 'red' : left <= 5 * 60 ? 'orange' : 'gray';
  return (
    <Badge size="3" variant="soft" color={color} className="countdown">
      {left >= 0 ? `${clock} left` : `Time's up · +${clock}`}
    </Badge>
  );
}

function LiveInterview({ interview, setInterview }) {
  const navigate = useNavigate();
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const answerStartRef = useRef(null);
  const bottomRef = useRef(null);

  const dictation = useDictation((text) => setDraft((d) => (d ? `${d} ${text}` : text)));

  const markAnswerStart = () => {
    if (!answerStartRef.current) answerStartRef.current = Date.now();
  };

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [interview.turns.length, sending]);

  function toggleMic() {
    if (dictation.listening) return dictation.stop();
    markAnswerStart();
    dictation.start();
  }

  async function send() {
    const text = [draft, dictation.interim].filter(Boolean).join(' ').trim();
    if (!text || sending) return;
    dictation.stop(true);
    const durationSec = answerStartRef.current ? Math.round((Date.now() - answerStartRef.current) / 1000) : null;
    answerStartRef.current = null;
    setDraft('');
    setError('');
    setSending(true);
    setInterview((i) => ({ ...i, turns: [...i.turns, { role: 'candidate', text, durationSec }] }));
    try {
      const updated = await api.answer(interview.id, { text, durationSec });
      setInterview(updated);
    } catch (e) {
      setError(e.message);
      setDraft(text);
      setInterview((i) => ({ ...i, turns: i.turns.slice(0, -1) }));
    } finally {
      setSending(false);
    }
  }

  async function end() {
    dictation.stop();
    setInterview((i) => ({ ...i, status: 'analyzing' }));
    try {
      const result = await api.end(interview.id);
      if (!result) navigate('/interviews');
      else setInterview(result);
    } catch (e) {
      setInterview((i) => ({ ...i, status: 'analysis_failed', error: e.message }));
    }
  }

  return (
    <>
      <Flex justify="between" align="center">
        <Countdown since={interview.createdAt} />
        <Flex gap="3" align="center">
          <AlertDialog.Root>
            <AlertDialog.Trigger>
              <Button variant="soft" color="red" disabled={sending}>End interview</Button>
            </AlertDialog.Trigger>
            <AlertDialog.Content maxWidth="400px">
              <AlertDialog.Title>End and analyze?</AlertDialog.Title>
              <AlertDialog.Description size="2">You'll get a scored review of the transcript. This takes about a minute.</AlertDialog.Description>
              <Flex gap="3" mt="4" justify="end">
                <AlertDialog.Cancel><Button variant="soft" color="gray">Keep going</Button></AlertDialog.Cancel>
                <AlertDialog.Action><Button color="red" onClick={end}>End interview</Button></AlertDialog.Action>
              </Flex>
            </AlertDialog.Content>
          </AlertDialog.Root>
        </Flex>
      </Flex>

      <Transcript turns={interview.turns} />
      {sending && <Flex gap="2" align="center"><Spinner /><Text size="2" color="gray">Interviewer is thinking</Text></Flex>}
      {error && <Callout.Root color="red"><Callout.Text>{error}</Callout.Text></Callout.Root>}
      <div ref={bottomRef} />

      <Box className="composer" py="3">
        <Flex direction="column" gap="2">
          <TextArea
            size="3"
            rows={5}
            placeholder={speechSupported ? 'Click the mic and speak, or type your answer' : 'Type your answer (voice needs Chrome or Safari)'}
            value={draft}
            onChange={(e) => {
              markAnswerStart();
              setDraft(e.target.value);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) send();
            }}
          />
          {dictation.interim && <Text size="2" color="gray">{dictation.interim}</Text>}
          <Flex justify="between" align="center">
            {speechSupported ? (
              <Button
                variant={dictation.listening ? 'solid' : 'soft'}
                color={dictation.listening ? 'red' : undefined}
                className={dictation.listening ? 'mic-live' : undefined}
                onClick={toggleMic}
              >
                {dictation.listening ? 'Listening, click to pause' : 'Start speaking'}
              </Button>
            ) : <span />}
            <Flex gap="3" align="center">
              <Text size="1" color="gray">⌘ Enter to send</Text>
              <Button onClick={send} disabled={sending || !(draft.trim() || dictation.interim)}>Send answer</Button>
            </Flex>
          </Flex>
        </Flex>
      </Box>
    </>
  );
}

function Transcript({ turns }) {
  return (
    <Flex direction="column" gap="3">
      {turns.map((t, i) =>
        t.role === 'interviewer' ? (
          <Box key={i}>
            <Text as="div" size="1" color="gray" mb="1">Interviewer</Text>
            <Text as="p" className="pre-wrap">{t.text}</Text>
          </Box>
        ) : (
          <Box key={i} className="turn-candidate" p="3">
            <Text as="div" size="1" color="gray" mb="1">
              You{t.durationSec ? ` · ${Math.floor(t.durationSec / 60)}m ${t.durationSec % 60}s` : ''}
            </Text>
            <Text as="p" className="pre-wrap">{t.text}</Text>
          </Box>
        ),
      )}
    </Flex>
  );
}

// ---------- review ----------

function Review({ interview, setInterview }) {
  const { status, analysis: a } = interview;
  const stuck = status === 'analyzing' && interview.endedAt && Date.now() - new Date(interview.endedAt) > 5 * 60_000;

  const retry = () => {
    setInterview((i) => ({ ...i, status: 'analyzing' }));
    api.analyze(interview.id).then(setInterview);
  };

  return (
    <Flex direction="column" gap="5">
      {status === 'analyzing' && (
        <Card>
          <Flex gap="3" align="center">
            <Spinner />
            <Text>Analyzing your interview. This usually takes about a minute.</Text>
            {stuck && <Button size="1" variant="soft" onClick={retry}>Retry</Button>}
          </Flex>
        </Card>
      )}
      {status === 'analysis_failed' && (
        <Callout.Root color="red">
          <Callout.Text>
            Analysis failed: {interview.error}{' '}
            <Button size="1" variant="soft" color="red" onClick={retry}>Retry</Button>
          </Callout.Text>
        </Callout.Root>
      )}
      {status === 'completed' && a && <Analysis a={a} />}

      <Box>
        <Heading size="4" mb="3">Transcript</Heading>
        <Transcript turns={interview.turns} />
      </Box>
    </Flex>
  );
}

function Analysis({ a }) {
  return (
    <Flex direction="column" gap="5">
      <Card size="3">
        <Flex gap="5" align="center">
          <Box>
            <Text as="div" size="8" weight="bold">{a.score}<Text size="4" color="gray">/10</Text></Text>
            <Text size="2" color="gray">{a.verdict}</Text>
          </Box>
          <Separator orientation="vertical" size="3" />
          <Text as="p">{a.summary}</Text>
        </Flex>
      </Card>

      <Section title="Rubric">
        <Table.Root variant="surface">
          <Table.Body>
            {a.rubric?.map((r) => (
              <Table.Row key={r.dimension}>
                <Table.RowHeaderCell width="220px">{r.dimension}</Table.RowHeaderCell>
                <Table.Cell width="60px"><Text weight="medium" color={r.score >= 4 ? 'green' : r.score <= 2 ? 'red' : undefined}>{r.score}/5</Text></Table.Cell>
                <Table.Cell><Text size="2">{r.comment}</Text></Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Root>
      </Section>

      <Section title="What to improve">
        <Flex direction="column" gap="3">
          {a.improvements?.map((imp, i) => (
            <Box key={i}>
              <Text as="div" weight="medium">{imp.issue}</Text>
              <Text as="div" size="2" color="gray">{imp.evidence}</Text>
              <Text as="div" size="2">{imp.fix}</Text>
            </Box>
          ))}
        </Flex>
      </Section>

      <Section title="What went well">
        <List items={a.strengths} />
      </Section>

      <Section title="Delivery">
        <Text as="p" size="2">{a.communication}</Text>
      </Section>

      <Section title="A stronger answer">
        <List items={a.betterAnswer} ordered />
      </Section>

      <Section title="Practice next">
        <List items={a.practiceNext} />
      </Section>
    </Flex>
  );
}

export const Section = ({ title, children }) => (
  <Box>
    <Heading size="4" mb="2">{title}</Heading>
    {children}
  </Box>
);

export function List({ items = [], ordered }) {
  const Tag = ordered ? 'ol' : 'ul';
  return (
    <Tag style={{ margin: 0, paddingLeft: 20 }}>
      {items.map((s, i) => <li key={i}><Text size="2">{s}</Text></li>)}
    </Tag>
  );
}
