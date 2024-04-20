# hikko

hikko is a unique client and CMS combo designed to streamline website updates without relying on APIs for data delivery. By pushing changes directly to GitHub, it optimizes the workflow while continuing to utilize SSG and CDN.

## Enhanced Developer Experience

With the help of [@angular-builders/custom-esbuild](https://github.com/just-jeb/angular-builders) and its plugins and middleware, we're able to ensure that all Pages and `app.routes.ts` are generated before starting `ng serve` or `ng build`. Plus, to save us from manually restarting the server while tweaking configs, we've set it up to automatically check with each config change and browser refresh.
