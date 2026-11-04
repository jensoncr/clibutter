import { BrowserContext } from 'playwright';

export interface Config {
  productUrl: string;
  productName: string;
  targetTime?: string;
  concurrent: number;
  headless: boolean;
  timeoutMs: number;
  debug?: boolean;
  proxyList?: string[];
  userDataDir?: string;
}

export interface ProxyConfig {
  host: string;
  port: number;
  username?: string;
  password?: string;
}

export interface ExtendedBrowserContext extends BrowserContext {
  id: string;
  retryCount: number;
}

export interface ProductDetails {
  name: string;
  price: number;
  available: boolean;
  variant?: string;
}

export enum BotStatus {
  IDLE = 'idle',
  INITIALIZING = 'initializing',
  EXECUTING = 'executing',
  SUCCESS = 'success',
  FAILED = 'failed',
  CLEANUP = 'cleanup'
}

export interface BotState {
  status: BotStatus;
  attempts: number;
  successfulPurchase: boolean;
  lastError?: Error;
} 