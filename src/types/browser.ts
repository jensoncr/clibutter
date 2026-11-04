import { BrowserContext } from 'playwright';

export interface ExtendedBrowserContext extends BrowserContext {
  id?: string;
} 