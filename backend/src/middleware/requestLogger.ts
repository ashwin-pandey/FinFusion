import { Request, Response, NextFunction } from 'express';
import { createExpressMiddleware, loadConfigFromObject } from 'logify-node-sdk';

// Create the Express middleware for request context tracking
const config = loadConfigFromObject({
  logLevel: (process.env.LOG_LEVEL as any) || "info",
  transport: (process.env.LOG_TRANSPORT as any) || "console",
  autoModule: true,
  requestIdHeader: process.env.REQUEST_ID_HEADER || 'x-request-id',
  ctidHeader: process.env.CTID_HEADER || 'x-correlation-id',
});

export const requestLogger = createExpressMiddleware(config);
