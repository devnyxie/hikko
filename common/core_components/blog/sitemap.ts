import { getBlogPosts } from "./utils";

export const baseUrl = process.env.baseUrl;

export default async function sitemap() {
  if (!baseUrl) {
    console.log("baseUrl is not provided. Sitemap can not be generated.");
    return;
  }
  let blogs = getBlogPosts().map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: post.metadata.publishedAt,
  }));

  let routes = ["", "/blog"].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date().toISOString().split("T")[0],
  }));

  return [...routes, ...blogs];
}
