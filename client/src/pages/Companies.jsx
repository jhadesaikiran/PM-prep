import { Badge, Box, Button, Card, Flex, Grid, Heading, Link as RadixLink, Table, Text } from '@radix-ui/themes';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import { DOMAINS, PDF_URL, domainOf, getCompany, pdfPage } from '../companies.js';

const GROUP_COLORS = ['red', 'amber', 'violet', 'teal'];

export default function Companies() {
  const navigate = useNavigate();
  const total = DOMAINS.reduce((n, d) => n + d.companies.filter((c) => !c.crossRef).length, 0);

  return (
    <Flex direction="column" gap="6">
      <Flex justify="between" align="end" gap="3" wrap="wrap">
        <Box>
          <Heading size="6">Companies</Heading>
          <Text color="gray" size="2">
            One-page teardowns of {total} products by industry: strategy, users, metrics, business model, competition and news.
          </Text>
        </Box>
        <Button asChild variant="soft">
          <a href={PDF_URL} target="_blank" rel="noreferrer">Open all as PDF</a>
        </Button>
      </Flex>

      {DOMAINS.map((d) => (
        <Box key={d.name}>
          <Heading size="3" mb="2">{d.name}</Heading>
          <Grid columns={{ initial: '1', sm: '2', md: '3' }} gap="3">
            {d.companies.map(({ company: c, crossRef }) => (
              <Card key={c.slug} asChild className="topic-card">
                <button onClick={() => navigate(`/companies/${c.slug}`)}>
                  <Flex direction="column" gap="1">
                    <Flex gap="2" align="center">
                      <Text weight="medium">{c.name}</Text>
                      {crossRef && <Badge color="gray" size="1">in {domainOf(c.slug)}</Badge>}
                    </Flex>
                    <Text size="2" color="gray">{c.tagline}</Text>
                  </Flex>
                </button>
              </Card>
            ))}
          </Grid>
        </Box>
      ))}
    </Flex>
  );
}

const Labelled = ({ items }) => (
  <ul>
    {items.map((i) => (
      <li key={i.label + i.text}><Text size="2"><Text weight="bold">{i.label}:</Text> {i.text}</Text></li>
    ))}
  </ul>
);

function Section({ title, children }) {
  return (
    <Box>
      <Heading size="4" mb="2" className="section-title">{title}</Heading>
      {children}
    </Box>
  );
}

export function Company() {
  const { slug } = useParams();
  const c = getCompany(slug);
  if (!c) return <Navigate to="/companies" replace />;
  const bm = c.business_model;

  return (
    <Flex direction="column" gap="5" className="teardown">
      <Box>
        <Flex justify="between" align="center" gap="3" wrap="wrap">
          <RadixLink asChild size="2"><Link to="/companies">← Companies · {domainOf(slug)}</Link></RadixLink>
          <RadixLink size="2" href={`${PDF_URL}#page=${pdfPage(slug)}`} target="_blank" rel="noreferrer">
            Open PDF page {pdfPage(slug)}
          </RadixLink>
        </Flex>
        <Flex align="baseline" gap="3" wrap="wrap" mt="2">
          <Heading size="8">{c.name}</Heading>
          <Text color="gray" size="3">{c.tagline}</Text>
        </Flex>
        <Box className="facts" mt="3">
          {c.facts.map(([k, v]) => (
            <Text key={k} size="2"><Text color="gray">{k}:</Text> <Text weight="medium">{v}</Text></Text>
          ))}
        </Box>
      </Box>

      <Section title="Mission, vision and strategy">
        <Box className="two-col"><Labelled items={c.strategy} /></Box>
      </Section>

      <Section title="Customers and users">
        <Table.Root variant="surface" size="1">
          <Table.Header>
            <Table.Row>
              <Table.ColumnHeaderCell>Segment</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Who</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Pain point</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Why they choose {c.name}</Table.ColumnHeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {c.customers.map((r) => (
              <Table.Row key={r.segment}>
                <Table.RowHeaderCell><Text weight="medium">{r.segment}</Text></Table.RowHeaderCell>
                <Table.Cell><Text color="gray">{r.who}</Text></Table.Cell>
                <Table.Cell>{r.pain}</Table.Cell>
                <Table.Cell><Text color="green">{r.why}</Text></Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Root>
      </Section>

      <Section title="Product portfolio and metrics">
        <Grid columns={{ initial: '1', md: '2' }} gap="3">
          {c.portfolio.map((g, i) => {
            const color = GROUP_COLORS[i % GROUP_COLORS.length];
            return (
              <Card key={g.group} className="group-card" style={{ '--group': `var(--${color}-9)` }}>
                <Heading size="3" mb="2" color={color}>{g.group}</Heading>
                <Table.Root size="1">
                  <Table.Body>
                    {g.products.map((p) => (
                      <Table.Row key={p.name}>
                        <Table.RowHeaderCell width="34%"><Text weight="medium">{p.name}</Text></Table.RowHeaderCell>
                        <Table.Cell>{p.desc}</Table.Cell>
                      </Table.Row>
                    ))}
                    {[['North Star', g.north_star], ['Key metrics', g.key_metrics], ['Guardrails', g.guardrails]].map(([k, v]) => (
                      <Table.Row key={k} className="metric-row">
                        <Table.RowHeaderCell><Text weight="bold" color={color}>{k}</Text></Table.RowHeaderCell>
                        <Table.Cell>{v}</Table.Cell>
                      </Table.Row>
                    ))}
                  </Table.Body>
                </Table.Root>
              </Card>
            );
          })}
        </Grid>
      </Section>

      <Section title="Business model">
        <Table.Root variant="surface" size="1">
          <Table.Header>
            <Table.Row>
              <Table.ColumnHeaderCell>Line</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Who uses</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Who pays</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>How they pay</Table.ColumnHeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {bm.rows.map((r) => (
              <Table.Row key={r.line}>
                <Table.RowHeaderCell><Text weight="medium">{r.line}</Text></Table.RowHeaderCell>
                <Table.Cell>{r.who_uses}</Table.Cell>
                <Table.Cell>{r.who_pays}</Table.Cell>
                <Table.Cell>{r.how}</Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Root>
        <Box className="two-col" mt="3"><Labelled items={bm.bullets} /></Box>
      </Section>

      <Grid columns={{ initial: '1', md: '3' }} gap="5">
        <Section title="Friction points to discuss">
          <ul>{c.friction.map((f) => <li key={f}><Text size="2">{f}</Text></li>)}</ul>
        </Section>
        <Section title="Competitors and market"><Labelled items={c.competitors} /></Section>
        <Section title="Recent news and direction"><Labelled items={c.news} /></Section>
      </Grid>

      <Text size="1" color="gray">Sources: {c.sources}</Text>
    </Flex>
  );
}
