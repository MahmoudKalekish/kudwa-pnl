import { Button, Stack, LinearProgress, Alert } from '@mui/material';
import { useEffect, useRef, useState } from 'react';
import { useIngest } from '../api/hooks';

export default function IntegrationControls() {
  const [progress, setProgress] = useState<{phase:string;detail?:string;progress?:number} | null>(null);
  const evtRef = useRef<EventSource | null>(null);
  const ingest = useIngest();

  useEffect(() => {
    // Subscribe to SSE
    const base = import.meta.env.VITE_API_BASE?.replace('/api/v1', '') || 'http://localhost:4000';
    const es = new EventSource(`${base}/api/v1/integrations/events`);
    es.addEventListener('integration_progress', (e: MessageEvent) => {
      const data = JSON.parse(e.data);
      setProgress(data);
    });
    evtRef.current = es;
    return () => es.close();
  }, []);

  return (
    <Stack spacing={2} direction="column">
      <Stack direction="row" spacing={2}>
        <Button
          variant="contained"
          onClick={() => ingest.mutate({ source: 'json2', payload: window.__JSON2__ || {} })}
        >
          Run Integration (JSON2)
        </Button>
        <Button
          variant="outlined"
          onClick={() => ingest.mutate({ source: 'json1', payload: window.__JSON1__ || {} })}
        >
          Run Integration (JSON1)
        </Button>
      </Stack>
      {progress && (
        <>
          <LinearProgress variant="determinate" value={progress.progress ?? 0} />
          <Alert severity="info">{progress.phase}: {progress.detail}</Alert>
        </>
      )}
    </Stack>
  );
}
