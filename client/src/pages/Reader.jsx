import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import { ChevronLeftIcon, ChevronRightIcon, MinusIcon, PlusIcon } from '@radix-ui/react-icons';
import { Box, Button, Callout, Flex, IconButton, Spinner, Text, TextField, Tooltip } from '@radix-ui/themes';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { Link, useParams } from 'react-router-dom';
import { api } from '../api.js';

pdfjs.GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url).toString();

const ZOOM_KEY = 'pm-prep:zoom';
const ZOOM_MIN = 0.5;
const ZOOM_MAX = 3;
const GAP = 16;
const RENDER_AHEAD = 2; // pages rendered above and below the visible ones

// Zoom 1 = page fits the reading column width.
function loadZoom() {
  const z = parseFloat(localStorage.getItem(ZOOM_KEY));
  return z >= ZOOM_MIN && z <= ZOOM_MAX ? z : 1;
}

export default function Reader() {
  const file = decodeURIComponent(useParams().file);
  const [savedPage, setSavedPage] = useState(null);
  const [ratios, setRatios] = useState([]); // height / width per page
  const [page, setPage] = useState(1);
  const [pageInput, setPageInput] = useState('1');
  const [zoom, setZoom] = useState(loadZoom);
  const [width, setWidth] = useState(800);
  const [error, setError] = useState('');
  const viewRef = useRef(null);
  const anchorRef = useRef(null); // page to keep in view after a layout change
  const currentPageRef = useRef(null);
  const pages = ratios.length;
  const pageWidth = width * zoom;

  useEffect(() => {
    api
      .books()
      .then((books) => setSavedPage(books.find((b) => b.file === file)?.page || 1))
      .catch((e) => setError(e.message));
  }, [file]);

  useEffect(() => {
    const el = viewRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      anchorRef.current ??= currentPageRef.current?.();
      setWidth(Math.min(entry.contentRect.width, 1000));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [savedPage === null]);

  // Top offset of each page inside the scroll area.
  const tops = [];
  let y = 0;
  for (const r of ratios) {
    tops.push(y);
    y += pageWidth * r + GAP;
  }

  function currentPage() {
    const el = viewRef.current;
    if (!el || !tops.length) return page;
    const mark = el.scrollTop + el.clientHeight / 3;
    let p = 1;
    while (p < tops.length && tops[p] <= mark) p++;
    return p;
  }
  currentPageRef.current = currentPage;

  // After zoom/resize or the first load, scroll so the anchored page stays in view.
  useLayoutEffect(() => {
    if (anchorRef.current && tops.length) {
      viewRef.current.scrollTop = tops[anchorRef.current - 1];
      anchorRef.current = null;
    }
  }, [pageWidth, pages]);

  // Save progress shortly after the page settles.
  useEffect(() => {
    setPageInput(String(page));
    if (!pages) return;
    const t = setTimeout(() => api.saveProgress(file, { page, pages }), 600);
    return () => clearTimeout(t);
  }, [file, page, pages]);

  const onScroll = () => setPage(currentPage());

  const goTo = (n) => {
    if (!pages) return;
    const p = Math.min(Math.max(1, n), pages);
    viewRef.current.scrollTop = tops[p - 1];
    setPage(p);
  };

  const changeZoom = (z) => {
    const next = Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, Math.round(z * 10) / 10));
    anchorRef.current = currentPage();
    setZoom(next);
    localStorage.setItem(ZOOM_KEY, String(next));
  };

  useEffect(() => {
    const onKey = (e) => {
      if (e.target.tagName === 'INPUT') return;
      if (e.key === 'ArrowRight') goTo(page + 1);
      else if (e.key === 'ArrowLeft') goTo(page - 1);
      else if (e.key === '+' || e.key === '=') changeZoom(zoom + 0.1);
      else if (e.key === '-') changeZoom(zoom - 0.1);
      else return;
      e.preventDefault();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  async function onLoad(pdf) {
    const sizes = await Promise.all(
      Array.from({ length: pdf.numPages }, (_, i) =>
        pdf.getPage(i + 1).then((p) => {
          const [, , w, h] = p.view;
          return p.rotate % 180 ? w / h : h / w;
        }),
      ),
    );
    anchorRef.current = Math.min(savedPage, sizes.length);
    setPage(anchorRef.current);
    setRatios(sizes);
  }

  if (error) return <Callout.Root color="red"><Callout.Text>{error}</Callout.Text></Callout.Root>;
  if (savedPage === null) return <Spinner />;

  return (
    <Flex direction="column" gap="3">
      <Flex justify="between" align="center" gap="4" wrap="wrap">
        <Flex gap="2" align="center" minWidth="0">
          <Link to="/study"><Text size="2" color="gray">Study</Text></Link>
          <Text size="2" color="gray">/</Text>
          <Text size="2" weight="medium" truncate>{file.replace(/\.pdf$/i, '')}</Text>
        </Flex>

        <Flex gap="4" align="center">
          <Flex gap="1" align="center">
            <IconButton variant="soft" color="gray" onClick={() => goTo(page - 1)} disabled={page <= 1}>
              <ChevronLeftIcon />
            </IconButton>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const n = parseInt(pageInput, 10);
                if (n) goTo(n);
                else setPageInput(String(page));
              }}
            >
              <TextField.Root
                value={pageInput}
                onChange={(e) => setPageInput(e.target.value.replace(/\D/g, ''))}
                onBlur={() => setPageInput(String(page))}
                style={{ width: 56, textAlign: 'center' }}
                aria-label="Page number"
              />
            </form>
            <Text size="2" color="gray">of {pages || '…'}</Text>
            <IconButton variant="soft" color="gray" onClick={() => goTo(page + 1)} disabled={page >= pages}>
              <ChevronRightIcon />
            </IconButton>
          </Flex>

          <Flex gap="1" align="center">
            <IconButton variant="soft" color="gray" onClick={() => changeZoom(zoom - 0.1)} disabled={zoom <= ZOOM_MIN}>
              <MinusIcon />
            </IconButton>
            <Text size="2" style={{ width: 44, textAlign: 'center' }}>{Math.round(zoom * 100)}%</Text>
            <IconButton variant="soft" color="gray" onClick={() => changeZoom(zoom + 0.1)} disabled={zoom >= ZOOM_MAX}>
              <PlusIcon />
            </IconButton>
            <Tooltip content="Fit to width">
              <Button variant="ghost" color="gray" onClick={() => changeZoom(1)}>Fit</Button>
            </Tooltip>
          </Flex>
        </Flex>
      </Flex>

      <Box ref={viewRef} className="pdf-view" onScroll={onScroll}>
        <Document file={api.bookUrl(file)} onLoadSuccess={onLoad} onLoadError={(e) => setError(e.message)} loading={<Spinner />}>
          {ratios.map((r, i) => {
            const n = i + 1;
            const near = Math.abs(n - page) <= RENDER_AHEAD + Math.ceil((viewRef.current?.clientHeight || 0) / (pageWidth * r));
            return (
              <div key={n} className="pdf-page" style={{ width: pageWidth, height: pageWidth * r, marginBottom: GAP }}>
                {near && <Page pageNumber={n} width={pageWidth} loading={null} />}
              </div>
            );
          })}
        </Document>
      </Box>
    </Flex>
  );
}
