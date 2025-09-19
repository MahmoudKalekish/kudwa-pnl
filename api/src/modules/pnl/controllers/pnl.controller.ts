import dayjs from 'dayjs';
import { Request, Response } from 'express';
import { ok } from '../../../common/http';
import { badRequest } from '../../../common/errors';
import { buildTree } from '../services/pnl.service';
import { listPeriods, getPeriod } from '../services/pnl.service';

export async function listPeriodsHandler(req: Request, res: Response) {
  const { companyId } = req.query as { companyId?: string };
  const data = await listPeriods(companyId);
  return ok(res, data);
}

export async function getPeriodTreeHandler(req: Request, res: Response) {
  const { companyId, periodStart } = req.query as { companyId?: string; periodStart?: string };
  if (!companyId || !periodStart) throw badRequest('companyId and periodStart are required (YYYY-MM-01)');
  const doc = await getPeriod(companyId, dayjs(periodStart).startOf('day').toDate());
  if (!doc) throw badRequest('Period not found');
  const tree = buildTree(doc.lines);
  return ok(res, { period: doc, tree });
}

export async function summarySeriesHandler(req: Request, res: Response) {
  const { companyId } = req.query as { companyId?: string };
  const periods = await listPeriods(companyId);
  const series = periods.map(p => ({
    periodStart: p.periodStart,
    revenue: p.totals.revenue,
    cogs: p.totals.cogs,
    opex: p.totals.opex,
    netIncome: p.totals.netIncome
  }));
  return ok(res, series);
}
