export interface BotConfig {
  productUrl: string;
  productName: string;
  timeoutMs: number;
  concurrent: number;
  headless: boolean;
  targetTime?: string;
} 