import { createApp, logger } from './app';
import { connectDB } from './db/connection';
import { env } from './config/env';

async function main() {
  await connectDB();
  const app = createApp();
  app.listen(env.port, () => {
    logger.info(`API listening on http://localhost:${env.port}`);
    logger.info(`Swagger UI: http://localhost:${env.port}/api/docs`);
  });
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
