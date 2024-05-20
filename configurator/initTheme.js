// # Themes Implementation

import chalk from "chalk";
import { selectCompToInsert, log, parseYAML } from "./utils.js";
import fs from "fs";
import fse from "fs-extra";
import { config } from "process";

// Now, we need to add the ability to specify&use themes in the config.yaml. Themes are a set of CSS files and Next.js components. Each theme has an info.yaml file with the theme's name, description, and a list of modified components.

// My idea is:

// 1. Read the ./config.yaml [DONE]
// 2. Create ./app dir [DONE]
// 3. If there is config.theme specified, read the theme's info.yaml and create a list of <strong>themed components</strong>.
//    <br/>3.1. layout.tsx/page.tsx: When mapping the components, check if the component is in the list of <strong>themed components</strong>. If it is, use the theme's component instead of the default one. Perhaps creating a function to do so would be a good idea.

const THEMES_PATH = "./common/themes";

export function initTheme(config) {
  process.title = initTheme.name;
  const themeName = config.theme;
  let modifiedConfig = config;
  try {
    if (themeName) {
      const themePath = `${THEMES_PATH}/${themeName}`;
      const themeInfoFilePath = `${themePath}/info.yaml`;
      log(`Searching for "${themeName}" theme...`);
      if (!fs.existsSync(themeInfoFilePath)) {
        log(chalk.red(`Theme "${themeName}" was not found in ${THEMES_PATH}!`));
        log("Continuing without a theme");
        // raise na error
        throw new Error(
          `Theme "${themeName}" was not found in ${THEMES_PATH}!`
        );
      } else {
        log(chalk.green(`Found "${themeName}" theme`));
      }
      const parsedThemeInfoFile = parseYAML(themeInfoFilePath);
      // --- PAGES ---
      // now we have to filter all config.page(s).components and config.rootComponents
      modifiedConfig.pages.forEach((page) => {
        page.components = page.components.map((component) => {
          // returns core component if there are no themed version of it.
          return selectCompToInsert({
            component: component,
            themedComponents: parsedThemeInfoFile.components,
            themeName: themeName,
            isRoot: page.path === "" || page.path === "/",
          });
        });
      });
      // --- ROOT COMPONENTS ---
      if (modifiedConfig.rootComponents) {
        modifiedConfig.rootComponents = modifiedConfig.rootComponents.map(
          (component) => {
            // returns core component if there are no themed version of it.
            return selectCompToInsert({
              component: component,
              themedComponents: parsedThemeInfoFile.components,
              themeName: themeName,
              isRoot: true,
            });
          }
        );
      }
    } else {
      log(chalk.red("No theme specified in config.yaml"));
      log("Continuing without a theme");
    }
  } catch (error) {
    log(chalk.red("Error while initializing theme"));
    console.error(error);
  } finally {
    return modifiedConfig;
  }
}
