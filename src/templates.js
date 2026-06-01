// HTML templates rendered by build.js. Plain template literals — no engine,
// no magic. Edit freely to change the look and structure of the site.
import { site } from "../site.config.js";

const year = new Date().getFullYear();

// Prefix internal absolute links with the configured base path so the site
// works both at a domain root and under a /repo-name/ subpath.
export function url(path) {
  if (/^https?:|^mailto:/.test(path)) return path;
  const base = site.basePath.replace(/\/$/, "");
  return base + path;
}

function formatDate(date) {
  if (!date) return "";
  const d = new Date(date);
  if (isNaN(d)) return "";
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function isoDate(date) {
  const d = new Date(date);
  return isNaN(d) ? "" : d.toISOString();
}

export function escapeHtml(str = "") {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function nav(activeDir) {
  const links = site.sections
    .map((s) => {
      const active = s.dir === activeDir ? ' class="active"' : "";
      return `<a${active} href="${url(`/${s.dir}/`)}">${s.title}</a>`;
    })
    .join("");
  return `
    <nav class="site-nav">
      <a class="brand" href="${url("/")}">${escapeHtml(site.title)}</a>
      <div class="nav-links">
        ${links}
        <button id="theme-toggle" type="button" aria-label="Toggle color theme" title="Toggle theme">
          <span class="theme-icon-light">☀</span><span class="theme-icon-dark">☾</span>
        </button>
      </div>
    </nav>`;
}

function footer() {
  const links = site.links
    .map((l) => `<a href="${url(l.href)}">${escapeHtml(l.label)}</a>`)
    .join("<span class=\"dot\">·</span>");
  return `
    <footer class="site-footer">
      <div class="footer-links">${links}</div>
      <div class="footer-meta">© ${year} ${escapeHtml(site.author)}. Built by hand.</div>
    </footer>`;
}

// The single page shell used by every page.
export function layout({ title, description, body, activeDir, canonical }) {
  const pageTitle = title ? `${title} · ${site.title}` : site.title;
  const desc = description || site.description;
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(pageTitle)}</title>
  <meta name="description" content="${escapeHtml(desc)}" />
  <meta name="author" content="${escapeHtml(site.author)}" />
  <meta property="og:title" content="${escapeHtml(pageTitle)}" />
  <meta property="og:description" content="${escapeHtml(desc)}" />
  <meta property="og:type" content="website" />
  ${canonical ? `<link rel="canonical" href="${escapeHtml(canonical)}" />` : ""}
  <link rel="alternate" type="application/rss+xml" title="${escapeHtml(site.title)} RSS" href="${url("/feed.xml")}" />
  <link rel="stylesheet" href="${url("/styles.css")}" />
  <script>
    // Apply saved theme before paint to avoid a flash.
    (function () {
      try {
        var t = localStorage.getItem("theme");
        if (!t) t = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
        document.documentElement.setAttribute("data-theme", t);
      } catch (e) {}
    })();
  </script>
</head>
<body>
  <div class="container">
    ${nav(activeDir)}
    <main>
      ${body}
    </main>
    ${footer()}
  </div>
  <script src="${url("/theme.js")}" defer></script>
</body>
</html>`;
}

// A compact card used in lists and on the homepage.
export function postCard(post, { showSection = false } = {}) {
  const sectionTag = showSection
    ? `<a class="tag" href="${url(`/${post.section}/`)}">${escapeHtml(post.sectionTitle)}</a>`
    : "";
  return `
    <article class="card">
      <div class="card-meta">
        <time datetime="${isoDate(post.date)}">${formatDate(post.date)}</time>
        ${sectionTag}
      </div>
      <h2 class="card-title"><a href="${url(post.href)}">${escapeHtml(post.title)}</a></h2>
      ${post.summary ? `<p class="card-summary">${escapeHtml(post.summary)}</p>` : ""}
      <a class="card-read" href="${url(post.href)}">Read →</a>
    </article>`;
}

export function homePage(recentPosts) {
  const sectionCards = site.sections
    .map(
      (s) => `
      <a class="section-card" href="${url(`/${s.dir}/`)}">
        <h3>${escapeHtml(s.title)}</h3>
        <p>${escapeHtml(s.blurb)}</p>
      </a>`
    )
    .join("");

  const recent =
    recentPosts.length > 0
      ? recentPosts.map((p) => postCard(p, { showSection: true })).join("")
      : `<p class="empty">No posts yet — check back soon.</p>`;

  const body = `
    <header class="hero">
      <h1>${escapeHtml(site.title)}</h1>
      <p class="hero-tagline">${escapeHtml(site.tagline)}</p>
    </header>

    <section class="sections-grid">
      ${sectionCards}
    </section>

    <section class="recent">
      <h2 class="section-heading">Latest</h2>
      <div class="card-list">
        ${recent}
      </div>
    </section>`;

  return layout({
    body,
    activeDir: null,
    canonical: site.url + url("/"),
  });
}

export function sectionPage(section, posts) {
  const list =
    posts.length > 0
      ? posts.map((p) => postCard(p)).join("")
      : `<p class="empty">Nothing here yet.</p>`;
  const body = `
    <header class="page-header">
      <h1>${escapeHtml(section.title)}</h1>
      <p class="page-blurb">${escapeHtml(section.blurb)}</p>
    </header>
    <div class="card-list">
      ${list}
    </div>`;
  return layout({
    title: section.title,
    description: section.blurb,
    body,
    activeDir: section.dir,
    canonical: site.url + url(`/${section.dir}/`),
  });
}

export function postPage(post) {
  const tags =
    post.tags && post.tags.length
      ? `<div class="post-tags">${post.tags
          .map((t) => `<span class="tag">${escapeHtml(t)}</span>`)
          .join("")}</div>`
      : "";
  const body = `
    <article class="post">
      <header class="post-header">
        <div class="card-meta">
          <a class="tag" href="${url(`/${post.section}/`)}">${escapeHtml(post.sectionTitle)}</a>
          <time datetime="${isoDate(post.date)}">${formatDate(post.date)}</time>
        </div>
        <h1>${escapeHtml(post.title)}</h1>
        ${post.summary ? `<p class="post-lede">${escapeHtml(post.summary)}</p>` : ""}
      </header>
      <div class="post-body">
        ${post.html}
      </div>
      ${tags}
      <footer class="post-footer">
        <a href="${url(`/${post.section}/`)}">← Back to ${escapeHtml(post.sectionTitle)}</a>
      </footer>
    </article>`;
  return layout({
    title: post.title,
    description: post.summary,
    body,
    activeDir: post.section,
    canonical: site.url + url(post.href),
  });
}

// A simple, valid RSS 2.0 feed of the most recent posts.
export function rssFeed(posts) {
  const items = posts
    .map(
      (p) => `    <item>
      <title>${escapeHtml(p.title)}</title>
      <link>${site.url + url(p.href)}</link>
      <guid>${site.url + url(p.href)}</guid>
      <pubDate>${new Date(p.date).toUTCString()}</pubDate>
      <category>${escapeHtml(p.sectionTitle)}</category>
      ${p.summary ? `<description>${escapeHtml(p.summary)}</description>` : ""}
    </item>`
    )
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>${escapeHtml(site.title)}</title>
    <link>${site.url}</link>
    <description>${escapeHtml(site.description)}</description>
    <language>en-us</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
${items}
  </channel>
</rss>`;
}

export function notFoundPage() {
  const body = `
    <header class="hero">
      <h1>404</h1>
      <p class="hero-tagline">That page wandered off. <a href="${url("/")}">Head home →</a></p>
    </header>`;
  return layout({ title: "Not found", body, activeDir: null });
}
