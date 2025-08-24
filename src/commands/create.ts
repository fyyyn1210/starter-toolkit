import inquirer from "inquirer";
import chalk from "chalk";
import path from "path";
import * as fs from "fs";
import { generateProject } from "../generators/projectGenerator";
import { ProjectOptions, TemplateConfig } from "../types";


export async function createProject(projectName: string) {
  try {
    console.log(chalk.yellow("📋 Please answer a few questions...\n"));
    const choices                 = initStacks();
    const options: ProjectOptions = await inquirer.prompt([
      {
        type   : "list",
        name   : "stack",
        message: "Select your stack:",
        choices: choices,
      },
    ]);

    await generateProject(projectName, options);

    console.log(chalk.green("\n✅ Project created successfully!"));
    console.log(chalk.cyan("\n📝 Next steps:"));
    console.log(chalk.white(`   cd ${projectName}`));

    try{

      // Load template config
    const templatePath                   = path.resolve(__dirname, '../../templates', options.stack);
    const configPath                     = path.join(templatePath, 'template.config.js');
    const {steps}: TemplateConfig = require(configPath);

    if(!!steps && steps.length > 0){
      steps.forEach(step => console.log(chalk.white(`   ${step}`)));
    }
    }catch(e){}

  } catch (error) {
    console.error(chalk.red("❌ Failed creating project"));
    process.exit(1);
  }
  function initStacks() {
    const templatesDir = path.resolve(__dirname, "../../templates");
    console.log(chalk.gray(`Looking for templates in: ${templatesDir}`));
    if (!fs.existsSync(templatesDir)) {
      console.warn(
        chalk.yellow("⚠️  Templates directory not found or empty")
      );
      return [];
    }

    try {
      const dirs = fs.readdirSync(templatesDir, { withFileTypes: true });

      const templateList = dirs
        .filter((dirent) => dirent.isDirectory())
        .map((dirent) => ({
          name: dirent.name
            .split("-")
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" + "),
          value: dirent.name,
        }));

      return templateList.length > 0 ? templateList: [];
    } catch (error) {
      console.warn(
        chalk.yellow("⚠️  Error reading templates directory or empty")
      );
      return [];
    }
  }
}
