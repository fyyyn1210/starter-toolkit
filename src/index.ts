#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import { createProject } from './commands/create';

const program = new Command();

program
  .name('starter-toolkit')
  .description('Generate starter projects with your favorite stack')
  .version('1.0.0');

program
  .command('create <project-name>')
  .description('Create a new project')
  .action((projectName: string) => {
    console.log(chalk.blue('🚀 Creating project:'), chalk.bold(projectName));
    createProject(projectName);
  });

program.parse();