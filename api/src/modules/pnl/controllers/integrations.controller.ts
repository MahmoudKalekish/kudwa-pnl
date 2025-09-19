import { Request, Response } from 'express';
import { ok } from '../../../common/http';
import { env } from '../../../config/env';
import { bus } from '../../../events/bus';
import { transformJson1ToPeriodEntries, transformJson2ToPeriodEntries } from '../utils/transformers';
import { upsertPeriod } from '../services/pnl.service';

export async function ingestJson1(req: Request, res: Response) {
  const payload = req.body;
  bus.emit('progress', { phase: 'start', detail: 'Parsing JSON1', progress: 10 });
  const entries = transformJson1ToPeriodEntries(payload);
  let count = 0;
  for (const e of entries) {
    await upsertPeriod({ ...e, source: 'json1', mergeStrategy: env.mergeStrategy });
    count++;
    bus.emit('progress', { phase: 'upsert', detail: `Saved month ${count}/${entries.length}`, progress: Math.round(10 + (count/entries.length)*80) });
  }
  bus.emit('progress', { phase: 'done', detail: 'JSON1 integration complete', progress: 100 });
  return ok(res, { ingested: count });
}

export async function ingestJson2(req: Request, res: Response) {
  const payload = req.body;
  bus.emit('progress', { phase: 'start', detail: 'Parsing JSON2', progress: 10 });
  const entries = transformJson2ToPeriodEntries(payload);
  let count = 0;
  for (const e of entries) {
    await upsertPeriod({ ...e, source: 'json2', mergeStrategy: env.mergeStrategy });
    count++;
    bus.emit('progress', { phase: 'upsert', detail: `Saved period ${count}/${entries.length}`, progress: Math.round(10 + (count/entries.length)*80) });
  }
  bus.emit('progress', { phase: 'done', detail: 'JSON2 integration complete', progress: 100 });
  return ok(res, { ingested: count });
}

export function sse(req: Request, res: Response) {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.flushHeaders?.();

  const onProgress = (evt: any) => {
    res.write(`event: integration_progress\n`);
    res.write(`data: ${JSON.stringify(evt)}\n\n`);
  };
  bus.on('progress', onProgress);

  req.on('close', () => {
    bus.off('progress', onProgress);
    res.end();
  });
}
