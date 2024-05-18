import { parse } from "yaml";
import fs from "fs";
import fse from "fs-extra";
import { log, welcomeMessage } from "./utils.js";
import initLayout from "./initLayout.js";
import initPages from "./initPages.js";

export const CONFIG_PATH = "./config.yaml";
export const APP_PATH = "./app";

// config format example
/*
site_title: "My Site"
site_description: "This is my site"
pages:
  - name: Home
    path: ""
    components:
      - profile
      - portfolio:
        options:
          title: "My Portfolio"
          items:
            - title: "Project One"
              description: "This is a project"
              image: "https://via.placeholder.com/150"
  - name: about
    path: about
    components:
      - profile
rootComponents: # Components that are inserted into the layout of the page (e.g. navbar, footer)
  - navbar:
    placement: "top" # Inserts the component before or after the page content. Options: top/bottom.
    options: # Component related options
      siteTitleValue: "Hikko"
      links:
        about: "/about"
        portfolio: "/portfolio"
*/

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

function parseConfig() {
  // Setting the process name for better debugging.
  process.title = parseConfig.name;
  log("parsing config file at " + CONFIG_PATH);
  const config = fs.readFileSync(CONFIG_PATH, "utf8");
  return parse(config);
}

// task: pass the configs's components options to the components

function main() {
  // print out welcome message
  welcomeMessage();
  // parse the config file
  const config = parseConfig();
  // create app folder with all the necessary files
  createAppFolder();
  // create layout with root components (e.g navbar, footer, etc.)
  initLayout(config);
  // create pages with selected components
  initPages(config.pages);
}

// run the configurator
main();
