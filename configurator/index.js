import { parse } from "yaml";
import fs from "fs";
import fse from "fs-extra";
import { log, getComponentName, capitalizeFirstChar } from "./utils.js";

/*
--- Configurator ---


1: parse config file (config.yaml)
1.5: create layout with all rootComponents
2: create folders with page.tsx for each page in the config file, if its root page, create just a file without folder.
    2.1: for each component, copy it from the /components folder to the app/components folder.
    2.2: each page.tsx must:
        2.2.1: render the components specified in the config file, importing them from the app/components folder.
        2.2.2: pass the props specified in the config file to the components.

we can re-create whole app folder on-changem, but we can also just re-create the (components,pages).

--- App ---
1: run the app (next dev)
*/

const CONFIG_PATH = "./config.yaml";
const COMPONENTS_PATH = "./common/components";
const STYLES_PATH = "./common/styles";
const FAVICONS_PATH = "./common/favicons";
const UTILS_PATH = "./common/utils";
const TYPES_PATH = "./common/types";
const APP_PATH = "./app";

// parse config file (config.yaml)
const config = parse(fs.readFileSync(CONFIG_PATH, "utf8"));

//create initial structure of the app
function createAppFolder() {
  log("[createAppFolder]: creating app folder");
  fse.emptyDirSync(APP_PATH);
  fse.copySync(COMPONENTS_PATH, `${APP_PATH}/components`);
  fse.copySync(STYLES_PATH, `${APP_PATH}/styles`);
  fse.copySync(FAVICONS_PATH, `${APP_PATH}/favicon`);
  fse.copySync(UTILS_PATH, `${APP_PATH}/utils`);
  fse.copySync(TYPES_PATH, `${APP_PATH}/types`);
}

function initLayout() {
  log("[initLayout]: starting layout initialization");
  let htmlContent = `
    import type { Metadata } from "next";
    import { Inter } from "next/font/google";
    import "./styles/globals.css";
    import React from "react";
    /*imports [start]*/
    ${config.rootComponents
      .map((component) => {
        if (!component.placement) {
          console.error("[initLayout]: component does not have a placement");
        }
        const componentName = getComponentName(component);
        const capitalizedComponentName = capitalizeFirstChar(componentName);
        return `\nimport ${capitalizedComponentName} from "./components/${componentName}/${capitalizedComponentName}";`;
      })
      .join("")}
    /*imports [end]*/
    
    const inter = Inter({ subsets: ["latin"] });
    
    export const metadata: Metadata = {
        title: "${config.site_title}",
        description: "${config.site_description}",
        icons: {
          icon: "./favicon/favicon.svg",
        },
    };
    
    export default async function RootLayout({
        children,
    }: Readonly<{
        children: React.ReactNode;
    }>) {
        return (
        <html lang="en">
            <body className={inter.className}>
            <div>
              {/*placement: top [start]*/}
              ${config.rootComponents
                .map((component) => {
                  if (component.placement === "top") {
                    if (!component.placement) {
                      console.error(
                        "[initLayout]: component does not have a placement"
                      );
                    }
                    const componentName = getComponentName(component);
                    const capitalizedComponentName =
                      capitalizeFirstChar(componentName);
                    return `\n<${capitalizedComponentName}/>`;
                  }
                })
                .join("")}
              {/*placement: top [end]*/}
            </div>
            <main>{children}</main>
            <div>
              {/* placement: bottom [start] */}
              ${config.rootComponents
                .map((component) => {
                  if (component.placement === "bottom") {
                    if (!component.placement) {
                      console.error(
                        "[initLayout]: component does not have a placement"
                      );
                    }
                    const componentName = getComponentName(component);
                    const capitalizedComponentName =
                      capitalizeFirstChar(componentName);
                    return `\n<${capitalizedComponentName}/>`;
                  }
                })
                .join("")}
              {/* placement: bottom [end] */}
            </div>
            </body>
        </html>
        );
    }
    `;
  fs.writeFileSync(`./app/layout.tsx`, htmlContent);
  log("[initLayout]: finished layout initialization");
}

function main() {
  // create app folder with all the necessary files
  createAppFolder();
  // create layout with root components (e.g navbar, footer, etc.)
  initLayout(config.rootComponents);
}

// run the configurator
main();
