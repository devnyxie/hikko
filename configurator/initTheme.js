// # Themes Implementation

import chalk from "chalk";
import { log, capitalizeFirstChar, ensureRelativePath } from "./utils.js";
import path from "path";

function configureComponent({
  component,
  themedComponents,
  themeName,
  isRoot,
}) {
  process.title = configureComponent.name;
  let modifiedComponent = component;
  const coreComponentName = component.componentName;
  // CORE PATHS
  if (isRoot) {
    modifiedComponent.path = path.join(
      `./components/`,
      coreComponentName,
      `${capitalizeFirstChar(coreComponentName)}`
    );
  } else {
    modifiedComponent.path = path.join(
      `../components/`,
      coreComponentName,
      `${capitalizeFirstChar(coreComponentName)}`
    );
  }

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
        if (isRoot) {
          modifiedComponent.path = path.join(
            `./theme/`,
            themedComponent.modifiedComponentDir,
            `${capitalizeFirstChar(coreComponentName)}`
          );
        } else {
          modifiedComponent.path = path.join(
            `../theme/`,
            themedComponent.modifiedComponentDir,
            `${capitalizeFirstChar(coreComponentName)}`
          );
        }
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
    modifiedComponent.path = ensureRelativePath(modifiedComponent.path);
    return modifiedComponent;
  } catch (error) {
    console.error(error);
    log(
      chalk.red(
        "Error while choosing component to insert, using core component"
      )
    );
    // console.error(error);
    modifiedComponent.path = ensureRelativePath(modifiedComponent.path);
    return modifiedComponent;
  }
}

export function initTheme(config, theme) {
  process.title = initTheme.name;
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
