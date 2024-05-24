import fse from "fs-extra";
import { log, parseYAML, welcomeMessage } from "./utils.js";
import initLayout from "./initLayout.js";
import initPages from "./initPages.js";
import { initTheme } from "./initTheme.js";
import { initApp } from "./initApp.js";

export const APP_PATH = "./app";
const CONFIG_PATH = "./config.yaml";

function main() {
  // ---
  let config = null;
  let theme = null;
  // ---
  // print out welcome message
  welcomeMessage();
  // parse the config file
  config = parseYAML(CONFIG_PATH);
  // create app folder with all the necessary files
  theme = initApp(config);
  // theme implementation
  config = initTheme(config, theme);
  // create layout with root components (e.g navbar, footer, etc.)
  initLayout(config);
  // create pages with selected components
  initPages(config.pages);
}

// run the configurator
main();
