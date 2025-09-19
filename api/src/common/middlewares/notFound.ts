import { Request, Response } from 'express';
import { ApiResponse } from '../errors';

export function notFoundHandler(_req: Request, res: Response<ApiResponse<unknown>>) {
  res.status(404).json({ status: 'error', error: { message: 'Route not found' } });
}
