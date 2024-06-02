import React from "react";
import module from "./Blog.module.css";
import { formatDate, getBlogPosts } from "./utils";
import Link from "next/link";

interface BlogOptions {
  title: string;
}

interface NavbarProps {
  options: BlogOptions;
}

function Blog({ options }: NavbarProps) {
  let allBlogs = getBlogPosts();
  return (
    <div>
      <h4>{options.title ? options.title : "Blog"}</h4>
      <div>
        {allBlogs.length > 0
          ? allBlogs
              .sort((a, b) => {
                if (
                  new Date(a.metadata.publishedAt) >
                  new Date(b.metadata.publishedAt)
                ) {
                  return -1;
                }
                return 1;
              })
              .map((post) => (
                <Link
                  key={post.slug}
                  className="flex flex-col space-y-1 mb-4"
                  href={`/post/${post.slug}`}
                >
                  <div className="w-full flex flex-col md:flex-row space-x-0 md:space-x-2">
                    <p className="text-neutral-600 dark:text-neutral-400 w-[100px] tabular-nums">
                      {formatDate(post.metadata.publishedAt, false)}
                    </p>
                    <p className="text-neutral-900 dark:text-neutral-100 tracking-tight">
                      {post.metadata.title}
                    </p>
                  </div>
                </Link>
              ))
          : "Nothing here"}
      </div>
    </div>
  );
}

export default Blog;
