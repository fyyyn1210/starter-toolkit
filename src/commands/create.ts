import inquirer from "inquirer";
import handlebars from "handlebars";
import chalk from "chalk";
import path from "path";
import * as fs from "fs";
import { generateProject } from "../generators/projectGenerator";
import { ProjectOptions, StepData } from "../types";

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
    // console.log(chalk.cyan("\n📝 Next steps:"));
    try {
      const templatePath = path.resolve(
        __dirname,
        "../../templates",
        options.stack
      );
      const configPath       = path.join(templatePath, "steps.json");
      const rawData          = fs.readFileSync(configPath, "utf-8");
      const config: StepData = JSON.parse(rawData);

      console.log(chalk.cyan("\n📋 Installation Steps:\n"));
      console.log(
        chalk.bold(`${parseTemplateName(options.stack)} Setup Guide`)
      );
      console.log(chalk.gray("─".repeat(50)));
      config.steps.forEach((step) => {

          // Step header
        console.log(chalk.bold.blue(`\n${step.step}. ${step.title}`));

          // Command (if available)
        if (step.command && !step.manual) {
          const processedCommand = handlebars.compile(step.command)({
            projectName,
            ...options,
          });
          console.log(chalk.green(`   $ ${processedCommand}`));
        }

          // Description
        console.log(chalk.white(`   ${step.description}`));

          // Estimated time
        if (step.estimatedTime) {
          console.log(chalk.gray(`   ⏱️  ${step.estimatedTime}`));
        }

          // Manual notes
        if (step.notes && step.notes.length > 0) {
          console.log(chalk.yellow("   📝 Notes:"));
          step.notes.forEach((note) => {
            console.log(chalk.yellow(`      • ${note}`));
          });
        }

          // Final step success message
        if (step.finalStep && step.successMessage) {
          console.log(chalk.green.bold(`\n   ${step.successMessage}`));
        }

      });
      console.log(chalk.gray("─".repeat(50)));
    } catch (e) {}
  } catch (error) {
    console.error(chalk.red("❌ Failed creating project"), error);
    process.exit(1);
  }
  function initStacks() {
    const templatesDir = path.resolve(__dirname, "../../templates");
    console.log(chalk.gray(`Looking for templates in: ${templatesDir}`));
    if (!fs.existsSync(templatesDir)) {
      console.warn(chalk.yellow("⚠️  Templates directory not found or empty"));
      return [];
    }

    try {
      const dirs = fs.readdirSync(templatesDir, { withFileTypes: true });

      const templateList = dirs
        .filter((dirent) => dirent.isDirectory())
        .map((dirent) => ({
          name : parseTemplateName(dirent.name),
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
  function parseTemplateName(str: string) {
    return str
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" + ");
  }
}
