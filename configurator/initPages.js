import { APP_PATH } from "./index.js";
import { capitalizeFirstChar, log } from "./utils.js";
import fse from "fs-extra";
import fs from "fs";
import path from "path";

function isNestedPage(url) {
  if (!url.startsWith("/")) {
    url = "/" + url;
  }

  const parts = url.split("/");

  return parts.length > 2 && parts[2].length > 0;
}

export default function initPages(pages) {
  // Setting the process name for better debugging.
  process.title = initPages.name;
  log("Started pages initialization");
  pages.forEach((page, index) => {
    const isPageRoot = page.path === "" || page.path === "/";
    // page content
    const content = `
    import React from "react";
    // imports start
    ${page.components
      .map((component) => {
        const componentName = component.componentName;
        return `\nimport ${capitalizeFirstChar(componentName)} from "${
          component.path
        }";`;
      })
      .join("")}
    // imports end
    export default function Page() {
      // components options [start]
      ${page.components
        .map((component) => {
          if (component.options) {
            const componentName = component.componentName;
            return `\nconst ${componentName}_options = ${JSON.stringify(
              component.options
            )};`;
          }
        })
        .join("")}
      // components options [end]
      return (
            <>
                {/* components start */}
                ${page.components
                  .map((component) => {
                    const componentName = component.componentName;
                    return `\n<${capitalizeFirstChar(componentName)} ${
                      component.options
                        ? `options={${componentName}_options}`
                        : ``
                    } />`;
                  })
                  .join("")}
                {/* components end */}
            </>
        );
    };
    
    `;
    if (isPageRoot) {
      log("Root page detected at index " + index);
      // create page.tsx file in the app folder
      fse.writeFileSync(`${APP_PATH}/page.tsx`, content);
      log("Root page successfully created at " + APP_PATH + "/page.tsx");
    } else {
      if (isNestedPage(page.path)) {
        log("Nested page detected at index " + index);
        const parentPagePath = path.join(APP_PATH, page.path, "page.tsx");
        //create dir
        const dirPath = path.join(APP_PATH, page.path);
        fse.mkdirSync(dirPath, { recursive: true });
        // create page file
        fse.writeFileSync(parentPagePath, content);
        log(`Nested page "${page.name}" created at` + parentPagePath);
      } else {
        log("Page detected at index " + index);
        // create page folder
        const pagePath = `${APP_PATH}/${page.name}`;
        fse.mkdirSync(pagePath);
        fse.writeFileSync(`${pagePath}/page.tsx`, content);
        log(
          `Page "${page.name}" successfully created at ` +
            pagePath +
            "/page.tsx"
        );
      }
    }
  });
}
