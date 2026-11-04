import fs from 'fs';
import path from 'path';
import inquirer from 'inquirer';
import { BotConfig } from '../types/config';
import { promptForConfig } from './cli';

const CONFIG_DIR = path.join(process.cwd(), 'configs');

export async function loadConfig(action: string): Promise<BotConfig> {
  if (action === 'create') {
    return promptForConfig();
  }

  // Ensure configs directory exists
  if (!fs.existsSync(CONFIG_DIR)) {
    fs.mkdirSync(CONFIG_DIR);
  }

  // Get list of saved configs
  const configFiles = fs.readdirSync(CONFIG_DIR)
    .filter(file => file.endsWith('.json'))
    .map(file => ({
      name: path.basename(file, '.json'),
      path: path.join(CONFIG_DIR, file)
    }));

  if (configFiles.length === 0) {
    console.log('No saved configurations found. Creating new configuration...');
    return promptForConfig();
  }

  // Prompt user to select a config
  const { configPath } = await inquirer.prompt([
    {
      type: 'list',
      name: 'configPath',
      message: 'Select a saved configuration:',
      choices: configFiles.map((config, index) => ({
        name: `(${index + 1}) ${config.name}`,
        value: config.path
      }))
    }
  ]);

  // Load and parse the selected config
  const configData = fs.readFileSync(configPath, 'utf8');
  const config = JSON.parse(configData) as BotConfig;

  // Display loaded configuration
  console.log('\n📋 Loaded configuration:\n');
  console.log(JSON.stringify(config, null, 2));
  console.log();

  return config;
} 