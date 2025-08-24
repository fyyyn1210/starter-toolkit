import fs from 'fs-extra';
import path from 'path';
import handlebars from 'handlebars';
import chalk from 'chalk';
import { ProjectOptions, TemplateConfig } from '../types';

export async function generateProject(projectName: string, options: ProjectOptions) {
  const projectPath = path.resolve(process.cwd(), projectName);
  const templatePath = path.resolve(__dirname, '../../templates', options.stack);

  // Check if project directory exists
  if (await fs.pathExists(projectPath)) {
    throw new Error(`Directory ${projectName} already exists!`);
  }

  // Create project directory
  await fs.ensureDir(projectPath);

  // Load template config
  const configPath = path.join(templatePath, 'template.config.js');
  const templateConfig: TemplateConfig = require(configPath);

  console.log(chalk.blue('📁 Copying template files...'));

  // Copy and process template files
  await copyTemplate(templatePath, projectPath, { projectName, ...options });

  // Generate package.json
  await generatePackageJson(projectPath, projectName, templateConfig, options);

  console.log(chalk.green('✨ Files generated successfully!'));
}

async function copyTemplate(
  templatePath: string,
  projectPath: string,
  context: any
) {
  const templateFiles = await fs.readdir(templatePath);

  for (const file of templateFiles) {
    if (file === 'template.config.js') continue;

    const sourcePath = path.join(templatePath, file);
    const destPath = path.join(projectPath, file);

    const stat = await fs.stat(sourcePath);

    if (stat.isDirectory()) {
      await fs.ensureDir(destPath);
      await copyTemplate(sourcePath, destPath, context);
    } else {
      // Process template file
      const content = await fs.readFile(sourcePath, 'utf8');
      const template = handlebars.compile(content);
      const processedContent = template(context);

      await fs.writeFile(destPath, processedContent);
    }
  }
}

async function generatePackageJson(
  projectPath: string,
  projectName: string,
  config: TemplateConfig,
  options: ProjectOptions
) {
  const packageJson = {
    name: projectName,
    version: '1.0.0',
    description: '',
    main: 'index.js',
    scripts: config.scripts,
    dependencies: config.dependencies,
    devDependencies: config.devDependencies
  };

  await fs.writeFile(
    path.join(projectPath, 'package.json'),
    JSON.stringify(packageJson, null, 2)
  );
}