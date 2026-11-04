import { Browser, BrowserContext, Page } from 'playwright';
import { BotState, BotStatus } from '../utils/types';
import { BrowserManager } from './browser';
import { getOptimizedLaunchArgs } from '../utils/window';
import log from '../utils/logger';
import { BotConfig } from '../types/config';
import { ExtendedBrowserContext } from '../types/browser';

export class ButterBot {
  private state: BotState;
  private config: BotConfig;
  public browserManager: BrowserManager;
  private shouldCleanup: boolean = false;

  constructor(config: BotConfig) {
    this.config = config;
    this.state = {
      status: BotStatus.IDLE,
      successfulPurchase: false,
      lastError: undefined,
      attempts: 0
    };
    this.browserManager = new BrowserManager(config);
  }

  public async execute(): Promise<void> {
    try {
      log.info('INITIALIZING: BOT READY');
      log.info('MONITORING: STARTING PRODUCT WATCH');

      while (!this.shouldCleanup && !this.state.successfulPurchase) {
        const context = await this.browserManager.createContext();
        const page = await context.newPage();
        
        try {
          // Set default timeout for all operations
          page.setDefaultTimeout(5000);
          
          // Enable request interception to block unnecessary resources
          await page.route('**/*', async route => {
            const request = route.request();
            const resourceType = request.resourceType();
            if (resourceType === 'image' || resourceType === 'font' || resourceType === 'media') {
              await route.abort();
            } else if (resourceType === 'stylesheet') {
              await route.continue({
                headers: {
                  ...request.headers(),
                  'Accept': 'text/css'
                }
              });
            } else {
              await route.continue();
            }
          });

          await this.browserManager.navigateToPage(page);
          const success = await this.executePurchaseAttempt(page, context);
          this.state.attempts++;
          
          if (success) {
            this.state.successfulPurchase = true;
            this.state.status = BotStatus.SUCCESS;
            log.info('MONITORING: PURCHASE SUCCESSFUL - KEEPING WINDOW OPEN');
            // Keep the window open but stop monitoring
            break;
          } else {
            await context.close();
            // Reduced retry delay
            await new Promise(resolve => setTimeout(resolve, 500));
          }
        } catch (error) {
          log.error('ERROR: PAGE LOAD FAILED:', error as Error);
          await context.close();
          // Minimal delay on error
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }
    } catch (error) {
      log.error('ERROR: BOT EXECUTION FAILED:', error as Error);
      this.state.status = BotStatus.FAILED;
      this.state.lastError = error as Error;
      await this.cleanup();
    }
  }

  private async executePurchaseAttempt(page: Page, context: ExtendedBrowserContext): Promise<boolean> {
    try {
      await this.browserManager.selectProduct(page);
      const success = await this.browserManager.addToCart(page);
      
      if (!success) {
        log.info('MONITORING: CART ATTEMPT UNSUCCESSFUL');
      }
      
      return success;
    } catch (error) {
      log.error('ERROR: PURCHASE ATTEMPT FAILED:', error as Error);
      return false;
    }
  }

  private async cleanup(): Promise<void> {
    this.shouldCleanup = true;
    this.state.status = BotStatus.CLEANUP;
    await this.browserManager.cleanup();
  }

  getState(): BotState {
    return this.state;
  }
} 