import fse from "fs-extra";
import fs from "fs";
import { APP_PATH } from "./index.js";
import {
  capitalizeFirstChar,
  extractCSSModuleName,
  log,
  parseYAML,
} from "./utils.js";
import path from "path";
import chalk from "chalk";

const REDUX_PATH = "./common/redux";
const APP_REDUX_PATH = "./app/redux";
const COMPONENTS_PATH = "./common/components";
const APP_COMPONENTS_PATH = "./app/components";
const STYLES_PATH = "./common/styles";
const APP_STYLES_PATH = "./app/styles";
const THEMES_PATH = "./common/themes";
const APP_THEME_PATH = "./app/theme";
const TYPES_PATH = "./common/types";
const APP_TYPES_PATH = "./app/types";
const UTILS_PATH = "./common/utils";
const APP_UTILS_PATH = "./app/utils";

function initReduxStoreProvider() {
  const storeProviderContent = `
    "use client";
    import { useRef } from "react";
    import { makeStore, AppStore } from "../common/redux/store";
    import { Provider } from "react-redux";

    export default function StoreProvider({
      children,
    }: {
      children: React.ReactNode;
    }) {
      const storeRef = useRef<AppStore>();
      if (!storeRef.current) {
        // Create the store instance the first time this renders
        storeRef.current = makeStore();
      }

      return <Provider store={storeRef.current}>{children}</Provider>;
    }
  `;
  fse.writeFileSync(`${APP_PATH}/StoreProvider.tsx`, storeProviderContent);
}

function alterPageAbsolutePaths(filePath) {
  const from = "@/common/components";
  const to = "@/app/components";
  function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); // $& means the whole matched string
  }
  const fileContent = fs.readFileSync(filePath, "utf8");
  const escapedFrom = escapeRegExp(from);
  const newContent = fileContent.replace(new RegExp(escapedFrom, "g"), to);
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
  console.log(relativePaths);
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

