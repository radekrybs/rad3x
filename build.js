// Static site generator for rad3x.
//
// Reads Markdown files from /content/<section>/, renders them to HTML, and
// writes a complete static site to /dist. Run with `npm run build`.
import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import matter from "gray-matter";
import { marked } from "marked";

import { site } from "./site.config.js";
import {
  layout,
  homePage,
  sectionPage,
  postPage,
  rssFeed,
  notFoundPage,
  escapeHtml,
} from "./src/templates.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = __dirname;
const CONTENT_DIR = path.join(ROOT, "content");
const PUBLIC_DIR = path.join(ROOT, "public");
const OUT_DIR = path.join(ROOT, "dist");

marked.setOptions({ gfm: true, breaks: false });

// Turn a filename like "2024-05-01-my-post.md" into a clean slug "my-post".
function slugFromFilename(filename) {
  return filename
    .replace(/\.md$/i, "")
    .replace(/^\d{4}-\d{2}-\d{2}-/, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function ensureDir(dir) {
  await fs.mkdir(dir, { recursive: true });
}

async function writeFile(relPath, contents) {
  const full = path.join(OUT_DIR, relPath);
  await ensureDir(path.dirname(full));
  await fs.writeFile(full, contents, "utf8");
}

async function readSectionPosts(section) {
  const dir = path.join(CONTENT_DIR, section.dir);
  let files;
  try {
    files = await fs.readdir(dir);
  } catch {
    return []; // Section folder doesn't exist yet — that's fine.
  }

  const posts = [];
  for (const file of files) {
    if (!file.endsWith(".md")) continue;
    const raw = await fs.readFile(path.join(dir, file), "utf8");
    const { data, content } = matter(raw);

    if (data.draft === true) continue; // Skip drafts.

    const slug = data.slug || slugFromFilename(file);
    const html = marked.parse(content);
    const date = data.date ? new Date(data.date) : new Date();

    posts.push({
      title: data.title || slug,
      date,
      summary: data.summary || data.description || "",
      tags: Array.isArray(data.tags) ? data.tags : [],
      protected: data.protected === true,
      slug,
      section: section.dir,
      sectionTitle: section.title,
      href: `/${section.dir}/${slug}/`,
      html,
    });
  }

  posts.sort((a, b) => b.date - a.date);
  return posts;
}

async function copyDir(src, dest) {
  let entries;
  try {
    entries = await fs.readdir(src, { withFileTypes: true });
  } catch {
    return; // Nothing to copy.
  }
  await ensureDir(dest);
  for (const entry of entries) {
    const s = path.join(src, entry.name);
    const d = path.join(dest, entry.name);
    if (entry.isDirectory()) await copyDir(s, d);
    else await fs.copyFile(s, d);
  }
}

async function build() {
  const start = Date.now();

  // Clean output directory.
  await fs.rm(OUT_DIR, { recursive: true, force: true });
  await ensureDir(OUT_DIR);

  // Gather all posts grouped by section.
  const allPosts = [];
  const sectionData = [];
  for (const section of site.sections) {
    const posts = await readSectionPosts(section);
    sectionData.push({ section, posts });
    allPosts.push(...posts);
  }
  allPosts.sort((a, b) => b.date - a.date);

  // Homepage.
  await writeFile("index.html", homePage(allPosts.slice(0, 8)));

  // Section index pages + individual post pages.
  let postCount = 0;
  for (const { section, posts } of sectionData) {
    await writeFile(`${section.dir}/index.html`, sectionPage(section, posts));
    for (const post of posts) {
      await writeFile(`${section.dir}/${post.slug}/index.html`, postPage(post));
      postCount++;
    }
  }

  // RSS feed + 404 page.
  await writeFile("feed.xml", rssFeed(allPosts.slice(0, 20)));
  await writeFile("404.html", notFoundPage());

  // Styles, scripts, and any static assets from /public.
  await copyDir(PUBLIC_DIR, OUT_DIR);

  // Tell GitHub Pages not to run Jekyll on our output.
  await writeFile(".nojekyll", "");

  const ms = Date.now() - start;
  console.log(
    `Built ${postCount} post(s) across ${site.sections.length} section(s) → dist/ in ${ms}ms`
  );
}

build().catch((err) => {
  console.error("Build failed:", err);
  process.exit(1);
});
