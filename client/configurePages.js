import { parse, stringify } from "yaml";
import fs from "fs";

// pages.yaml config parsing
const pagesConfig = parse(fs.readFileSync("./pages.yaml", "utf8"));

function capitalizeFirstChar(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

//function for checking whether files of all pages from pages.yaml already exist, and if they do, transform them to text and check for components
function checkIfPagesComponentsExist() {
  const pagesDirPath = "./src/app/pages";
  const pages = fs.readdirSync(pagesDirPath);
  console.log("pages:", pages);
  for (const page of pagesConfig.pages) {
    const filename = `${page.name}.component.ts`;
    if (!pages.includes(filename)) {
      console.log("Page was not found, generating:", filename);
      return false;
    }
    const pageText = fs.readFileSync(`${pagesDirPath}/${filename}`, "utf8");
    for (const component of page.components) {
      if (!pageText.includes(`${capitalizeFirstChar(component)}Component`)) {
        console.log(
          "Component declaration was not found, generating:",
          component
        );
        return false;
      }
    }
  }
  return true;
}

function log(...args) {
  console.log(`[configure-pages-process]`, ...args);
}

export function ConfigurePages() {
  try {
    if (checkIfPagesComponentsExist()) {
      log("Pages already exist, skipping...");
      return;
    }
    //Create empty pages directory
    const pagesDirPath = "./src/app/pages";
    if (fs.existsSync(pagesDirPath)) {
      fs.rmSync(pagesDirPath, { recursive: true });
    }
    fs.mkdirSync(pagesDirPath, { recursive: true });

    //Generate Pages
    log("Crafting Pages...");
    for (const page of pagesConfig.pages) {
      // Create a file for each page
      fs.writeFileSync(
        `./src/app/pages/${page.name}.component.ts`,
        `
      import { Component } from '@angular/core';
     
      ${page.components
        .map((component) => {
          return `import { ${capitalizeFirstChar(
            `${component}Component`
          )} } from '../${component.toLowerCase()}/${component.toLowerCase()}.component';`;
        })
        .join("\n")}      
  
      @Component({
      selector: 'app-${page.name}-page',
      standalone: true,
      imports: [${page.components.map((component) => {
        return `${capitalizeFirstChar(`${component}Component`)}`;
      })}],
      template: \`${page.components
        .map((component) => {
          return `<${`app-${component.toLowerCase()}`}></${`app-${component.toLowerCase()}`}>`;
        })
        .join("\n")}\`,
      })
      export class ${page.name} {}
      `
      );
    }

    //Generate app.router.ts
    log("Spawning Router...");
    fs.writeFileSync(
      `./src/app/app.routes.ts`,
      `
    import { Routes } from '@angular/router';
    ${pagesConfig.pages
      .map((page) => {
        return `import { ${page.name} } from './pages/${page.name}.component';`;
      })
      .join("\n")}
  
    export const routes: Routes = [
      ${pagesConfig.pages
        .map((page) => {
          return `{ path: '${page.path ?? ""}', component: ${page.name} },`;
        })
        .join("\n")}
    ];
    `
    );
  } catch (error) {
    //break app
    console.error(`Error executing script: ${error}`);
    process.exit(1);
  }
}

ConfigurePages();
