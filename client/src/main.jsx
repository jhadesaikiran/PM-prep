import '@radix-ui/themes/styles.css';
import './styles.css';
import { Theme } from '@radix-ui/themes';
import { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Link, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { Box, Container, Flex, TabNav, Text } from '@radix-ui/themes';
import InterviewsHome from './pages/InterviewsHome.jsx';
import Interview from './pages/Interview.jsx';
import ModelAnswer from './pages/ModelAnswer.jsx';
import Reader from './pages/Reader.jsx';
import Study from './pages/Study.jsx';
import Concepts, { Concept } from './pages/Concepts.jsx';
import Companies, { Company } from './pages/Companies.jsx';
import ResumeGrilling from './pages/ResumeGrilling.jsx';

function useSystemAppearance() {
  const query = window.matchMedia('(prefers-color-scheme: dark)');
  const [dark, setDark] = useState(query.matches);
  useEffect(() => {
    const onChange = (e) => setDark(e.matches);
    query.addEventListener('change', onChange);
    return () => query.removeEventListener('change', onChange);
  }, []);
  return dark ? 'dark' : 'light';
}

const NAV = [
  { to: '/interviews', label: 'Mock Interviews' },
  { to: '/resume', label: 'Resume Grilling' },
  { to: '/study', label: 'Study' },
  { to: '/concepts', label: 'Concepts' },
  { to: '/companies', label: 'Companies' },
];

function Layout({ children }) {
  const { pathname } = useLocation();
  return (
    <>
      <Box className="topbar">
        <Container size="4" px="4">
          <Flex align="center" gap="5">
            <Text weight="bold" size="3">PM Prep</Text>
            <TabNav.Root>
              {NAV.map((n) => (
                <TabNav.Link key={n.to} asChild active={pathname.startsWith(n.to)}>
                  <Link to={n.to}>{n.label}</Link>
                </TabNav.Link>
              ))}
            </TabNav.Root>
          </Flex>
        </Container>
      </Box>
      <Container size="4" px="4" py="6">
        {children}
      </Container>
    </>
  );
}

function App() {
  return (
    <Theme appearance={useSystemAppearance()} accentColor="indigo" grayColor="slate" radius="medium">
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Navigate to="/interviews" replace />} />
            <Route path="/interviews" element={<InterviewsHome />} />
            <Route path="/interviews/:id" element={<Interview />} />
            <Route path="/interviews/questions/:qid" element={<ModelAnswer />} />
            <Route path="/resume" element={<ResumeGrilling />} />
            <Route path="/study" element={<Study />} />
            <Route path="/study/:file" element={<Reader />} />
            <Route path="/concepts" element={<Concepts />} />
            <Route path="/concepts/:id" element={<Concept />} />
            <Route path="/companies" element={<Companies />} />
            <Route path="/companies/:slug" element={<Company />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </Theme>
  );
}

createRoot(document.getElementById('root')).render(<App />);
