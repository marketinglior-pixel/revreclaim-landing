import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { remark } from "remark";
import html from "remark-html";
import readingTime from "reading-time";

const BLOG_DIR = path.join(process.cwd(), "src/content/blog");

export interface BlogPostMeta {
  slug: string;
  title: string;
  description: string;
  date: string;
  author: string;
  tags: string[];
  image?: string;
  canonical?: string;
  readingTime: string;
}

export interface BlogPost extends BlogPostMeta {
  contentHtml: string;
}

/**
 * Get all blog post slugs (for sitemap + static generation).
 */
export function getAllPostSlugs(): string[] {
  if (!fs.existsSync(BLOG_DIR)) return [];
  return fs
    .readdirSync(BLOG_DIR)
    .filter((f) => f.endsWith(".md"))
    .map((f) => f.replace(/\.md$/, ""));
}

/**
 * Get metadata for all posts, sorted by date (newest first).
 */
export function getAllPosts(): BlogPostMeta[] {
  const slugs = getAllPostSlugs();
  return slugs
    .map((slug) => getPostMeta(slug))
    .filter((p): p is BlogPostMeta => p !== null)
    .sort((a, b) => (a.date > b.date ? -1 : 1));
}

/**
 * Get metadata only (no HTML) — fast, for listing pages.
 */
export function getPostMeta(slug: string): BlogPostMeta | null {
  const filePath = path.join(BLOG_DIR, `${slug}.md`);
  if (!fs.existsSync(filePath)) return null;

  const raw = fs.readFileSync(filePath, "utf-8");
  const { data, content } = matter(raw);
  const stats = readingTime(content);

  return {
    slug,
    title: data.title ?? slug,
    description: data.description ?? "",
    date: data.date ?? new Date().toISOString().split("T")[0],
    author: data.author ?? "RevReclaim Team",
    tags: data.tags ?? [],
    image: data.image,
    canonical: data.canonical,
    readingTime: stats.text,
  };
}

/**
 * Get full post with rendered HTML content.
 */
export async function getPost(slug: string): Promise<BlogPost | null> {
  const filePath = path.join(BLOG_DIR, `${slug}.md`);
  if (!fs.existsSync(filePath)) return null;

  const raw = fs.readFileSync(filePath, "utf-8");
  const { data, content } = matter(raw);
  const stats = readingTime(content);

  const processed = await remark().use(html).process(content);
  const contentHtml = processed.toString();

  return {
    slug,
    title: data.title ?? slug,
    description: data.description ?? "",
    date: data.date ?? new Date().toISOString().split("T")[0],
    author: data.author ?? "RevReclaim Team",
    tags: data.tags ?? [],
    image: data.image,
    canonical: data.canonical,
    readingTime: stats.text,
    contentHtml,
  };
}
