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
  ScrollArea,
  Select,
  Spinner,
  Table,
  Text,
  TextArea,
  TextField,
} from '@radix-ui/themes';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, formatDate } from '../api.js';

export const STATUS = {
  active: { label: 'In progress', color: 'blue' },
  analyzing: { label: 'Analyzing', color: 'amber' },
  analysis_failed: { label: 'Analysis failed', color: 'red' },
};

export default function InterviewsHome() {
  const navigate = useNavigate();
  const [topics, setTopics] = useState([]);
  const [history, setHistory] = useState([]);
  const [starting, setStarting] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.topics().then(setTopics).catch((e) => setError(e.message));
    api.interviews().then(setHistory).catch((e) => setError(e.message));
  }, []);

  async function start(body) {
    setStarting(body.topicId);
    setError('');
    try {
      const interview = await api.start(body);
      navigate(`/interviews/${interview.id}`);
    } catch (e) {
      setError(e.message);
      setStarting(null);
    }
  }

  return (
    <Flex direction="column" gap="6">
      <Flex justify="between" align="end">
        <Box>
          <Heading size="6">Mock interviews</Heading>
          <Text color="gray" size="2">Pick a topic to start with a random case book question.</Text>
        </Box>
        <ChooseQuestion topics={topics} onStart={start} disabled={Boolean(starting)} />
      </Flex>

      {error && (
        <Callout.Root color="red">
          <Callout.Text>{error}</Callout.Text>
        </Callout.Root>
      )}

      <Grid columns={{ initial: '1', sm: '2', md: '4' }} gap="3">
        {topics.map((t) => (
          <Card key={t.id} asChild className="topic-card">
            <button onClick={() => start({ topicId: t.id })} disabled={Boolean(starting)}>
              <Flex direction="column" gap="1">
                <Flex justify="between" align="center">
                  <Text weight="medium">{t.name}</Text>
                  {starting === t.id && <Spinner />}
                </Flex>
                <Text size="2" color="gray">{t.description}</Text>
                <Text size="1" color="gray" mt="1">{t.questionCount} questions</Text>
              </Flex>
            </button>
          </Card>
        ))}
      </Grid>

      <Box>
        <Heading size="4" mb="3">History</Heading>
        {history.length === 0 ? (
          <Text color="gray" size="2">No interviews yet.</Text>
        ) : (
          <Table.Root variant="surface">
            <Table.Header>
              <Table.Row>
                <Table.ColumnHeaderCell width="130px">Date</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell width="150px">Topic</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>Question</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell width="130px">Result</Table.ColumnHeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {history.map((i) => (
                <Table.Row key={i.id} className="clickable-row" onClick={() => navigate(`/interviews/${i.id}`)}>
                  <Table.Cell><Text color="gray">{formatDate(i.createdAt)}</Text></Table.Cell>
                  <Table.Cell>{i.topicName}</Table.Cell>
                  <Table.Cell>{i.question}</Table.Cell>
                  <Table.Cell>
                    {i.status === 'completed' ? (
                      <Text weight="medium">{i.score}/10 <Text color="gray" weight="regular">· {i.verdict}</Text></Text>
                    ) : (
                      <Badge color={STATUS[i.status].color}>{STATUS[i.status].label}</Badge>
                    )}
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table.Root>
        )}
      </Box>
    </Flex>
  );
}

function ChooseQuestion({ topics, onStart, disabled }) {
  const navigate = useNavigate();
  const [topicId, setTopicId] = useState('product-sense');
  const [questions, setQuestions] = useState([]);
  const [search, setSearch] = useState('');
  const [custom, setCustom] = useState('');

  useEffect(() => {
    api.questions(topicId).then(setQuestions);
  }, [topicId]);

  const filtered = useMemo(() => {
    const s = search.toLowerCase();
    return questions.filter((q) => !s || q.question.toLowerCase().includes(s) || q.company?.toLowerCase().includes(s));
  }, [questions, search]);

  return (
    <Dialog.Root>
      <Dialog.Trigger>
        <Button variant="soft" disabled={disabled}>Choose a question</Button>
      </Dialog.Trigger>
      <Dialog.Content maxWidth="720px">
        <Dialog.Title>Choose a question</Dialog.Title>
        <Dialog.Description size="2" color="gray" mb="3">Click a question to practise it, or open Best answer to study how to answer it.</Dialog.Description>
        <Flex gap="2" mb="3">
          <Select.Root value={topicId} onValueChange={setTopicId}>
            <Select.Trigger />
            <Select.Content>
              {topics.map((t) => <Select.Item key={t.id} value={t.id}>{t.name}</Select.Item>)}
            </Select.Content>
          </Select.Root>
          <Box flexGrow="1">
            <TextField.Root placeholder="Search questions or companies" value={search} onChange={(e) => setSearch(e.target.value)} />
          </Box>
        </Flex>

        <ScrollArea style={{ height: 320 }} type="auto">
          <Flex direction="column">
            {filtered.map((q) => (
              <Flex key={q.id} className="clickable-row" align="center" gap="3" pr="2">
                <Dialog.Close>
                  <Box flexGrow="1" p="2" onClick={() => onStart({ topicId, questionId: q.id })}>
                    <Text size="2">{q.question}</Text>
                    <Text as="div" size="1" color="gray">{[q.company, q.source].filter(Boolean).join(' · ')}</Text>
                  </Box>
                </Dialog.Close>
                <Button size="1" variant="soft" color="gray" onClick={() => navigate(`/interviews/questions/${q.id}`)}>
                  Best answer
                </Button>
              </Flex>
            ))}
            {filtered.length === 0 && <Text size="2" color="gray">No matches.</Text>}
          </Flex>
        </ScrollArea>

        <Text as="div" size="2" weight="medium" mt="4" mb="1">Or ask your own</Text>
        <Flex gap="2" align="end">
          <Box flexGrow="1">
            <TextArea placeholder="e.g. How would you improve Adobe Express for small businesses?" value={custom} onChange={(e) => setCustom(e.target.value)} />
          </Box>
          <Dialog.Close>
            <Button disabled={!custom.trim()} onClick={() => onStart({ topicId, customQuestion: custom.trim() })}>Start</Button>
          </Dialog.Close>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  );
}
