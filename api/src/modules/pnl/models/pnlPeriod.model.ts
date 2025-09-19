import mongoose, { Schema } from 'mongoose';

export type Category =
  | 'revenue'
  | 'cogs'
  | 'opex'
  | 'other_income'
  | 'other_expense';

export interface Line {
  path: string[];            // e.g. ["Revenue", "Professional Income", "Technical Service"]
  pathKey: string;           // "Revenue>Professional Income>Technical Service"
  category: Category;
  value: number;             // numeric value for the period (positive numbers)
  accountId?: string | null; // if provided by source
  source?: 'json1' | 'json2';
}

export interface PnLPeriod {
  companyId: string;
  periodStart: Date;         // inclusive
  periodEnd: Date;           // inclusive
  currency: string;
  lines: Line[];             // flattened lines
  totals: {
    revenue: number;
    cogs: number;
    grossProfit: number;
    opex: number;
    operatingIncome: number;
    otherIncome: number;
    otherExpense: number;
    netIncome: number;
  };
  sources: {
    json1?: { importedAt: Date };
    json2?: { importedAt: Date };
  };
}

const LineSchema = new Schema<Line>({
  path: { type: [String], required: true },
  pathKey: { type: String, required: true, index: true },
  category: { type: String, required: true },
  value: { type: Schema.Types.Mixed, required: true },
  accountId: { type: String, required: false },
  source: { type: String, enum: ['json1', 'json2'], required: false }
}, { _id: false });

const PnLPeriodSchema = new Schema<PnLPeriod>({
  companyId: { type: String, required: true, index: true },
  periodStart: { type: Date, required: true, index: true },
  periodEnd: { type: Date, required: true },
  currency: { type: String, required: true, default: 'USD' },
  lines: { type: [LineSchema], default: [] },
  totals: {
    revenue: { type: Number, default: 0 },
    cogs: { type: Number, default: 0 },
    grossProfit: { type: Number, default: 0 },
    opex: { type: Number, default: 0 },
    operatingIncome: { type: Number, default: 0 },
    otherIncome: { type: Number, default: 0 },
    otherExpense: { type: Number, default: 0 },
    netIncome: { type: Number, default: 0 }
  },
  sources: {
    json1: { importedAt: { type: Date } },
    json2: { importedAt: { type: Date } }
  }
}, { timestamps: true });

PnLPeriodSchema.index({ companyId: 1, periodStart: 1 }, { unique: true });

export const PnLPeriodModel = mongoose.model<PnLPeriod>('PnLPeriod', PnLPeriodSchema);
