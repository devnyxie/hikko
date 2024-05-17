export function log(...args) {
  console.log(`[configure-pages-process]: `, ...args);
}

export function getComponentName(component) {
  return typeof component === "object" ? Object.keys(component)[0] : component;
}

export function capitalizeFirstChar(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function insertContentBetweenStrings(
  input,
  startString,
  endString,
  content
) {
  console.log("[insertContentBetweenStrings]: searching for", startString);
  const startIndex = input.indexOf(startString);
  const endIndex = input.indexOf(endString, startIndex + startString.length);

  if (startIndex === -1 || endIndex === -1) {
    throw new Error("Start or end string not found in input");
  }

  const before = input.substring(0, endIndex);
  const after = input.substring(endIndex);

  console.log(`[insertContentBetweenStrings]: added "${content}"`);

  return before + `${content}` + `${after}`;
}
