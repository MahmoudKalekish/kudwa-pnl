import swaggerUi from 'swagger-ui-express';
import type { Express } from 'express';
import YAML from 'yamljs';
import path from 'path';

export function mountSwagger(app: Express) {
  const swaggerDocument = YAML.load(path.join(__dirname, 'swagger.yaml'));
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
}
