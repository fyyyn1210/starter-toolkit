import fs from 'fs-extra';
import path from 'path';
import https from 'https';
import zlib from 'zlib';
import tar from 'tar-stream';
import handlebars from 'handlebars';
import chalk from 'chalk';
import { ProjectOptions, TemplateConfig } from '../types';

export async function generateProject(projectName: string, options: ProjectOptions) {
  const projectPath = path.resolve(process.cwd(), projectName);

  // Check if project directory exists
  if (await fs.pathExists(projectPath)) {
    throw new Error(`Directory ${projectName} already exists!`);
  }

  // Create project directory
  await fs.ensureDir(projectPath);

  console.log(chalk.blue('📁 Copying template files...'));

  // Copy and process template files - sekarang templatePath adalah nama template
  await copyTemplate(options.stack, projectPath, { projectName, ...options });

  console.log(chalk.green('✨ Files generated successfully!'));
}

async function copyTemplate(
  templateName: string, // Parameter berubah dari templatePath ke templateName
  projectPath: string,
  context: any
) {
  const GITHUB_OWNER = 'fyyyn1210';
  const GITHUB_REPO = 'starter-toolkit-templates';
  const GITHUB_BRANCH = 'master';

  console.log(chalk.blue(`📦 Downloading ${templateName} template from GitHub...`));

  // Download tarball dari GitHub
  const tarballBuffer = await downloadTarball(GITHUB_OWNER, GITHUB_REPO, GITHUB_BRANCH);

  // Extract dan process template files
  await extractAndProcessTemplate(tarballBuffer, templateName, projectPath, context);

  console.log(chalk.green(`✅ Template ${templateName} processed successfully!`));
}

async function downloadTarball(owner: string, repo: string, branch: string): Promise<Buffer> {
  const tarballUrl = `https://api.github.com/repos/${owner}/${repo}/tarball/${branch}`;

  return new Promise((resolve, reject) => {
    console.log(chalk.gray(`🌐 Fetching: ${tarballUrl}`));

    const request = https.get(tarballUrl, {
      headers: {
        'User-Agent': 'starter-toolkit-cli',
        'Accept': 'application/vnd.github.v3+json'
      }
    }, (response) => {
      // Handle redirects
      if (response.statusCode === 302 || response.statusCode === 301) {
        const redirectUrl = response.headers.location;
        if (redirectUrl) {
          console.log(chalk.gray('↪️  Following redirect...'));
          return https.get(redirectUrl, {
            headers: { 'User-Agent': 'starter-toolkit-cli' }
          }, (redirectResponse) => {
            if (redirectResponse.statusCode !== 200) {
              reject(new Error(`HTTP ${redirectResponse.statusCode}: ${redirectResponse.statusMessage}`));
              return;
            }

            const chunks: Buffer[] = [];
            redirectResponse.on('data', (chunk) => chunks.push(chunk));
            redirectResponse.on('end', () => {
              console.log(chalk.green('✅ Download completed'));
              resolve(Buffer.concat(chunks));
            });
            redirectResponse.on('error', reject);
          }).on('error', reject);
        }
        return;
      }

      if (response.statusCode !== 200) {
        reject(new Error(`HTTP ${response.statusCode}: ${response.statusMessage}`));
        return;
      }

      const chunks: Buffer[] = [];
      let downloadedBytes = 0;

      response.on('data', (chunk) => {
        chunks.push(chunk);
        downloadedBytes += chunk.length;
        // Simple progress indicator
        if (downloadedBytes % (1024 * 100) === 0) {
          process.stdout.write('.');
        }
      });

      response.on('end', () => {
        console.log(chalk.green('\n✅ Download completed'));
        resolve(Buffer.concat(chunks));
      });

      response.on('error', reject);
    });

    request.on('error', reject);
    request.setTimeout(60000, () => { // Increase timeout untuk repo besar
      request.destroy();
      reject(new Error('Download timeout (60s)'));
    });
  });
}

