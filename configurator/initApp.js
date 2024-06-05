import fse from "fs-extra";
import fs from "fs";
import { APP_PATH } from "./index.js";
import {
  capitalizeFirstChar,
  extractCSSModulePath,
  log,
  parseYAML,
} from "./utils.js";
import path from "path";
import chalk from "chalk";

const CORE_COMPONENTS_PATH = "./common/core_components";
const APP_CORE_COMPONENTS_PATH = "./app/core_components";

const STYLES_PATH = "./common/styles";
const APP_STYLES_PATH = "./app/styles";

const THEMES_PATH = "./common/themes";
const APP_THEME_PATH = "./app/theme";

const TYPES_PATH = "./common/types";
const APP_TYPES_PATH = "./app/types";

const UTILS_PATH = "./common/utils";
const APP_UTILS_PATH = "./app/utils";

const MUI_PATH = "./common/mui";
const APP_MUI_PATH = "./app/mui";

function alterPageAbsolutePaths(filePath) {
  const from = "@/common/components";
  const to = "@/app/components";
  function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); // $& means the whole matched string
  }
  const fileContent = fs.readFileSync(filePath, "utf8");
  const escapedFrom = escapeRegExp(from);
  const newContent = fileContent.replace(new RegExp(escapedFrom, "g"), to);
  log(`Altering absolute paths in ${filePath}...`);
  fs.writeFileSync(filePath, newContent);
}

function detectRelativePaths(filePath) {
  try {
    const fileContent = fs.readFileSync(filePath, "utf8");
    const lines = fileContent.split("\n");
    const relativePaths = [];

    const relativePathRegex = /from "\.\./i;

    lines.forEach((line) => {
      const match = line.match(relativePathRegex);
      if (match) {
        relativePaths.push(line.trim());
      }
    });

    return relativePaths;
  } catch (error) {
    console.error("Error reading file:", error);
    return [];
  }
}

function alterImports(srcPath, destPath) {
  const relativePaths = detectRelativePaths(srcPath);
  if (relativePaths.length > 0) {
    console.error(
      chalk.red(
        `Relative paths found in ${srcPath}: \n${relativePaths
          .map(
            (path, index) =>
              `${relativePaths.length > 1 ? index + ":" : ""} ${path}`
          )
          .join("\n")}`
      )
    );
    process.exit(1);
  }
  // if everything is alright, alter absolute paths from "/common/" to "/app/"
  alterPageAbsolutePaths(destPath);
}

