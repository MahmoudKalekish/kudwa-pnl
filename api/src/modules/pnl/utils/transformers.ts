import dayjs from 'dayjs';
import { Category, Line } from '../models/pnlPeriod.model';

//
// ---------- Helpers ----------
//
function topToCategory(top: string): Category {
  const key = top.toLowerCase();
  if (key.includes('cost of goods')) return 'cogs';
  if (key.includes('cogs')) return 'cogs';
  if (key.includes('expense')) return 'opex';
  if (key.includes('revenue') || key.includes('income')) {
    if (key.includes('other')) return 'other_income';
    if (key.includes('total other income')) return 'other_income';
    return 'revenue';
  }
  if (key.includes('other expense')) return 'other_expense';
  return 'opex'; // fallback
}

function mkLine(
  path: string[],
  category: Category,
  value: number,
  accountId?: string | null,
  source?: 'json1' | 'json2'
): Line {
  return {
    path,
    pathKey: path.join('>'),
    category,
    value: Number(value || 0),
    accountId: accountId ?? undefined,
    source
  };
}

function safeDate(val?: string): Date | null {
  if (!val) return null;
  const d = dayjs(val);
  return d.isValid() ? d.toDate() : null;
}

function safeNumber(val: any): number {
  const num = Number(val);
  return isNaN(num) ? 0 : num;
}

//
// ---------- JSON2 (RootFi style) ----------
//
type Json2 = {
  data: Array<{
    rootfi_company_id?: number;
    period_start: string;     // "YYYY-MM-DD"
    period_end: string;
    currency_id?: string | null;
    revenue?: any[];
    cost_of_goods_sold?: any[];
    operating_expenses?: any[];
    gross_profit?: number;
  }>;
};

function traverseJson2Group(
  groupName: string,
  items: any[] | undefined,
  category: Category,
  prefixPath: string[] = []
): Line[] {
  if (!items || !Array.isArray(items)) return [];
  const lines: Line[] = [];

  for (const item of items) {
    const name = item?.name ?? 'Unknown';
    const value = safeNumber(item?.value);
    const accountId = item?.account_id ?? undefined;
    const path = [...prefixPath, groupName, name].filter(Boolean);

    lines.push(mkLine(path, category, value, accountId, 'json2'));

    // nested line_items
    if (Array.isArray(item?.line_items) && item.line_items.length > 0) {
      for (const child of item.line_items) {
        const childName = child?.name ?? 'Unknown';
        const childVal = safeNumber(child?.value);
        const childAcct = child?.account_id ?? undefined;
        const childPath = [...prefixPath, groupName, name, childName];

        lines.push(mkLine(childPath, category, childVal, childAcct, 'json2'));
      }
    }
  }
  return lines;
}

export function transformJson2ToPeriodEntries(payload: Json2) {
  const result: Array<{
    companyId: string;
    periodStart: Date;
    periodEnd: Date;
    currency: string;
    lines: Line[];
  }> = [];

  for (const rec of payload.data || []) {
    const companyId = String(rec.rootfi_company_id ?? 'company-unknown');
    const periodStart = dayjs(rec.period_start).startOf('day').toDate();
    const periodEnd = dayjs(rec.period_end).endOf('day').toDate();
    const currency = rec.currency_id || 'USD';

    const lines: Line[] = [];
    lines.push(...traverseJson2Group('Revenue', rec.revenue, 'revenue'));
    lines.push(...traverseJson2Group('Cost of Goods Sold', rec.cost_of_goods_sold, 'cogs'));
    lines.push(...traverseJson2Group('Operating Expenses', rec.operating_expenses, 'opex'));

    result.push({ companyId, periodStart, periodEnd, currency, lines });
  }

  return result;
}

//
// ---------- JSON1 (QuickBooks style) ----------
//
type Json1 = any;
type ColumnMeta = { key: string; start: string; end: string; idx: number };

function parseColumnsJson1(payload: Json1): ColumnMeta[] {
  const cols = payload?.data?.Columns?.Column || [];
  const metas: ColumnMeta[] = [];
  let idx = -1;

  for (const c of cols) {
    const colType = c?.ColType;
    if (colType === 'Account') {
      idx = 0;
      continue;
    }

    const start = c?.MetaData?.find((m: any) => m.Name === 'StartDate')?.Value ?? '';
    const end = c?.MetaData?.find((m: any) => m.Name === 'EndDate')?.Value ?? '';
    const key =
      c?.MetaData?.find((m: any) => m.Name === 'ColKey')?.Value ??
      c?.ColTitle ??
      `col-${metas.length}`;

    // skip invalid or "Total" columns
    if (!start || !end || key.toLowerCase() === 'total') continue;

    metas.push({ key, start, end, idx: metas.length + 1 }); // +1 because first column is account/title
  }
  return metas;
}

export function transformJson1ToPeriodEntries(payload: Json1) {
  const monthCols = parseColumnsJson1(payload);
  const header = payload?.data?.Header ?? {};
  const currency = header?.Currency || 'USD';
  const companyId = 'company-quickbooks';

  const rawRows = payload?.data?.Rows?.Row ?? [];
  const rows = Array.isArray(rawRows) ? rawRows : [rawRows];

  const finalResults: Array<{
    companyId: string;
    periodStart: Date;
    periodEnd: Date;
    currency: string;
    lines: Line[];
  }> = [];

  for (const m of monthCols) {
    const ps = safeDate(m.start);
    const pe = safeDate(m.end);
    if (!ps || !pe) continue;

    const monthLines: Line[] = [];

    function traverseForMonth(rows: any[], stackTitles: string[]) {
      for (const row of rows) {
        if (row?.Rows?.Row) {
          // Normalize again in recursion
          const subRows = Array.isArray(row.Rows.Row) ? row.Rows.Row : [row.Rows.Row];
          const headerTitle =
            row?.Header?.ColData?.[0]?.value ||
            row?.title ||
            row?.Summary?.ColData?.[0]?.value ||
            'Group';
          traverseForMonth(subRows, [...stackTitles, headerTitle]);
          continue;
        }

        if (row?.ColData && Array.isArray(row.ColData)) {
          const title = row.ColData?.[0]?.value || 'Account';
          const top = stackTitles[0] || title;
          const category = topToCategory(String(top));

          const cell = row.ColData?.[m.idx];
          if (!cell) continue;

          const raw = String(cell.value ?? cell?.Value ?? '0').replace(/[^0-9.-]/g, '');
          const value = Number(raw || 0);

          if (isNaN(value) || value === 0) continue;

          const path = [...stackTitles, title].filter(Boolean);
          monthLines.push(mkLine(path, category, value, undefined, 'json1'));
        }
      }
    }

    traverseForMonth(rows, []);

    finalResults.push({
      companyId,
      currency,
      periodStart: ps,
      periodEnd: pe,
      lines: monthLines
    });
  }

  return finalResults;
}