async function extractAndProcessTemplate(
  tarballBuffer: Buffer,
  templateName: string,
  projectPath: string,
  context: any
): Promise<void> {
  return new Promise((resolve, reject) => {
    console.log(chalk.blue(`🔍 Extracting ${templateName} template...`));

    const extract = tar.extract();
    const templatePrefix = `templates/${templateName}/`;
    let foundTemplate = false;
    let processedCount = 0;

    const filesToProcess: Array<{
      relativePath: string;
      content: Buffer;
      isTextFile: boolean;
    }> = [];

    extract.on('entry', (header: { type?: any; name?: any; }, stream: { resume: () => void; on: (arg0: string, arg1: { (chunk: any): void; (): void; (reason?: any): void; }) => void; }, next: () => void) => {
      const { name } = header;

      // Skip jika bukan file dari template yang diinginkan
      if (!name.includes(templatePrefix)) {
        stream.resume();
        return next();
      }

      foundTemplate = true;

      // Get relative path dalam template
      const relativePath = name.substring(name.indexOf(templatePrefix) + templatePrefix.length);

      // Skip jika hanya folder, steps.json, atau file sistem
      if (!relativePath ||
          header.type === 'directory' ||
          relativePath === 'steps.json' ||
          relativePath.startsWith('.git/') ||
          relativePath.includes('/.git/') ||
          relativePath === '.DS_Store' ||
          relativePath.includes('.DS_Store')) {
        stream.resume();
        return next();
      }

      // Collect file content
      const chunks: Buffer[] = [];

      (stream as any).on('data', (chunk: Buffer) => {
        chunks.push(chunk);
      });

      stream.on('end', () => {
        const content = Buffer.concat(chunks);
        const ext = path.extname(relativePath);
        const isTextFile = /\.(hbs|ts|tsx|js|jsx|json|env|md|html|txt|yml|yaml|css|scss|less|vue|svelte|xml|svg)$/.test(ext);

        filesToProcess.push({
          relativePath,
          content,
          isTextFile
        });

        next();
      });

      stream.on('error', reject);
    });

    extract.on('finish', async () => {
      if (!foundTemplate) {
        reject(new Error(`Template '${templateName}' not found in repository. Available templates should be in 'templates/${templateName}/' folder.`));
        return;
      }

      try {
        console.log(chalk.blue(`📝 Processing ${filesToProcess.length} files...`));

        // Process semua files yang sudah di-collect
        for (const fileData of filesToProcess) {
          const { relativePath, content, isTextFile } = fileData;

          // Handle underscore files sebagai dotfiles (_gitignore -> .gitignore)
          let finalPath = relativePath;
          if (relativePath.startsWith('_')) {
            finalPath = '.' + relativePath.substring(1);
          }

          const destPath = path.join(projectPath, finalPath);

          // Ensure directory exists
          await fs.ensureDir(path.dirname(destPath));

          if (isTextFile) {
            const textContent = content.toString('utf8');

            // Process dengan handlebars jika ada template syntax
            if (textContent.includes('{{') && textContent.includes('}}')) {
              try {
                const template = handlebars.compile(textContent);
                const processedContent = template(context);
                await fs.writeFile(destPath, processedContent);
                processedCount++;
                console.log(chalk.gray(`  ✓ ${finalPath} (processed)`));
              } catch (err) {
                console.error(chalk.red(`Error processing template: ${relativePath}`));
                console.error(err);
                throw err;
              }
            } else {
              // Copy text file as-is jika tidak ada template syntax
              await fs.writeFile(destPath, textContent);
              processedCount++;
              console.log(chalk.gray(`  ✓ ${finalPath}`));
            }
          } else {
            // Write binary files
            await fs.writeFile(destPath, content);
            processedCount++;
            console.log(chalk.gray(`  ✓ ${finalPath} (binary)`));
          }
        }

        console.log(chalk.green(`✅ Processed ${processedCount} files successfully!`));
        resolve();
      } catch (error) {
        reject(error);
      }
    });

    extract.on('error', reject);

    // Decompress dan pipe ke tar extract
    console.log(chalk.blue('🗜️  Decompressing archive...'));
    const gunzip = zlib.createGunzip();
    gunzip.on('error', reject);

    gunzip.pipe(extract);
    gunzip.end(tarballBuffer);
  });
}