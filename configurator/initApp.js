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

const extractFolderName = (input) => {
  const regex = /^import\s+.*?from\s+['"]\.\.\/([^\/]+)\/[^\/]+['"]/;
  const match = input.match(regex);
  return match ? match[1] : null;
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
    const folderName = extractFolderName(line);
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
  // check if such component exists in ./common/components
  const coreComponentExist = fse.existsSync(
    `${COMPONENTS_PATH}/${componentName}`
  );
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
  let srcComponentPath = path.resolve(COMPONENTS_PATH, `${componentName}`);

  // DEST path
  let destComponentPath = path.resolve(APP_COMPONENTS_PATH, `${componentName}`);

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

  // if the component has altered options/style/structure in the theme
  if (config.theme && theme) {
    console.log("theme", theme);
    const themedComponent = theme.components.find(
      (themedComp) => themedComp.componentName === componentName
    );
    if (themedComponent) {
      if (themedComponent.modifiedComponentDir) {
        log(
          `Component ${componentName} has been altered in theme "${config.theme}"`
        );
        // Replace entire component
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
      console.log("coreCSSModuleName", cssModulePath, coreCSSModuleName);

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
  config.pages.forEach((page) => {
    page.components.forEach((component) => {
      configureComponent({ component, config, theme });
    });
  });
  // root components
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
