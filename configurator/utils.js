import chalk from "chalk";
import fs from "fs";
import { parse } from "yaml";

export function log(...args) {
  console.log(chalk.dim(`[${process.title}]:`, ...args));
}

export function capitalizeFirstChar(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
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
  try {
    const config = fs.readFileSync(path, "utf8");
    return parse(config);
  } catch (error) {
    console.error(chalk.red(`${path} doesn't exist.`));
  }
}

export function extractCSSModuleName(path) {
  try {
    log(`Extracting CSS module name from ${path}`);
    const data = fs.readFileSync(path, { encoding: "utf8" });
    const regex = /["'][^"']*\/([^"']*\.module\.css)["']/;
    const match = data.match(regex);
    return match[1];
  } catch (error) {
    return null;
  }
}

export function extractCSSModulePath(path) {
  try {
    log(`Extracting CSS module path from ${path}`);
    const data = fs.readFileSync(path, { encoding: "utf8" });
    const regex = /"([^"]*\.module\.css)"/;
    const match = data.match(regex);
    return match[1];
  } catch (error) {
    return null;
  }
}
