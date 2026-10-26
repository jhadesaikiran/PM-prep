import { Badge, Box, Button, Callout, Card, Flex, Heading, Spinner, Text } from '@radix-ui/themes';
import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api, formatDate } from '../api.js';
import { List, Section } from './Interview.jsx';

// Study page: a model answer for a question-bank question, generated once and cached.
export default function ModelAnswer() {
  const { qid } = useParams();
  const navigate = useNavigate();
  const [question, setQuestion] = useState(null);
  const [model, setModel] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState('');

  async function generate() {
    setGenerating(true);
    setError('');
    try {
      setModel(await api.generateAnswer(qid));
    } catch (e) {
      setError(e.message);
    } finally {
      setGenerating(false);
    }
  }

  useEffect(() => {
    api
      .question(qid)
      .then((r) => {
        setQuestion(r.question);
        if (r.model) setModel(r.model);
        else generate();
      })
      .catch((e) => setError(e.message));
  }, [qid]);

  async function practice() {
    setStarting(true);
    try {
      const interview = await api.start({ topicId: question.topic, questionId: question.id });
      navigate(`/interviews/${interview.id}`);
    } catch (e) {
      setError(e.message);
      setStarting(false);
    }
  }

  if (!question) return error ? <Callout.Root color="red"><Callout.Text>{error}</Callout.Text></Callout.Root> : <Spinner />;
  const a = model?.answer;

  return (
    <Flex direction="column" gap="5">
      <Flex justify="between" align="start" gap="4">
        <Box>
          <Flex gap="2" align="center" mb="2">
            <Link to="/interviews"><Text size="2" color="gray">Mock interviews</Text></Link>
            <Text size="2" color="gray">/</Text>
            <Badge variant="soft">Best answer</Badge>
          </Flex>
          <Heading size="5">{question.question}</Heading>
          <Text size="1" color="gray">{[question.company, question.source].filter(Boolean).join(' · ')}</Text>
        </Box>
        <Flex gap="3" align="center" flexShrink="0">
          {model && (
            <Button variant="ghost" color="gray" onClick={generate} disabled={generating}>Regenerate</Button>
          )}
          <Button onClick={practice} disabled={starting}>{starting ? <Spinner /> : null}Practice this question</Button>
        </Flex>
      </Flex>

      {question.hint && (
        <Callout.Root variant="surface">
          <Callout.Text><Text weight="medium">Case book approach: </Text>{question.hint}</Callout.Text>
        </Callout.Root>
      )}

      {error && <Callout.Root color="red"><Callout.Text>{error}</Callout.Text></Callout.Root>}

      {generating && (
        <Flex gap="2" align="center">
          <Spinner />
          <Text size="2" color="gray">Writing the model answer. This takes about a minute the first time, then it's saved.</Text>
        </Flex>
      )}

      {a && !generating && (
        <>
          <Card size="3">
            <Text as="p">{a.approach}</Text>
            {a.structure?.length > 0 && (
              <Flex gap="2" wrap="wrap" mt="3">
                {a.structure.map((s, i) => <Badge key={i} variant="outline">{i + 1}. {s}</Badge>)}
              </Flex>
            )}
          </Card>

          {a.clarifyingQuestions?.length > 0 && (
            <Section title="Clarifying questions to ask">
              <Flex direction="column" gap="2">
                {a.clarifyingQuestions.map((c, i) => (
                  <Box key={i}>
                    <Text as="div" size="2" weight="medium">{c.question}</Text>
                    <Text as="div" size="2" color="gray">Assume: {c.assumedAnswer}</Text>
                  </Box>
                ))}
              </Flex>
            </Section>
          )}

          <Section title="Walkthrough">
            <Flex direction="column" gap="4">
              {a.walkthrough?.map((w, i) => (
                <Box key={i}>
                  <Text as="div" weight="medium" mb="1">{i + 1}. {w.step}</Text>
                  <Text as="p" size="2" className="model-say">{w.say}</Text>
                  <Text as="div" size="1" color="gray" mt="1">Why: {w.why}</Text>
                </Box>
              ))}
            </Flex>
          </Section>

          <Section title="Recommendation">
            <Text as="p" size="2">{a.recommendation}</Text>
          </Section>

          {a.metrics?.length > 0 && <Section title="Metrics"><List items={a.metrics} /></Section>}

          <Section title="Likely follow-ups">
            <Flex direction="column" gap="3">
              {a.followUps?.map((f, i) => (
                <Box key={i}>
                  <Text as="div" size="2" weight="medium">{f.question}</Text>
                  <Text as="div" size="2">{f.answer}</Text>
                </Box>
              ))}
            </Flex>
          </Section>

          <Section title="Common mistakes"><List items={a.pitfalls} /></Section>
          <Section title="Takeaways"><List items={a.takeaways} /></Section>

          <Text size="1" color="gray">Generated {formatDate(model.createdAt)}</Text>
        </>
      )}
    </Flex>
  );
}
