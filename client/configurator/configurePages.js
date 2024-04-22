import { parse, stringify } from "yaml";
import fs from "fs";
import { load } from "cheerio";
import fse from "fs-extra";

// pages.yaml config parsing
const pagesConfig = parse(fs.readFileSync("./pages.yaml", "utf8"));

function capitalizeFirstChar(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function getComponentName(component) {
  return typeof component === "object" ? Object.keys(component)[0] : component;
}

// Copy the component's folders from ../components into the ./src/app/components
// *Why? Because we do not want the user to have all unused components in their repository.
function copyRequiredComponents(pagesConfig) {
  // clear the destination folder
  const componentsDirPath = "./src/app/components";
  if (fs.existsSync(componentsDirPath)) {
    fs.rmSync(componentsDirPath, { recursive: true });
  }
  //get all components from pagesConfig.pages and pagesConfig.rootComponents
  const components = [];
  for (const page of pagesConfig.pages) {
    for (const component of page.components) {
      components.push(component);
    }
  }
  for (const component of pagesConfig.rootComponents) {
    components.push(component);
  }
  //copy the components
  for (const component of components) {
    const componentName = getComponentName(component);
    const source = `../components/${componentName}`;
    const destination = `${componentsDirPath}/${componentName}`;
    // create the destination folder
    fs.mkdirSync(destination, { recursive: true });
    // copy the component's folder
    // fs.cp(`${source}`, `${destination}`, { recursive: true });
    fse.copySync(`${source}`, `${destination}`);
  }
}

function generateTopImports(components, basePath = "../components/") {
  let imports = "";
  for (const component of components) {
    const componentName = getComponentName(component);
    imports += `import { ${capitalizeFirstChar(
      `${componentName}Component`
    )} } from '${basePath}${componentName}/${componentName}.component';\n`;
  }
  return imports;
}

function generateArrayImports(components) {
  let imports = "";
  for (const component of components) {
    const componentName = getComponentName(component);
    imports += `${capitalizeFirstChar(`${componentName}Component`)},`;
  }
  return imports;
}

function generateComponentDeclarations(components) {
  let declarations = "";
  for (const component of components) {
    const componentName = getComponentName(component);
    declarations += `<app-${`${componentName.toLowerCase()}`}></app-${`${componentName.toLowerCase()}`}>\n`;
  }
  return declarations;
}

function clearPagesDir() {
  const pagesDirPath = "./src/app/pages";
  if (fs.existsSync(pagesDirPath)) {
    fs.rmSync(pagesDirPath, { recursive: true });
  }
  fs.mkdirSync(pagesDirPath, { recursive: true });
}

function clearAppHtml() {
  const location = `./src/app/app.component.html`;
  const content = `
  <div class="root">
    <div class="root-top">
    </div>
    <div class="container">
      <router-outlet></router-outlet>
    </div>
    <div class="root-bottom">
    </div>
  </div>`;
  fs.writeFileSync(location, content);
}

function generatePagesWithComponents(pages) {
  for (let page of pages) {
    const components = page.components;
    const content = `
  import { Component } from '@angular/core';
  ${generateTopImports(components)}
  @Component({
    selector: 'app-${page.name}-page',
    standalone: true,
    imports: [${generateArrayImports(components)}],
    template: \`${generateComponentDeclarations(components)}\`,
  })
  export class ${page.name} {};
  `;
    fs.writeFileSync(`./src/app/pages/${page.name}.component.ts`, content);
  }
}

// Generate root component (pagesConfig.rootComponents) declarations in app.component.ts (top, array ones, and in the app.component.html)
function generateRootComponentsDeclarations(rootComponents) {
  // Create/Clear app.component.html
  clearAppHtml();
  log("Generating Root Components Declarations...");
  // --- app.component.ts ---
  const content = `
  import { Component } from '@angular/core';
  import { RouterOutlet } from '@angular/router';
  ${generateTopImports(rootComponents, "./components/")}

  @Component({
    selector: 'app-root',
    standalone: true,
    imports: [RouterOutlet, ${generateArrayImports(rootComponents)}],
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css'],
  })
  export class AppComponent {}
  `;
  fs.writeFileSync(`./src/app/app.component.ts`, content);
  // --- app.component.html ---
  const html = fs.readFileSync(`./src/app/app.component.html`, "utf8");
  const $ = load(html);
  for (const component of rootComponents) {
    const componentName = getComponentName(component);
    if (component.insertInto) {
      const target = component.insertInto ?? ".root";
      if (target) {
        $(`${target}`).append(
          `<app-${componentName.toLowerCase()}></app-${componentName.toLowerCase()}>`
        );
      }
    } else {
      // append to the root container by default
      $(".container").append(
        `<app-${componentName.toLowerCase()}></app-${componentName.toLowerCase()}>`
      );
    }
  }
  fs.writeFileSync(`./src/app/app.component.html`, $.html());
}

function generateRouter(pages) {
  log("Generating Router...");
  let routes = "";
  for (let page of pages) {
    routes += `{ path: '${page.path ?? ""}', component: ${page.name} },\n`;
  }
  const content = `
  import { Routes } from '@angular/router';
  ${pages
    .map(
      (page) => `import {${page.name}} from './pages/${page.name}.component';`
    )
    .join("\n")}

  export const routes: Routes = [
    ${routes}
  ];
  `;
  fs.writeFileSync(`./src/app/app.routes.ts`, content);
}

function setComponentsDefaultOptions(pages) {
  log("Setting Components Default Options...");
  const components = [];
  for (const page of pages) {
    for (const component of page.components) {
      if (typeof component === "object") {
        // set default options here
      }
      components.push(component);
    }
  }
  return components;
}

function log(...args) {
  console.log(`[configure-pages-process]`, ...args);
}

export function ConfigurePages() {
  try {
    // Clear the pages dir
    clearPagesDir();
    // Set default options for components
    setComponentsDefaultOptions(pagesConfig.pages);
    // Copy the required components
    copyRequiredComponents(pagesConfig);
    // Generate pages
    generatePagesWithComponents(pagesConfig.pages);
    // Generate root components declarations
    generateRootComponentsDeclarations(pagesConfig.rootComponents);
    // Generate the router (app.routes.ts)
    generateRouter(pagesConfig.pages);
  } catch (error) {
    //break app
    console.error(`Error executing script: ${error}`);
    process.exit(1);
  }
}

ConfigurePages();
