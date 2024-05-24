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

export function ensureRelativePath(str) {
  // Check if the string starts with "./", "../", or "/"
  if (/^(\.\/|\.\.\/|\/)/.test(str)) {
    return str;
  }
  // If not, prepend "./"
  return `./${str}`;
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

export function extractCSSModuleName(path) {
  try {
    const data = fs.readFileSync(path, { encoding: "utf8" });
    const regex = /["'][^"']*\/([^"']*\.module\.css)["']/;
    const match = data.match(regex);
    return match[1];
  } catch (error) {
    return null;
  }
}
