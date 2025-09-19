import { Router } from 'express';
import { ingestJson1, ingestJson2, sse } from './controllers/integrations.controller';
import { listPeriodsHandler, getPeriodTreeHandler, summarySeriesHandler } from './controllers/pnl.controller';

const r = Router();

// Integrations
r.post('/integrations/json1', ingestJson1);
r.post('/integrations/json2', ingestJson2);
r.get('/integrations/events', sse);

// Data access
r.get('/pnl/periods', listPeriodsHandler);
r.get('/pnl/tree', getPeriodTreeHandler);
r.get('/pnl/summary', summarySeriesHandler);

export default r;
