import { APP_PATH } from "./index.js";
import { capitalizeFirstChar, log } from "./utils.js";
import fse from "fs-extra";

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
      log("Page detected at index " + index);
      // create page folder
      const pagePath = `${APP_PATH}/${page.name}`;
      fse.mkdirSync(pagePath);
      // create page.tsx file in the page folder
      fse.writeFileSync(`${pagePath}/page.tsx`, content);
      log(
        `Page "${page.name}" successfully created at ` + pagePath + "/page.tsx"
      );
    }
  });
}
