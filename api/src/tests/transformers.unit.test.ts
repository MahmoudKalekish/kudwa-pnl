import { transformJson1ToPeriodEntries, transformJson2ToPeriodEntries } from '../modules/pnl/utils/transformers';
import json1Sample from './fixtures/json1-sample.json';
import json2Sample from './fixtures/json2-sample.json';

describe('Transformers', () => {
  it('should transform JSON1 into period entries', () => {
    const result = transformJson1ToPeriodEntries(json1Sample);

    expect(result.length).toBeGreaterThan(0);
    expect(result[0]).toHaveProperty('companyId');
    expect(result[0]).toHaveProperty('lines');
    expect(result[0].lines.length).toBeGreaterThan(0);
  });

  it('should transform JSON2 into period entries', () => {
    const result = transformJson2ToPeriodEntries(json2Sample);

    expect(result.length).toBeGreaterThan(0);
    expect(result[0]).toHaveProperty('companyId');
    expect(result[0]).toHaveProperty('lines');
    const revenueLine = result[0].lines.find(l => l.category === 'revenue');
    expect(revenueLine).toBeDefined();
  });
});
