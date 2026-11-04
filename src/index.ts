#!/usr/bin/env node

import { ButterBot } from './core/bot';
import { displayWelcome, promptForAction, handleTaskAction } from './utils/cli';
import { chromium } from 'playwright';
import { getOptimizedLaunchArgs } from './utils/window';
import inquirer from 'inquirer';

// Start the application
(async () => {
  try {
    // Display welcome message
    displayWelcome();

    while (true) {
      // Get user action
      const action = await promptForAction();
      
      // Handle the action and get config if needed
      const config = await handleTaskAction(action);
      
      // If no config returned (e.g., for list/delete actions), continue
      if (!config) {
        continue;
      }

      // Create concurrent browser instances
      const browsers = await Promise.all(
        Array(config.concurrent).fill(null).map((_, index) => 
          chromium.launch({
            headless: config.headless,
            args: getOptimizedLaunchArgs(index, config.concurrent)
          })
        )
      );

      // Create and start bots for each browser
      const bots = browsers.map(browser => {
        const bot = new ButterBot(config);
        return { bot, browser };
      });

      // Initialize all bots
      await Promise.all(bots.map(async ({ bot, browser }) => {
        await bot.browserManager.initialize(browser);
      }));

      // If target time is set, wait until that time
      if (config.targetTime) {
        const targetDate = new Date(config.targetTime);
        const now = new Date();
        
        if (targetDate > now) {
          console.log(`Waiting until ${targetDate.toLocaleString()}...`);
          await new Promise(resolve => setTimeout(resolve, targetDate.getTime() - now.getTime()));
        }
      }
      
      // Execute all bots concurrently
      await Promise.all(bots.map(async ({ bot }, index) => {
        try {
          await bot.execute();
        } catch (error) {
          console.error(`Bot ${index + 1} failed:`, error);
        }
      }));
      
      // Ask if user wants to continue with another action
      const { continue: shouldContinue } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'continue',
          message: 'Would you like to perform another action?',
          default: true
        }
      ]);
      
      if (!shouldContinue) {
        break;
      }
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('Error:', errorMessage);
    process.exit(1);
  }
})(); 