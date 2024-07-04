import React from "react";
import module from "./styles/Blog.module.css";
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
    <div className={module.blog}>
      <h1>{options.title ? options.title : ""}</h1>
      <div className={module.postsContainer}>
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
                  className={module.post}
                  href={`/post/${post.slug}`}
                >
                  <p className={module.date}>
                    {formatDate(post.metadata.publishedAt, false)}
                  </p>

                  <p className={module.title}>{post.metadata.title}</p>
                </Link>
              ))
          : "Nothing here"}
      </div>
    </div>
  );
}

export default Blog;
