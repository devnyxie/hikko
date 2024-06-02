import { parseYAML, welcomeMessage } from "./utils.js";
import initLayout from "./initLayout.js";
import initPages from "./initPages.js";
import { setupComponents } from "./setupComponents.js";
import { initApp } from "./initApp.js";

export const APP_PATH = "./app";
const CONFIG_PATH = "./config.yaml";

function main() {
  // ---
  let config = null;
  let theme = null;
  // ---
  welcomeMessage();
  config = parseYAML(CONFIG_PATH);
  if (!config) {
    return;
  }
  // create app folder with all the necessary files
  theme = initApp(config);
  // theme implementation
  config = setupComponents(config, theme);
  // create layout with root components (e.g navbar, footer, etc.)
  initLayout(config, theme);
  // create pages with selected components
  initPages(config.pages);
}

// run the configurator
main();
