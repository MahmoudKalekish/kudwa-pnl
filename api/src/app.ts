import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import pino from 'pino';
import pinoHttp from 'pino-http';
import 'express-async-errors';

import { env } from './config/env';
import { errorHandler } from './common/middlewares/errorHandler';
import { notFoundHandler } from './common/middlewares/notFound';
import routes from './modules/pnl/routes';
import { mountSwagger } from './docs/swagger';

export const logger = pino({ level: env.logLevel });

export function createApp() {
  const app = express();
  app.use(cors({ origin: env.corsOrigin }));
  app.use(helmet());
  app.use(compression());
  app.use(express.json({ limit: '50mb' }));
  app.use(pinoHttp({ logger }));

  app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));

  // API v1
  app.use('/api/v1', routes);

  // Swagger
  mountSwagger(app);

  app.use(notFoundHandler);
  app.use(errorHandler);
  return app;
}