function checkForMentionedComponents(filePath, componentName) {
  process.title = checkForMentionedComponents.name;
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

function configureComponent({ component, config, theme }) {
  process.title = configureComponent.name;
  const componentName = component.componentName;
  const componentPath = `${COMPONENTS_PATH}/${componentName}`;
  const coreComponentExist = fse.existsSync(componentPath);
  if (!coreComponentExist) {
    log(
      chalk.red(
        `Component ${componentName} does not exist in ${COMPONENTS_PATH}`
      )
    );
    throw new Error(
      `Component ${componentName} does not exist in ${COMPONENTS_PATH}`
    );
  }

  // SRC path
  let srcComponentPath = path.join(COMPONENTS_PATH, `${componentName}`);

  // DEST path
  let destComponentPath = path.join(APP_COMPONENTS_PATH, `${componentName}`);

  // check if component requires other components
  const otherComponents = checkForMentionedComponents(
    path.join(srcComponentPath, `${capitalizeFirstChar(componentName)}.tsx`),
    componentName
  );
  if (otherComponents.length > 0) {
    otherComponents.forEach((otherComponent) => {
      configureComponent({
        component: { componentName: otherComponent },
        config,
        theme,
      });
    });
  }

  // Setting the process name again after the recursive call
  process.title = configureComponent.name;

  // if the component has altered options/structure in the theme
  if (config.theme && theme) {
    const themedComponent = theme.components.find(
      (themedComp) => themedComp.componentName === componentName
    );
    if (themedComponent) {
      // if the component has been altered in the theme, copy the entire component's folder
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
        log(`Replaced ${componentName} with the themed version`);
        return;
      }
    }
  }

  // If the component has not been altered in the theme, copy the core component.
  log(`copying core "${componentName}" component to ${APP_COMPONENTS_PATH}`);
  fse.copySync(srcComponentPath, destComponentPath);

  // Check if the component requires the creation of a dedicated page (e.g., blog post page)
  const componentYAMLPath = path.join(srcComponentPath, "component.yaml");
  log(`Checking for component.yaml file at ${componentYAMLPath}...`);
  if (fse.existsSync(componentYAMLPath)) {
    log(chalk.green(`Found component.yaml file at ${componentYAMLPath}`));
    const componentYAML = parseYAML(componentYAMLPath);
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
            const otherComponents = checkForMentionedComponents(
              filePath,
              componentName
            );
            if (otherComponents.length > 0) {
              otherComponents.forEach((otherComponent) => {
                configureComponent({
                  component: { componentName: otherComponent },
                  config,
                  theme,
                });
              });
            }
          });
        } else {
          const otherComponents = checkForMentionedComponents(
            src,
            componentName
          );
          if (otherComponents.length > 0) {
            otherComponents.forEach((otherComponent) => {
              configureComponent({
                component: { componentName: otherComponent },
                config,
                theme,
              });
            });
          }
        }
        // [dest] Alter absolute paths in the dedicated page(s) from @/common/components to @/app/components.
        log("Altering absolute paths in the dedicated pages(s)");
        console.log("dest:", dest);
        if (!dest.endsWith(".tsx")) {
          const tsxFiles = fs
            .readdirSync(dest)
            .filter((file) => file.endsWith(".tsx"));
          const tsxFilePaths = tsxFiles.map((file) => path.join(dest, file));
          tsxFilePaths.forEach((filePath, index) => {
            log(`Altering absolute paths in ${filePath}`);
            const filePathDest = filePath;
            const filePathSrc = path.join(src, tsxFiles[index]);
            console.log(filePathSrc, filePathDest);
            alterImports(filePathSrc, filePath);
            // alterPageAbsolutePaths(
            //   filePath,
            //   "@/common/components",
            //   "@/app/components"
            // );
            // updatePageImportPaths(
            //   path.join(src, tsxFiles[index]),
            //   path.join(dest, tsxFiles[index])
            // );
          });
        } else {
          log(`Altering absolute paths in ${dest}`);
          // alterPageAbsolutePaths(
          //   dest,
          //   "@/common/components",
          //   "@/app/components"
          // );
          // updatePageImportPaths(src, dest);
          alterImports(src, dest);
        }
      });
    }
  }

  // check if there is modifed CSS module, if so, copy it to the component folder
  if (config.theme && theme) {
    const themedComponent = theme.components.find(
      (themedComp) => themedComp.componentName === componentName
    );
    if (!themedComponent) {
      return;
    }
    if (themedComponent.modifiedStyles) {
      // core CSS Module name
      const cssModulePath = path.join(
        `${COMPONENTS_PATH}`,
        `${componentName}`,
        `${capitalizeFirstChar(componentName)}.tsx`
      );
      const coreCSSModuleName = extractCSSModuleName(cssModulePath);
      if (!coreCSSModuleName) {
        log(
          chalk.red(
            `Component ${componentName} does not have an initial CSS Module, therefore custom styles from cannot be applied. Please remove the "modifiedStyles" property from the theme's info.yaml file.`
          )
        );
      } else {
        // replace the core CSS Module with the themed CSS Module with the same file name.
        fse.copyFileSync(
          path.resolve(
            `${THEMES_PATH}`,
            `${config.theme}`,
            `${themedComponent.modifiedStyles}`
          ),
          path.resolve(`${destComponentPath}`, `${coreCSSModuleName}`)
        );
        log(
          chalk.green(
            `Replaced ${componentName}'s ${coreCSSModuleName} with custom styles module`
          )
        );
      }
    }
  }
}

function copyRequiredComponents(config, theme) {
  // page's components
  config.pages &&
    config.pages.forEach((page) => {
      page.components.forEach((component) => {
        configureComponent({ component, config, theme });
      });
    });
  // root components
  config.rootComponents &&
    config.rootComponents.forEach((component) => {
      configureComponent({ component, config, theme });
    });
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
  const themeInfoFilePath = `${THEME_PATH}/info.yaml`;
  findTheme(themeName, THEME_PATH, themeInfoFilePath);
  const theme = parseYAML(themeInfoFilePath);
  return theme;
}

export function initApp(config) {
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
  copyRequiredComponents(config, theme);
  // copy all the necessary styles to the app folder
  fse.copySync(STYLES_PATH, APP_STYLES_PATH);
  // copy all the necessary types to the app folder
  fse.copySync(TYPES_PATH, APP_TYPES_PATH);
  // copy utils to the app folder
  fse.copySync(UTILS_PATH, APP_UTILS_PATH);
  // copy redux to the app folder
  fse.copySync(REDUX_PATH, APP_REDUX_PATH);
  // create StoreProvider.tsx file
  initReduxStoreProvider();
  return theme;
}
