import { Box, Callout, Flex, Heading, Table, Text } from '@radix-ui/themes';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, formatDate } from '../api.js';

export default function Study() {
  const navigate = useNavigate();
  const [books, setBooks] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    api.books().then(setBooks).catch((e) => setError(e.message));
  }, []);

  return (
    <Flex direction="column" gap="5">
      <Box>
        <Heading size="6">Study</Heading>
        <Text color="gray" size="2">Case books from the casebooks folder. Each one opens where you left off.</Text>
      </Box>

      {error && <Callout.Root color="red"><Callout.Text>{error}</Callout.Text></Callout.Root>}

      <Table.Root variant="surface">
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeaderCell>Book</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell width="160px">Progress</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell width="150px">Last read</Table.ColumnHeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {books.map((b) => (
            <Table.Row key={b.file} className="clickable-row" onClick={() => navigate(`/study/${encodeURIComponent(b.file)}`)}>
              <Table.Cell>{b.title}</Table.Cell>
              <Table.Cell>
                {b.page ? <Text>Page {b.page} of {b.pages}</Text> : <Text color="gray">Not started</Text>}
              </Table.Cell>
              <Table.Cell><Text color="gray">{b.updatedAt ? formatDate(b.updatedAt) : ''}</Text></Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>
    </Flex>
  );
}
