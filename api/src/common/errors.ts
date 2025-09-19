import createError from 'http-errors';

export function badRequest(msg: string) { return new createError.BadRequest(msg); }
export function notFound(msg: string) { return new createError.NotFound(msg); }
export function internal(msg: string) { return new createError.InternalServerError(msg); }

export type ApiResponse<T> = {
  status: 'success' | 'error';
  data?: T;
  error?: { message: string; code?: string };
  meta?: Record<string, unknown>;
};
