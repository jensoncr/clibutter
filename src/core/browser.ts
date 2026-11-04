import { Browser, BrowserContext, Page } from 'playwright';
import { BotConfig } from '../types/config';
import { ExtendedBrowserContext } from '../types/browser';
import log from '../utils/logger';
import { playSuccessSound } from '../utils/sound';

export class BrowserManager {
  private browser: Browser | null = null;
  private contexts: Set<BrowserContext> = new Set();
  private readonly config: BotConfig;

  constructor(config: BotConfig) {
    this.config = config;
    log.info('BROWSER MANAGER INITIALIZED');
  }

  async initialize(browser: Browser): Promise<void> {
    this.browser = browser;
  }

  async createContext(): Promise<ExtendedBrowserContext> {
    if (!this.browser) {
      throw new Error('Browser not initialized');
    }

    const context = await this.browser.newContext({
      viewport: { width: 1280, height: 720 },
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    }) as ExtendedBrowserContext;

    this.contexts.add(context);
    return context;
  }

  async navigateToPage(page: Page): Promise<void> {
    log.info(`NAVIGATING TO: ${this.config.productUrl}`);
    await page.goto(this.config.productUrl, {
      waitUntil: 'domcontentloaded',
      timeout: this.config.timeoutMs
    });
  }

  async selectProduct(page: Page): Promise<void> {
    try {
      // Wait for the product title
      const productTitleSelector = `h3:has-text("${this.config.productName}")`;
      const productTitle = await page.waitForSelector(productTitleSelector);
      
      if (!productTitle) {
        throw new Error('Product title not found');
      }

      log.info(`FOUND PRODUCT: "${this.config.productName}"`);
      
      // Click the title to open the modal
      await productTitle.click();
      
      // Check if modal is present
      const modal = await page.$('[role="dialog"]');
      if (!modal) {
        log.info('NO MODAL DETECTED - CONTINUING WITH BUTTON SEARCH');
      } else {
        log.info('PRODUCT MODAL OPENED');
      }

    } catch (error) {
      log.error('ERROR SELECTING PRODUCT:', error as Error);
      throw error;
    }
  }

  async addToCart(page: Page): Promise<boolean> {
    try {
      while (true) {
        const buttons = await page.$$('button');
        let addToCartButton = null;
        let buttonInfo = { text: '', price: '', isEnabled: false };

        for (const button of buttons) {
          const pTags = await button.$$('p');
          if (pTags.length === 2) {
            const firstPText = (await pTags[0].textContent())?.trim() || '';
            const secondPText = (await pTags[1].textContent())?.trim() || '';

            const isAvailabilityText = firstPText.toLowerCase().includes('available soon') || 
                                     firstPText.toLowerCase().includes('sold out') ||
                                     firstPText.toLowerCase().includes('coming soon') ||
                                     firstPText.toLowerCase().includes('add to cart');
            const isPriceText = secondPText.includes('$');

            if (isAvailabilityText && isPriceText) {
              const isDisabled = await button.evaluate((btn) => {
                return btn.disabled || 
                       btn.classList.contains('disabled') || 
                       getComputedStyle(btn).opacity === '0.5' ||
                       btn.getAttribute('aria-disabled') === 'true';
              });

              buttonInfo = {
                text: firstPText,
                price: secondPText,
                isEnabled: !isDisabled
              };

              if (firstPText.toLowerCase().includes('add to cart') && !isDisabled) {
                addToCartButton = button;
                break;
              }
            }
          }
        }

        if (buttonInfo.text) {
          log.info(`BUTTON STATE - TEXT: "${buttonInfo.text}" PRICE: ${buttonInfo.price} - ${buttonInfo.isEnabled ? 'ENABLED' : 'DISABLED'}`);
        }

        if (addToCartButton) {
          log.info('FOUND ENABLED ADD TO CART BUTTON - ATTEMPTING TO CLICK');
          await addToCartButton.click();
          
          const cartUpdated = await this.waitForCartUpdate(page);
          if (cartUpdated) {
            log.info('SUCCESS: ADDED TO CART!');
            playSuccessSound();
            return true;
          }
        } else {
          log.info('MONITORING FOR AVAILABLE ADD TO CART BUTTON');
        }

        await new Promise(resolve => setTimeout(resolve, 100));
      }
    } catch (error) {
      log.error('ERROR ADDING TO CART:', error as Error);
      return false;
    }
  }

  async waitForCartUpdate(page: Page): Promise<boolean> {
    try {
      // Wait for cart update indicator
      await page.waitForSelector('[class*="c-PJLV-idIaemn-css"]', {
        state: 'visible',
        timeout: 5000
      });
      log.info('CART UPDATE CONFIRMED - SUCCESS INDICATOR FOUND');
      return true;
    } catch (error) {
      log.error('ERROR CHECKING CART UPDATE:', error as Error);
      return false;
    }
  }

  async cleanup(): Promise<void> {
    // Close all contexts except the successful one
    for (const context of this.contexts) {
      try {
        const pages = await context.pages();
        // Only close contexts that don't have a successful cart
        const hasSuccessIndicator = await pages.some(async page => {
          try {
            return await page.$('[class*="c-PJLV-idIaemn-css"]') !== null;
          } catch {
            return false;
          }
        });
        
        if (!hasSuccessIndicator) {
          await context.close();
        }
      } catch (error) {
        // Ignore errors during cleanup
      }
    }
    this.contexts.clear();
    
    // Don't close the browser - let the main process handle it
    this.browser = null;
  }
} 