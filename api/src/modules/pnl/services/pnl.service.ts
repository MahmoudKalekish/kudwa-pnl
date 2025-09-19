import { PnLPeriodModel, Line, Category } from '../models/pnlPeriod.model';

function sumBy(lines: Line[], category: Category) {
  return lines.filter(l => l.category === category).reduce((a, b) => a + b.value, 0);
}

function recomputeTotals(lines: Line[]) {
  const revenue = sumBy(lines, 'revenue');
  const cogs = sumBy(lines, 'cogs');
  const grossProfit = revenue - cogs;
  const opex = sumBy(lines, 'opex');
  const operatingIncome = grossProfit - opex;
  const otherIncome = sumBy(lines, 'other_income');
  const otherExpense = sumBy(lines, 'other_expense');
  const netIncome = operatingIncome + otherIncome - otherExpense;
  return { revenue, cogs, grossProfit, opex, operatingIncome, otherIncome, otherExpense, netIncome };
}

type MergeStrategy = 'sum' | 'prefer-json1' | 'prefer-json2';
function mergeLines(existing: Line[], incoming: Line[], strategy: MergeStrategy): Line[] {
  const map = new Map<string, Line>();
  for (const l of existing) map.set(`${l.pathKey}|${l.accountId ?? ''}|${l.category}`, { ...l });

  for (const inc of incoming) {
    const key = `${inc.pathKey}|${inc.accountId ?? ''}|${inc.category}`;
    const cur = map.get(key);
    if (!cur) { map.set(key, { ...inc }); continue; }
    if (strategy === 'sum') {
      map.set(key, { ...cur, value: cur.value + inc.value });
    } else if (strategy === 'prefer-json1') {
      map.set(key, inc.source === 'json1' ? { ...inc } : cur);
    } else if (strategy === 'prefer-json2') {
      map.set(key, inc.source === 'json2' ? { ...inc } : cur);
    }
  }
  return [...map.values()];
}

export async function upsertPeriod(
  params: { companyId: string; periodStart: Date; periodEnd: Date; currency: string; source: 'json1'|'json2'; lines: Line[]; mergeStrategy: MergeStrategy }
) {
  const { companyId, periodStart, periodEnd, currency, source, lines, mergeStrategy } = params;
  const existing = await PnLPeriodModel.findOne({ companyId, periodStart });
  if (!existing) {
    const totals = recomputeTotals(lines);
    const sources = { [source]: { importedAt: new Date() } } as any;
    return PnLPeriodModel.create({ companyId, periodStart, periodEnd, currency, lines, totals, sources });
  }
  const mergedLines = mergeLines(existing.lines, lines, mergeStrategy);
  const totals = recomputeTotals(mergedLines);
  existing.lines = mergedLines;
  existing.periodEnd = periodEnd;
  existing.currency = currency;
  existing.totals = totals;
  (existing.sources as any)[source] = { importedAt: new Date() };
  await existing.save();
  return existing;
}

export async function listPeriods(companyId?: string) {
  const q: any = {};
  if (companyId) q.companyId = companyId;
  return PnLPeriodModel.find(q).sort({ periodStart: 1 }).select('-__v');
}

export async function getPeriod(companyId: string, periodStart: Date) {
  return PnLPeriodModel.findOne({ companyId, periodStart }).select('-__v');
}

export function buildTree(lines: Line[]) {
  // transform flat lines into nested nodes { name, value, children[] }
  type Node = { name: string; value: number; children: Record<string, Node> };
  const root: Node = { name: 'root', value: 0, children: {} };

  // Build the tree
  for (const l of lines) {
    let cur = root;
    for (const part of l.path) {
      if (!cur.children[part]) {
        cur.children[part] = { name: part, value: 0, children: {} };
      }
      cur = cur.children[part];
    }
    cur.value = (cur.value || 0) + l.value; // leaf node
  }

  // Convert to array and propagate child totals upwards
  function toArray(n: Node): any[] {
    return Object.values(n.children).map((child) => {
      const childrenArray = toArray(child);
      const totalValue =
        (child.value || 0) +
        childrenArray.reduce((sum, c) => sum + (c.value || 0), 0);

      return {
        name: child.name,
        value: totalValue, // parent includes sum of children
        children: childrenArray,
      };
    });
  }

  return toArray(root);
}
