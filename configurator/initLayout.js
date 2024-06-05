import { capitalizeFirstChar, log } from "./utils.js";
import fs from "fs";
import path from "path";

export default function initLayout(config, theme) {
  // Setting the process name for better debugging.
  process.title = initLayout.name;
  log("starting layout initialization");
  let htmlContent = "";
  if (!config.root_components) {
    log("root_components not found in config");
    // CLEAN LAYOUT
    htmlContent = `
    import type { Metadata } from "next";
    import { Inter } from "next/font/google";
    import "./styles/globals.css";
    import React from "react";
    /*imports [start]*/
    // STYLES
    ${
      theme.styles &&
      (Array.isArray(theme.styles)
        ? theme.styles
            .map(
              (style) => `\nimport "@/app/${path.join("theme/", `${style}`)}";`
            )
            .join("\n")
        : `\nimport "@/app/${path.join("theme/", `${style}`)}";`)
    }
    /*imports [end]*/
    const inter = Inter({ subsets: ["latin"] });
    
    export const metadata: Metadata = {
        title: "My Site",
        description: "This is my site",
        icons: {
          icon: "./favicon/favicon.svg",
        },
    };
    
    export default async function RootLayout({
        children,
    }: Readonly<{
        children: React.ReactNode;
    }>) {
        // components options [start]
        // components options [end]
        return (
          <html lang="en">
            <body className={inter.className}>
              <div>
                {/*placement: top [start]*/}
                {/*placement: top [end]*/}
              </div>
              <main>{children}</main>
              <div>
                {/* placement: bottom [start] */}
                {/* placement: bottom [end] */}
              </div>
            </body>
          </html>
        );
    }
    
    `;
  } else {
    // MODIFIED LAYOUT
    htmlContent = `
    import type { Metadata } from "next";
    import { Inter } from "next/font/google";
    import "./styles/globals.css";
    import React from "react";
    import ThemeRegistry from "./mui/ThemeRegistry";
    import ColorInit from "./mui/ColorInit";
    /*imports [start]*/
    // STYLES
    ${
      theme.styles &&
      (Array.isArray(theme.styles)
        ? theme.styles
            .map(
              (style) => `\nimport "@/app/${path.join("theme/", `${style}`)}";`
            )
            .join("\n")
        : `\nimport "@/app/${path.join("theme/", `${style}`)}";`)
    }
    // COMPONENTS
    ${
      config.root_components.length > 0 &&
      config.root_components
        .map((component) => {
          if (!component.placement) {
            console.error("component does not have a placement");
          }
          const componentName = component.component_name;
          const capitalizedComponentName = capitalizeFirstChar(componentName);
          return `\nimport ${capitalizedComponentName} from "${component.path}";`;
        })
        .join("")
    }
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
        // components options [start]
        ${
          config.root_components &&
          config.root_components
            .map((component) => {
              if (component.options) {
                const componentName = component.component_name;
                return `\nconst ${componentName}_options = ${JSON.stringify(
                  component.options
                )};`;
              }
            })
            .join("")
        }
        // components options [end]
        return (
          <html lang="en">
            <body className={inter.className}>
              <ColorInit />
              <ThemeRegistry options={{ key: "joy" }}>
                <div className="container">
                  <div>
                    {/*placement: top [start]*/}
                    ${
                      config.root_components &&
                      config.root_components
                        .map((component) => {
                          if (component.placement === "top") {
                            if (!component.placement) {
                              console.error(
                                "component does not have a placement"
                              );
                            }
                            const componentName = component.component_name;
                            const capitalizedComponentName =
                              capitalizeFirstChar(componentName);
                            return `\n<${capitalizedComponentName} ${
                              component.options
                                ? `options={${componentName}_options}`
                                : ``
                            } />`;
                          }
                        })
                        .join("")
                    }
                    {/*placement: top [end]*/}
                  </div>
                  <main>{children}</main>
                  <div>
                    {/* placement: bottom [start] */}
                    ${config.root_components
                      .map((component) => {
                        if (component.placement === "bottom") {
                          if (!component.placement) {
                            console.error(
                              "component does not have a placement"
                            );
                          }
                          const componentName = component.component_name;
                          const capitalizedComponentName =
                            capitalizeFirstChar(componentName);
                          return `\n<${capitalizedComponentName} ${
                            component.options
                              ? `options={${componentName}_options}`
                              : ``
                          } />`;
                        }
                      })
                      .join("")}
                    {/* placement: bottom [end] */}
                  </div>
                </div>
              </ThemeRegistry>
            </body>
          </html>
        );
    }
    `;
  }
  fs.writeFileSync(`./app/layout.tsx`, htmlContent);
  log("finished layout initialization");
}
