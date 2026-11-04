import inquirer from 'inquirer';
import { BotConfig } from '../types/config';
import fs from 'fs';
import path from 'path';
import chalk from 'chalk';

const TASKS_DIR = path.join(process.cwd(), 'tasks');

interface SavedTask {
  name: string;
  config: BotConfig;
  createdAt: string;
  lastRun?: string;
}

export function displayWelcome() {
  console.log(chalk.cyan(`
   ____   _       ___   ____            _     _                 
  / ___| | |     |_ _| | __ )   _   _  | |_  | |_    ___   _ __ 
 | |     | |      | |  |  _ \\  | | | | | __| | __|  / _ \\ | '__|
 | |___  | |___   | |  | |_) | | |_| | | |_  | |_  |  __/ | |   
  \\____| |_____| |___| |____/   \\__,_|  \\__|  \\__|  \\___| |_|   
                                                                
`));
  console.log(chalk.blue('Welcome to CLIButter - Your Automated Shopping Assistant\n'));
}

export async function promptForAction(): Promise<string> {
  // Ensure tasks directory exists
  if (!fs.existsSync(TASKS_DIR)) {
    fs.mkdirSync(TASKS_DIR, { recursive: true });
  }

  const savedTasks = getSavedTasks();
  const hasExistingTasks = savedTasks.length > 0;

  const choices = [
    { name: '✨ Create New Task', value: 'create' },
    ...(hasExistingTasks ? [
      { name: '▶️  Run Saved Task', value: 'run' },
      { name: '📝 Edit Saved Task', value: 'edit' },
      { name: '🗑️  Delete Task', value: 'delete' },
      { name: '📋 List All Tasks', value: 'list' }
    ] : [])
  ];

  const { action } = await inquirer.prompt([
    {
      type: 'list',
      name: 'action',
      message: 'What would you like to do?',
      choices
    }
  ]);

  return action;
}

export async function promptForConfig(existingConfig?: BotConfig): Promise<BotConfig> {
  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'productUrl',
      message: 'Enter the product URL:',
      default: existingConfig?.productUrl,
      validate: (input: string) => input.length > 0 || 'Product URL is required'
    },
    {
      type: 'input',
      name: 'productName',
      message: 'Enter the product name:',
      default: existingConfig?.productName,
      validate: (input: string) => input.length > 0 || 'Product name is required'
    },
    {
      type: 'number',
      name: 'timeoutMs',
      message: 'Enter timeout in milliseconds:',
      default: existingConfig?.timeoutMs || 30000
    },
    {
      type: 'number',
      name: 'concurrent',
      message: 'Enter number of concurrent browsers:',
      default: existingConfig?.concurrent || 1
    },
    {
      type: 'confirm',
      name: 'headless',
      message: 'Run in headless mode?',
      default: existingConfig?.headless || false
    },
    {
      type: 'input',
      name: 'targetTime',
      message: 'Enter target time (YYYY-MM-DD HH:mm:ss) or leave empty:',
      default: existingConfig?.targetTime,
      validate: (input: string) => {
        if (!input) return true;
        const date = new Date(input);
        return !isNaN(date.getTime()) || 'Please enter a valid date and time';
      }
    }
  ]);

  return answers as BotConfig;
}

export async function handleTaskAction(action: string): Promise<BotConfig | null> {
  switch (action) {
    case 'create':
      return await createNewTask();
    case 'run':
      return await selectAndRunTask();
    case 'edit':
      return await editTask();
    case 'delete':
      await deleteTask();
      return null;
    case 'list':
      listTasks();
      return null;
    default:
      return null;
  }
}

async function createNewTask(): Promise<BotConfig> {
  const config = await promptForConfig();
  
  const { saveName } = await inquirer.prompt([
    {
      type: 'input',
      name: 'saveName',
      message: 'Enter a name for this task (leave empty to skip saving):',
      validate: (input: string) => {
        if (!input) return true;
        return !fs.existsSync(path.join(TASKS_DIR, `${input}.json`)) || 'Task name already exists';
      }
    }
  ]);

  if (saveName) {
    const task: SavedTask = {
      name: saveName,
      config,
      createdAt: new Date().toISOString()
    };
    
    fs.writeFileSync(
      path.join(TASKS_DIR, `${saveName}.json`),
      JSON.stringify(task, null, 2)
    );
    
    console.log(chalk.green(`✓ Task "${saveName}" saved successfully!`));
  }

  return config;
}

async function selectAndRunTask(): Promise<BotConfig> {
  const tasks = getSavedTasks();
  const { taskName } = await inquirer.prompt([
    {
      type: 'list',
      name: 'taskName',
      message: 'Select a task to run:',
      choices: tasks.map(task => ({
        name: `${task.name} (${task.config.productName})`,
        value: task.name
      }))
    }
  ]);

  const task = tasks.find(t => t.name === taskName)!;
  task.lastRun = new Date().toISOString();
  
  fs.writeFileSync(
    path.join(TASKS_DIR, `${taskName}.json`),
    JSON.stringify(task, null, 2)
  );

  console.log(chalk.blue(`▶️  Running task "${taskName}"...`));
  return task.config;
}

async function editTask(): Promise<BotConfig> {
  const tasks = getSavedTasks();
  const { taskName } = await inquirer.prompt([
    {
      type: 'list',
      name: 'taskName',
      message: 'Select a task to edit:',
      choices: tasks.map(task => ({
        name: `${task.name} (${task.config.productName})`,
        value: task.name
      }))
    }
  ]);

  const task = tasks.find(t => t.name === taskName)!;
  const updatedConfig = await promptForConfig(task.config);
  
  const updatedTask: SavedTask = {
    ...task,
    config: updatedConfig
  };

  fs.writeFileSync(
    path.join(TASKS_DIR, `${taskName}.json`),
    JSON.stringify(updatedTask, null, 2)
  );

  console.log(chalk.green(`✓ Task "${taskName}" updated successfully!`));
  return updatedConfig;
}

async function deleteTask(): Promise<void> {
  const tasks = getSavedTasks();
  const { taskName } = await inquirer.prompt([
    {
      type: 'list',
      name: 'taskName',
      message: 'Select a task to delete:',
      choices: tasks.map(task => ({
        name: `${task.name} (${task.config.productName})`,
        value: task.name
      }))
    }
  ]);

  fs.unlinkSync(path.join(TASKS_DIR, `${taskName}.json`));
  console.log(chalk.yellow(`🗑️  Task "${taskName}" deleted successfully!`));
}

function listTasks(): void {
  const tasks = getSavedTasks();
  console.log(chalk.blue('\nSaved Tasks:'));
  console.log('─'.repeat(50));
  
  tasks.forEach(task => {
    console.log(chalk.cyan(`\n📌 ${task.name}`));
    console.log(`   Product: ${task.config.productName}`);
    console.log(`   URL: ${task.config.productUrl}`);
    console.log(`   Created: ${new Date(task.createdAt).toLocaleString()}`);
    if (task.lastRun) {
      console.log(`   Last Run: ${new Date(task.lastRun).toLocaleString()}`);
    }
  });
  
  console.log('\n' + '─'.repeat(50) + '\n');
}

function getSavedTasks(): SavedTask[] {
  if (!fs.existsSync(TASKS_DIR)) {
    return [];
  }

  return fs.readdirSync(TASKS_DIR)
    .filter(file => file.endsWith('.json'))
    .map(file => {
      const content = fs.readFileSync(path.join(TASKS_DIR, file), 'utf-8');
      return JSON.parse(content) as SavedTask;
    })
    .sort((a, b) => a.name.localeCompare(b.name));
} 