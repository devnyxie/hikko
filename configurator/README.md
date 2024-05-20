May 19 17:53 2024

Current configurator's flow:

1. Read the ./config.yaml
2. Create ./app dir
3. Create layout.tsx with all Root components.
4. Create page.tsx for root route and dir/page.tsx for each other route, with all specified components.

# Themes Implementation

Now, we need to add the ability to specify&use themes in the config.yaml. Themes are a set of CSS files and Next.js components. Each theme has an info.yaml file with the theme's name, description, and a list of modified components.

My idea is:

1. Read the ./config.yaml
2. Create ./app dir
3. If there is config.theme specified, read the theme's info.yaml and create a list of <strong>themed components</strong>.
   <br/>3.1. layout.tsx/page.tsx: When mapping the components, check if the component is in the list of <strong>themed components</strong>. If it is, use the theme's component instead of the default one. Perhaps creating a function to do so would be a good idea.
