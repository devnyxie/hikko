import fse from "fs-extra";
import { log, parseYAML, welcomeMessage } from "./utils.js";
import initLayout from "./initLayout.js";
import initPages from "./initPages.js";
import { initTheme } from "./initTheme.js";

export const APP_PATH = "./app";

const CONFIG_PATH = "./config.yaml";

//create initial structure of the app
function createAppFolder() {
  // Setting the process name for better debugging.
  process.title = createAppFolder.name;
  log("creating app folder at " + APP_PATH);
  fse.emptyDirSync(APP_PATH);
  // create StoreProvider.tsx file in the app folder for global state management
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

// task: pass the configs's components options to the components

function main() {
  // ---
  let config = {};
  // ---
  // print out welcome message
  welcomeMessage();
  // parse the config file
  config = parseYAML(CONFIG_PATH);
  // theme implementation
  config = initTheme(config);
  // create app folder with all the necessary files
  createAppFolder();
  // create layout with root components (e.g navbar, footer, etc.)
  initLayout(config);
  // create pages with selected components
  initPages(config.pages);
}

// run the configurator
main();
