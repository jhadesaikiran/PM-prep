import { Box, Button, Card, Flex, Grid, Heading, Link as RadixLink, Table, Text } from '@radix-ui/themes';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import { CONCEPTS } from '../concepts.js';

export default function Concepts() {
  const navigate = useNavigate();

  return (
    <Flex direction="column" gap="5">
      <Box>
        <Heading size="6">Concepts</Heading>
        <Text color="gray" size="2">Quick cheatsheets for the moves every PM answer relies on.</Text>
      </Box>

      <Grid columns={{ initial: '1', sm: '2', md: '4' }} gap="3">
        {CONCEPTS.map((c) => (
          <Card key={c.id} asChild className="topic-card">
            <button onClick={() => navigate(`/concepts/${c.id}`)}>
              <Flex direction="column" gap="1">
                <Text weight="medium">{c.name}</Text>
                <Text size="2" color="gray">{c.description}</Text>
              </Flex>
            </button>
          </Card>
        ))}
      </Grid>
    </Flex>
  );
}

const anchor = (title) => title.toLowerCase().replace(/[^a-z0-9]+/g, '-');

export function Concept() {
  const { id } = useParams();
  const concept = CONCEPTS.find((c) => c.id === id);
  if (!concept) return <Navigate to="/concepts" replace />;

  return (
    <Flex direction="column" gap="5" className="cheatsheet">
      <Box>
        <RadixLink asChild size="2"><Link to="/concepts">← Concepts</Link></RadixLink>
        <Heading size="6" mt="2">{concept.name}</Heading>
        <Text color="gray" size="2">{concept.description}</Text>
        {concept.sections.length > 6 && (
          <Flex gap="2" wrap="wrap" mt="3">
            {concept.sections.map((s) => (
              <Button key={s.title} asChild size="1" variant="soft" color="gray">
                <a href={`#${anchor(s.title)}`}>{s.title}</a>
              </Button>
            ))}
          </Flex>
        )}
      </Box>

      {concept.sections.map((s) => (
        <Box key={s.title} id={anchor(s.title)} className="concept-section">
          <Heading size="3" mb="2">{s.title}</Heading>
          {s.points ? (
            <ul>
              {s.points.map((p) => <li key={p}><Text size="2">{p}</Text></li>)}
            </ul>
          ) : (
            <Table.Root variant="surface" size="1">
              <Table.Body>
                {s.rows.map(([label, detail]) => (
                  <Table.Row key={label}>
                    <Table.RowHeaderCell width="170px"><Text weight="medium">{label}</Text></Table.RowHeaderCell>
                    <Table.Cell><Text color="gray">{detail}</Text></Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table.Root>
          )}
        </Box>
      ))}
    </Flex>
  );
}
