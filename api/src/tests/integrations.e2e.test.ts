import { createApp } from '../app';
import request from 'supertest';

describe('Integrations API', () => {
  let app: ReturnType<typeof createApp>;

  beforeAll(() => {
    app = createApp();
  });

  it('POST /api/v1/integrations/json1 returns 200 or 400', async () => {
    const res = await request(app)
      .post('/api/v1/integrations/json1')
      .send({ data: { Columns: { Column: [] }, Rows: { Row: [] } } });

    expect([200, 400]).toContain(res.status);
  });

  it('POST /api/v1/integrations/json2 returns 200 or 400', async () => {
    const res = await request(app)
      .post('/api/v1/integrations/json2')
      .send({ data: [] });

    expect([200, 400]).toContain(res.status);
  });
});
