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

  console.log(chalk.blue('📁 Copying template files...'));

  // Copy and process template files
  await copyTemplate(templatePath, projectPath, { projectName, ...options });


  console.log(chalk.green('✨ Files generated successfully!'));
}

async function copyTemplate(
  templatePath: string,
  projectPath: string,
  context: any
) {
  const templateFiles = await fs.readdir(templatePath);

  for (const file of templateFiles) {
    if (file === 'steps.json') continue;

    const sourcePath = path.join(templatePath, file);
    const destPath = path.join(projectPath, file);
    const stat = await fs.stat(sourcePath);

    if (stat.isDirectory()) {
      await fs.ensureDir(destPath);
      await copyTemplate(sourcePath, destPath, context);
    } else {
      const ext = path.extname(file);
      const isTextFile = /\.(hbs|ts|js|json|env|md|html|txt)$/.test(ext);

      if (isTextFile) {
        try {
          const content = await fs.readFile(sourcePath, 'utf8');
          const template = handlebars.compile(content);
          const processedContent = template(context);
          await fs.writeFile(destPath, processedContent);
        } catch (err) {
          console.error(`Error processing template: ${sourcePath}`);
          throw err;
        }
      } else {
        // Copy binary or non-template file as-is
        await fs.copyFile(sourcePath, destPath);
      }
    }
  }
}