const extractFolderName = (input, componentName) => {
  // Regex for relative imports
  const relativeRegex = /^import\s+.*?from\s+['"]\.\.\/([^\/]+)\/[^\/]+['"]/;
  // Regex for absolute imports
  const absoluteRegex =
    /^import\s+.*?from\s+['"]@\/common\/components\/([^\/]+)\/[^\/]+['"]/;

  let match = input.match(relativeRegex);
  if (match && match[1] !== componentName) {
    return match[1];
  }

  match = input.match(absoluteRegex);
  if (match && match[1] !== componentName) {
    return match[1];
  }

  return null;
};

// function to check if a component is mentioning another component
function chkMentionComp(filePath, componentName) {
  process.title = chkMentionComp.name;
  let mentionedComponents = [];
  log(`Checking for mentioned components in "${componentName}"`);
  let fileContent;
  try {
    fileContent = fs.readFileSync(filePath, "utf8");
  } catch (error) {
    console.error(`Error reading file ${filePath}: ${error}`);
    return null;
  }
  const importLines = fileContent
    .split("\n")
    .filter((line) => line.startsWith("import"));
  importLines.forEach((line) => {
    const folderName = extractFolderName(line, componentName);
    if (folderName) {
      log(`Found mentioned component "${folderName}" in "${componentName}"`);
      mentionedComponents.push(folderName);
    }
  });
  return mentionedComponents;
}

// function to configure a component (copy core/modified component to app folder etc.)
function cfgComp({ component, config, theme }) {
  let modifiedComponent = component;
  process.title = cfgComp.name;
  try {
    // Setting the process name for better debugging.
    const componentName = component.component_name;

    const coreComponentPath = path.join(CORE_COMPONENTS_PATH, componentName);
    const coreComponentExist = fse.existsSync(coreComponentPath);

    if (coreComponentExist) {
      log(`Component ${componentName} exists in ${CORE_COMPONENTS_PATH}`);
    } else {
      log(
        chalk.red(
          `Component ${componentName} does not exist in ${CORE_COMPONENTS_PATH}`
        )
      );
      throw new Error(
        `Component ${componentName} does not exist in ${CORE_COMPONENTS_PATH}`
      );
    }

    // set components core path
    modifiedComponent.path = path.join(
      `@/app/core_components/`,
      componentName,
      `${capitalizeFirstChar(componentName)}`
    );

    // Path
    const componentPath = {
      commonDir: CORE_COMPONENTS_PATH,
      appDir: APP_CORE_COMPONENTS_PATH,
    };
    // SRC path
    let srcComponentPath = path.join(
      componentPath.commonDir,
      `${componentName}`
    );
    // DEST path
    let destComponentPath = path.join(componentPath.appDir, `${componentName}`);

    // check if component requires other components
    const otherComponents = chkMentionComp(
      path.join(srcComponentPath, `${capitalizeFirstChar(componentName)}.tsx`),
      componentName
    );
    if (otherComponents.length > 0) {
      otherComponents.forEach((otherComponent) => {
        cfgComp({
          component: { component_name: otherComponent },
          config,
          theme,
        });
      });
    }

    // Setting the process name again after the recursive call
    process.title = cfgComp.name;

    // if the component has altered structure/options in the theme
    if (config.theme && theme) {
      const themedComponent = theme.components.find(
        (themedComp) => themedComp.component_name === componentName
      );
      if (themedComponent) {
        if (themedComponent.options) {
          // update the options to the themed component's options
          modifiedComponent.options = themedComponent.options;
        }
        // if the component structure has been altered in the theme, copy the entire component's folder
        if (themedComponent.modifiedComponentDir) {
          log(
            `Component ${componentName} has been altered in theme "${config.theme}"`
          );
          srcComponentPath = path.resolve(
            THEMES_PATH,
            `${config.theme}`,
            `${themedComponent.modifiedComponentDir}`
          );
          fse.copySync(srcComponentPath, destComponentPath);
          log(`Copied ${componentName}'s themed version`);
          // update the path to the modified component
          modifiedComponent.path = path.join(
            `@app/theme/`,
            themedComponent.modifiedComponentDir,
            `${capitalizeFirstChar(componentName)}`
          );
          // return the modified component
          return modifiedComponent;
        }
      }
    }

    // If the component has not been altered in the theme, copy the core component.
    log(`copying core "${componentName}" component to ${componentPath.appDir}`);
    fse.copySync(srcComponentPath, destComponentPath);

    // Check if the component requires the creation of a dedicated page (e.g., blog post page)
    const componentYAMLPath = path.join(srcComponentPath, "component.yaml");
    log(`Checking for component.yaml file at ${componentYAMLPath}...`);
    if (fse.existsSync(componentYAMLPath)) {
      log(chalk.green(`Found component.yaml file at ${componentYAMLPath}`));
      const componentYAML = parseYAML(componentYAMLPath);
      // Setting the process name again after the recursive call
      process.title = cfgComp.name;
      log(`"${componentName}"'s component.yaml successfully parsed`);
      if (componentYAML.pages) {
        log(`"${componentName}" requires the creation of dedicated pages`);
        // Each page is an object of the form { src: string, dest: string }.
        // Dir must be simply copied from src to dest.
        componentYAML.pages.forEach((page) => {
          const src = path.join(srcComponentPath, page.src);
          const dest = path.join(APP_PATH, page.dest);
          fse.copySync(src, dest);
          log(`Dedicated page ${page.src} copied to ${page.dest}`);
          log("Checking for mentioned components in the dedicated page...");
          if (!src.endsWith(".tsx")) {
            const tsxFiles = fs
              .readdirSync(src)
              .filter((file) => file.endsWith(".tsx"));
            log(`Found ${tsxFiles.length} .tsx file(s) in ${src}`);
            const tsxFilePaths = tsxFiles.map((file) => path.join(src, file));
            tsxFilePaths.forEach((filePath) => {
              const otherComponents = chkMentionComp(filePath, componentName);
              // Setting the process name again after the recursive call
              process.title = cfgComp.name;
              if (otherComponents.length > 0) {
                otherComponents.forEach((otherComponent) => {
                  cfgComp({
                    component: { component_name: otherComponent },
                    config,
                    theme,
                  });
                });
              }
            });
          } else {
            const otherComponents = chkMentionComp(src, componentName);
            if (otherComponents.length > 0) {
              otherComponents.forEach((otherComponent) => {
                cfgComp({
                  component: { component_name: otherComponent },
                  config,
                  theme,
                });
              });
            }
          }
          // [dest] Alter absolute paths in the dedicated page(s) from @/common/components to @/app/components.
          log("Altering absolute paths in the dedicated pages(s)");
          if (!dest.endsWith(".tsx")) {
            const tsxFiles = fs
              .readdirSync(dest)
              .filter((file) => file.endsWith(".tsx"));
            const tsxFilePaths = tsxFiles.map((file) => path.join(dest, file));
            tsxFilePaths.forEach((filePath, index) => {
              log(`Altering absolute paths in ${filePath}`);
              const filePathDest = filePath;
              const filePathSrc = path.join(src, tsxFiles[index]);
              alterImports(filePathSrc, filePath);
            });
          } else {
            log(`Altering absolute paths in ${dest}`);
            alterImports(src, dest);
          }
        });
      }
    }

    // check if there is modifed CSS module, if so, copy it to the component folder
    // !! must be placed after the copy of the component folder
    if (config.theme && theme) {
      const themedComponent = theme.components.find(
        (themedComp) => themedComp.component_name === componentName
      );
      if (themedComponent) {
        if (themedComponent.modified_styles) {
          // core CSS Module name
          const componentPath = path.join(
            `${CORE_COMPONENTS_PATH}`,
            `${componentName}`,
            `${capitalizeFirstChar(componentName)}.tsx`
          );
          const cssModulePath = extractCSSModulePath(componentPath);
          if (!cssModulePath) {
            log(
              chalk.red(
                `Component ${componentName} does not have an initial CSS Module, therefore custom styles from cannot be applied. Please remove the "modified_styles" property from the theme's theme.yaml file.`
              )
            );
          } else {
            // replace the core CSS Module with the themed CSS Module with the same file name.
            fse.copyFileSync(
              path.resolve(
                `${THEMES_PATH}`,
                `${config.theme}`,
                `${themedComponent.modified_styles}`
              ),
              path.resolve(`${destComponentPath}`, `${cssModulePath}`)
            );
            log(
              chalk.green(
                `Replaced ${componentName}'s CSS Module with theme's CSS module`
              )
            );
          }
        }
      }
    }
  } catch (error) {
    log(`Error configuring component ${component.component_name}`);
    console.error(error);
    process.exit(1);
  } finally {
    return modifiedComponent;
  }
}

function copyRequiredComponents(config, theme) {
  let modifiedConfig = { ...config };
  if (!config.pages) {
    console.error("No pages found in the config file!");
    process.exit(1);
  }

  // page's components
  modifiedConfig.pages = config.pages.map((page) => {
    return {
      ...page,
      components: page.components.map((component) => {
        return cfgComp({
          component,
          config: modifiedConfig,
          theme,
        });
      }),
    };
  });

  // root components
  if (config.root_components) {
    modifiedConfig.root_components = config.root_components.map((component) => {
      return cfgComp({ component, config: modifiedConfig, theme });
    });
  }

  // return modified config
  return modifiedConfig;
}

function findTheme(themeName, THEME_PATH, themeInfoFilePath) {
  process.title = findTheme.name;
  log(`Searching for "${themeName}" theme...`);
  if (!fs.existsSync(themeInfoFilePath)) {
    log(chalk.red(`Theme "${themeName}" was not found in ${THEME_PATH}!`));
    log("Continuing without a theme");
    // raise na error
    throw new Error(`Theme "${themeName}" was not found in ${THEME_PATH}!`);
  } else {
    log(chalk.green(`Found "${themeName}" theme`));
  }
}

function getTheme(themeName) {
  const THEME_PATH = path.join(APP_PATH, "./theme");
  const themeInfoFilePath = `${THEME_PATH}/theme.yaml`;
  findTheme(themeName, THEME_PATH, themeInfoFilePath);
  const theme = parseYAML(themeInfoFilePath);
  return theme;
}

export function initApp(config) {
  let modifiedConfig = config;
  let theme = null;
  // Setting the process name for better debugging.
  process.title = initApp.name;
  log("creating app folder at " + APP_PATH);
  fse.emptyDirSync(APP_PATH);
  // copy theme to the app folder
  if (config.theme) {
    log(`copying theme dir "${config.theme}" to ${APP_THEME_PATH}`);
    fse.copySync(path.resolve(THEMES_PATH, config.theme), APP_THEME_PATH);
    theme = getTheme(config.theme);
  }
  // copy all the necessary components to the app folder
  modifiedConfig = copyRequiredComponents(modifiedConfig, theme);
  // copy all the necessary styles to the app folder
  fse.copySync(STYLES_PATH, APP_STYLES_PATH);
  // copy all the necessary types to the app folder
  fse.copySync(TYPES_PATH, APP_TYPES_PATH);
  // copy utils to the app folder
  fse.copySync(UTILS_PATH, APP_UTILS_PATH);
  // copy mui to the app folder
  fse.copySync(MUI_PATH, APP_MUI_PATH);
  return [modifiedConfig, theme];
}
