import { Config } from "../types/Config";

export default async function importConfig() {
  // --- Importing modules dynamically
  const path = await import("path");
  const fs = await import("fs");
  const yaml = await import("js-yaml");
  // --- Reading the config file
  const filePath = path.join(process.cwd(), "config.yaml");
  const fileContents = fs.readFileSync(filePath, "utf8");
  const config = yaml.load(fileContents) as Config;
  return config;
}

// --- Importing a specific value from the config, e.g site_title
export async function importConfigValue(key: string) {
  const config = await importConfig();
  return config[key as keyof Config];
}
