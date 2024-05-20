import chalk from "chalk";
import fs from "fs";
import { parse } from "yaml";
import path from "path";

export function log(...args) {
  console.log(chalk.dim(`[${process.title}]:`, ...args));
}

export function capitalizeFirstChar(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function insertContentBetweenStrings(
  input,
  startString,
  endString,
  content
) {
  console.log("[insertContentBetweenStrings]: searching for", startString);
  const startIndex = input.indexOf(startString);
  const endIndex = input.indexOf(endString, startIndex + startString.length);

  if (startIndex === -1 || endIndex === -1) {
    throw new Error("Start or end string not found in input");
  }

  const before = input.substring(0, endIndex);
  const after = input.substring(endIndex);

  console.log(`[insertContentBetweenStrings]: added "${content}"`);

  return before + `${content}` + `${after}`;
}

export function welcomeMessage() {
  const start = `₍ᐢ. .ᐢ₎ ₊˚⊹♡  ✧  `;
  const message = `Welcome to the configurator!`;
  const end = ` ✧  ♡⊹˚₊ ₍ᐢ. .ᐢ₎`;
  console.log(chalk.cyan(start) + chalk.cyan.bold(message) + chalk.cyan(end));
}

export function parseYAML(path) {
  process.title = parseYAML.name;
  log(`Parsing a YAML file at ${path}`);
  const config = fs.readFileSync(path, "utf8");
  return parse(config);
}

export function selectCompToInsert({
  component,
  themedComponents,
  themeName,
  isRoot,
}) {
  process.title = selectCompToInsert.name;
  let modifiedComponent = component;
  const coreComponentName = component.componentName;
  // core component path
  if (isRoot) {
    modifiedComponent.path = `../common/components/${coreComponentName}/${capitalizeFirstChar(
      coreComponentName
    )}`;
  } else {
    modifiedComponent.path = `../../common/components/${coreComponentName}/${capitalizeFirstChar(
      coreComponentName
    )}`;
  }
  // end
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
      if (themedComponent.modifiedComponentPath) {
        if (isRoot) {
          modifiedComponent.path = path.join(
            `../common/themes/${themeName}/`,
            themedComponent.modifiedComponentPath
          );
        } else {
          modifiedComponent.path = path.join(
            `../../common/themes/${themeName}/`,
            themedComponent.modifiedComponentPath
          );
        }
        console.log(
          "changing " +
            coreComponentName +
            " options to modifiedComponentOptions"
        );
        modifiedComponent.options = themedComponent.modifiedComponentOptions;
      } else {
        // appending themed components options to core component
        const { modifiedComponentOptions, modifiedComponentPath, ...rest } =
          themedComponent;
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
    // console.error(error);
    return modifiedComponent;
  }
}
