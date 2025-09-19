import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '../errors';

export function errorHandler(err: any, _req: Request, res: Response<ApiResponse<unknown>>, _next: NextFunction) {
  const status = err.status || 500;
  const message = err.message || 'Unexpected error';
  res.status(status).json({ status: 'error', error: { message } });
}
