import { Response } from 'express';
import { ApiResponse } from '../types';

export function successResponse<T>(
  res: Response,
  data: T,
  message = 'Success',
  statusCode = 200,
): Response {
  const body: ApiResponse<T> = { success: true, data, message };
  return res.status(statusCode).json(body);
}

export function errorResponse(
  res: Response,
  message: string,
  statusCode = 400,
  errors?: string[],
): Response {
  const body: ApiResponse = { success: false, message, ...(errors && { errors }) };
  return res.status(statusCode).json(body);
}
