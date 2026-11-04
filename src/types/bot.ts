export enum BotStatus {
  IDLE = 'IDLE',
  INITIALIZING = 'INITIALIZING',
  EXECUTING = 'EXECUTING',
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
  CLEANUP = 'CLEANUP'
}

export interface BotState {
  status: BotStatus;
  successfulPurchase: boolean;
  lastError?: Error;
  attempts: number;
} 