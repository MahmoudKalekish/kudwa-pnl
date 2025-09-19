import { Response } from 'express';
import { ApiResponse } from './errors';

export function ok<T>(res: Response<ApiResponse<T>>, data: T, meta?: Record<string, unknown>) {
  return res.json({ status: 'success', data, meta });
}
