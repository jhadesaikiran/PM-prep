import { useCallback, useEffect, useRef, useState } from 'react';

const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
export const speechSupported = Boolean(Recognition);

// Continuous dictation. Final phrases go to onFinal; the in-progress phrase is `interim`.
// The browser stops recognition after silence, so it restarts while `listening` is on.
export function useDictation(onFinal) {
  const [listening, setListening] = useState(false);
  const [interim, setInterim] = useState('');
  const recRef = useRef(null);
  const wantRef = useRef(false);
  const onFinalRef = useRef(onFinal);
  onFinalRef.current = onFinal;

  const start = useCallback(() => {
    if (!Recognition || wantRef.current) return;
    const rec = new Recognition();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = navigator.language || 'en-US';
    rec.onresult = (e) => {
      let pending = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const r = e.results[i];
        if (r.isFinal) onFinalRef.current(r[0].transcript.trim());
        else pending += r[0].transcript;
      }
      setInterim(pending);
    };
    rec.onerror = (e) => {
      if (e.error === 'not-allowed' || e.error === 'service-not-allowed') {
        wantRef.current = false;
        setListening(false);
      }
    };
    rec.onend = () => {
      setInterim('');
      if (wantRef.current) rec.start();
      else setListening(false);
    };
    recRef.current = rec;
    wantRef.current = true;
    rec.start();
    setListening(true);
  }, []);

  // discard=true drops any phrase still being recognised (used when the answer is sent).
  const stop = useCallback((discard = false) => {
    wantRef.current = false;
    if (discard) recRef.current?.abort();
    else recRef.current?.stop();
    setInterim('');
    setListening(false);
  }, []);

  useEffect(() => () => {
    wantRef.current = false;
    recRef.current?.abort();
  }, []);

  return { listening, interim, start, stop };
}
