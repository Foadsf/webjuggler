export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'fatal';

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  source: string;
  message: string;
  data?: any;
  correlationId?: string;
}

class Logger {
  private static instance: Logger;
  private buffer: LogEntry[] = [];
  private readonly maxEntries = parseInt(import.meta.env.VITE_LOG_MAX_ENTRIES || '1000', 10);
  private listeners: ((entry: LogEntry) => void)[] = [];
  private isDev = import.meta.env.DEV;
  private debugMode = import.meta.env.VITE_DEBUG_MODE === 'true';

  private constructor() {}

  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  private sanitize(data: any): any {
    if (!data) return data;
    
    // Stringify and parse to clone and handle basic recursion
    let sanitized;
    try {
      sanitized = JSON.parse(JSON.stringify(data));
    } catch (e) {
      return '[Non-serializable data]';
    }

    const walk = (obj: any) => {
      if (typeof obj !== 'object' || obj === null) return;

      for (const key in obj) {
        // Redact paths (basic Windows/Unix path pattern)
        if (typeof obj[key] === 'string') {
          obj[key] = obj[key].replace(/[a-zA-Z]:\\[^\s]+/g, '<PATH>');
          obj[key] = obj[key].replace(/\/[^\s]+\/[^\s]+/g, '<PATH>');
        }

        // Mask API keys
        if (key.toLowerCase().includes('api_key') || key.toLowerCase().includes('secret')) {
          obj[key] = '********';
        }

        // Truncate large arrays
        if (Array.isArray(obj[key]) && obj[key].length > 100) {
          obj[key] = [...obj[key].slice(0, 100), `... and ${obj[key].length - 100} more items`];
        }

        walk(obj[key]);
      }
    };

    walk(sanitized);
    return sanitized;
  }

  private async writeToFile(entry: LogEntry) {
    if (!this.isDev || import.meta.env.VITE_LOG_TO_FILE !== 'true') return;

    // In a browser environment, we can't directly use 'fs'.
    // If this was an Electron app or had a specific dev-server proxy, we would use it.
    // For now, we'll attempt a dynamic import which will only work in Node-like environments.
    if (typeof window === 'undefined' || (window as any).process?.versions?.node) {
       try {
         // @ts-ignore - Dynamic import of node modules
         const fs = await import('node:fs');
         // @ts-ignore
         const path = await import('node:path');
         const logDir = path.join(process.cwd(), 'logs');
         if (!fs.existsSync(logDir)) {
           fs.mkdirSync(logDir);
         }
         const date = new Date().toISOString().split('T')[0];
         const fileName = `webjuggler-${date}.jsonl`;
         const filePath = path.join(logDir, fileName);
         fs.appendFileSync(filePath, JSON.stringify(entry) + '\n');
       } catch (e) {
         // Silently fail if fs is not available or errors out
       }
    }
  }

  private log(level: LogLevel, source: string, message: string, data?: any, correlationId?: string) {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      source,
      message,
      data: this.sanitize(data),
      correlationId,
    };

    // Buffer management
    this.buffer.push(entry);
    if (this.buffer.length > this.maxEntries) {
      this.buffer.shift();
    }

    // Console output
    if (this.isDev || this.debugMode || level === 'error' || level === 'fatal') {
      const color = {
        debug: 'color: gray',
        info: 'color: blue',
        warn: 'color: orange',
        error: 'color: red',
        fatal: 'color: red; font-weight: bold',
      }[level];
      
      console.log(`%c[${entry.timestamp}] [${level.toUpperCase()}] [${source}] ${message}`, color, data || '');
    }

    // Notify listeners
    this.listeners.forEach(l => l(entry));

    // Async file write
    this.writeToFile(entry);
  }

  public debug(source: string, message: string, data?: any, correlationId?: string) {
    this.log('debug', source, message, data, correlationId);
  }

  public info(source: string, message: string, data?: any, correlationId?: string) {
    this.log('info', source, message, data, correlationId);
  }

  public warn(source: string, message: string, data?: any, correlationId?: string) {
    this.log('warn', source, message, data, correlationId);
  }

  public error(source: string, message: string, data?: any, correlationId?: string) {
    this.log('error', source, message, data, correlationId);
  }

  public fatal(source: string, message: string, data?: any, correlationId?: string) {
    this.log('fatal', source, message, data, correlationId);
  }

  public subscribe(listener: (entry: LogEntry) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  public getBuffer(): LogEntry[] {
    return [...this.buffer];
  }

  public clearBuffer() {
    this.buffer = [];
  }
}

export const logger = Logger.getInstance();

export function useLogger(source: string) {
  return {
    debug: (msg: string, data?: any, cid?: string) => logger.debug(source, msg, data, cid),
    info: (msg: string, data?: any, cid?: string) => logger.info(source, msg, data, cid),
    warn: (msg: string, data?: any, cid?: string) => logger.warn(source, msg, data, cid),
    error: (msg: string, data?: any, cid?: string) => logger.error(source, msg, data, cid),
    fatal: (msg: string, data?: any, cid?: string) => logger.fatal(source, msg, data, cid),
  };
}
