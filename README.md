<div >
  <img width="100" height="auto"  src="./assets/logo.svg">
</div>

<br/>

**hikko** is a unique client and CMS combo designed to streamline website updates without relying on APIs for data delivery. By pushing changes directly to GitHub, it optimizes the workflow while continuing to utilize SSG and CDN.<br/>

### Enhanced Developer Experience

With the help of [@angular-builders/custom-esbuild](https://github.com/just-jeb/angular-builders) and its plugins and middleware, we're able to ensure that all Pages and `app.routes.ts` are generated before starting `ng serve` or `ng build`. Plus, to save us from manually restarting the server while tweaking configs, we've set it up to automatically check with each config change and browser refresh.

By utilizing a single config file to specify pages and components, our Angular client generates custom router and pages with selected component declarations. Additionally, it's in the roadmap that a single Theme will be able to override specific HTML parts of the application by simply declaring themed versions of certain components. Thanks to our plugins and middleware, we can search for theme's components and choose which components to use at build time, so this process won't affect performance in any way.

### Local Development

#### Client

Clone the repository:

1. git clone git@github.com:devnyxie/hikko.git
   Navigate to the client directory:
2. cd hikko/client
   Install dependencies:
3. npm install
   Start the development server:
4. npm run dev

Note: While you can still use `ng serve`, it is recommended to use `npm run dev` as it triggers the config setup script for a smoother development experience.
