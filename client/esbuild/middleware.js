import { exec } from "child_process";

const startPagesConf = () => {
  exec("node ./configurePages.js", (error, stdout, stderr) => {
    if (error) {
      console.error(`exec error: ${error}`);
      return;
    }
    console.log(`${stdout}`);
    if (stderr) {
      console.error(`stderr: ${stderr}`);
    }
  });
};

// on browser request
const appConfigurator = ({ req, res, next, initial = false }) => {
  // in order to escape multiple executions of the script, we will require a vite referer.
  if (req?.headers?.referer) {
    if (req.headers.referer.includes("@vite")) {
      console.log("Browser Refresh detected. Looking for changes...");
      startPagesConf();
    }
  } else {
    if (initial && !req && !res && !next) {
      console.log("Initial configuration...");
      startPagesConf();
    }
  }
  next();
};

export default (req, res, next) => {
  appConfigurator({ req, res, next });
};
