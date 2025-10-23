import { loadConfigFromObject, createLogger } from 'logify-node-sdk';

// Configure logger with proper logify-node-sdk configuration
const config = loadConfigFromObject({
  logLevel: (process.env.LOG_LEVEL as any) || "info",
  transport: (process.env.LOG_TRANSPORT as any) || "console",
  autoModule: true, // Automatically infer module names
  requestIdHeader: process.env.REQUEST_ID_HEADER || 'x-request-id',
  ctidHeader: process.env.CTID_HEADER || 'x-correlation-id',
});

const logify = createLogger(config);

export const logger = {
  // Info level logging
  info: (message: string, data?: any) => {
    logify.info(message, data);
  },

  // Error level logging
  error: (message: string, error?: Error | any, data?: any) => {
    logify.error(message, { error, ...data });
  },

  // Warning level logging
  warn: (message: string, data?: any) => {
    logify.warn(message, data);
  },

  // Debug level logging
  debug: (message: string, data?: any) => {
    logify.debug(message, data);
  },

  // Authentication logging
  auth: (action: string, userId?: string, data?: any) => {
    logify.info(`Auth: ${action}`, { 
      userId, 
      module: 'AuthController',
      ...data 
    });
  },

  // Database operation logging
  db: (operation: string, table: string, data?: any) => {
    logify.info(`DB: ${operation} on ${table}`, { 
      module: 'Database',
      operation,
      table,
      ...data 
    });
  },

  // API request logging
  api: (method: string, path: string, statusCode: number, duration?: number, data?: any) => {
    logify.info(`API: ${method} ${path}`, { 
      module: 'RequestLogger',
      method,
      path,
      statusCode, 
      duration: duration ? `${duration}ms` : undefined,
      ...data 
    });
  },

  // Security logging
  security: (event: string, data?: any) => {
    logify.warn(`Security: ${event}`, { 
      module: 'Security',
      ...data 
    });
  }
};

export default logger;
