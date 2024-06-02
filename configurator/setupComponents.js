// purpose of this file is:
// 1. Check the theme, and if it exists, apply the theme's component options or replace whole component
// 2. give each component a path to the component file
// 3. return the modified config object
// 4. if the theme is not provided, return the config object as is

import chalk from "chalk";
import { log, capitalizeFirstChar, ensureRelativePath } from "./utils.js";
import path from "path";

function configureComponent({ component, themedComponents, themeName }) {
  process.title = configureComponent.name;
  let modifiedComponent = component;
  const coreComponentName = component.componentName;
  // CORE PATHS
  modifiedComponent.path = path.join(
    `@/app/core_components/`,
    coreComponentName,
    `${capitalizeFirstChar(coreComponentName)}`
  );
  try {
    if (!themeName) {
      log(chalk.red("Theme path is not provided!"));
      throw new Error(`Theme path is not provided!`);
    }
    const themedComponent = themedComponents.find(
      (themedComp) => themedComp.componentName === coreComponentName
    );
    if (themedComponent) {
      // if the component is modified, return the modified component.
      if (themedComponent.modifiedComponentDir) {
        modifiedComponent.path = path.join(
          `@app/theme/`,
          themedComponent.modifiedComponentDir,
          `${capitalizeFirstChar(coreComponentName)}`
        );
        log(
          `Altering "${coreComponentName}" component's options to theme's options`
        );
        modifiedComponent.options = themedComponent.options; //                    !!!
      } else {
        // appending themed components options to core component
        const { modifiedComponentDir, ...rest } = themedComponent;
        log(
          chalk.green(
            `Using core component "${coreComponentName}" with Theme's options`
          )
        );
        modifiedComponent = {
          ...modifiedComponent,
          ...rest,
        };
      }
    }
    return modifiedComponent;
  } catch (error) {
    console.error(error);
    log(
      chalk.red(
        "Error while choosing component to insert, using core component"
      )
    );
    return modifiedComponent;
  }
}

export function setupComponents(config, theme) {
  process.title = setupComponents.name;
  const themeName = config.theme;
  let modifiedConfig = config;
  try {
    // --- COMPONENTS ---
    modifiedConfig.pages.forEach((page) => {
      page.components = page.components.map((component) => {
        return configureComponent({
          component: component,
          themedComponents: theme.components,
          themeName: themeName,
          isRoot: page.path === "" || page.path === "/",
        });
      });
    });
    // --- ROOT COMPONENTS ---
    if (modifiedConfig.rootComponents) {
      modifiedConfig.rootComponents = modifiedConfig.rootComponents.map(
        (component) => {
          return configureComponent({
            component: component,
            themedComponents: theme.components,
            themeName: themeName,
            isRoot: true,
          });
        }
      );
    }

    //
  } catch (error) {
    log(chalk.red("Error while initializing theme"));
    console.error(error);
  } finally {
    return modifiedConfig;
  }
}
