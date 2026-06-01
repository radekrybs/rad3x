# rad3x — Radek Rybicki's personal website

A fast, minimal, handwritten personal website for posting thoughts, writing
about ventures, sharing analysis, and publishing knowledge.

It's a small static-site generator (about 150 lines of Node) with **no
front-end framework** — you write Markdown, it produces clean HTML. Light/dark
theme, RSS feed, and responsive design are all included.

## Sections

| Section | For |
| --- | --- |
| **Thoughts** | Reflections, short and long-form |
| **Ventures** | Notes from the things you're building |
| **Analysis** | Deeper, data-driven write-ups |
| **Knowledge** | Guides and references worth keeping |

You can rename, add, or remove sections in [`site.config.js`](./site.config.js).

## Quick start

```bash
npm install     # install marked + gray-matter
npm run dev     # build the site and preview at http://localhost:3000
```

To just build the static site into `dist/`:

```bash
npm run build
```

## Writing a post

Add a Markdown file to the relevant folder under `content/`:

```
content/
  thoughts/
  ventures/
  analysis/
  knowledge/
```

Start each file with front matter:

```markdown
---
title: "My new post"
date: 2026-06-01
summary: "A one-line description for lists and the RSS feed."
tags: ["optional", "tags"]
draft: false
---

Write your post in **Markdown** here.
```

- `draft: true` keeps a post out of the build while you work on it.
- Files are sorted by `date`, newest first.
- A date prefix in the filename (`2026-06-01-title.md`) is optional but keeps
  the folder tidy; it's stripped from the URL slug automatically.

There's a full how-to published on the site itself under **Knowledge → How to
add a new post**.

## Project layout

```
site.config.js        # site title, links, sections — your main settings
build.js              # the static site generator
serve.js              # tiny local preview server
src/templates.js      # HTML templates (plain template literals)
public/               # styles.css, theme.js, and any static assets
content/<section>/    # your Markdown posts
dist/                 # build output (generated, git-ignored)
.github/workflows/    # auto-deploy to GitHub Pages
```

## Configuration

Open [`site.config.js`](./site.config.js) to set:

- `title`, `tagline`, `description`, `author`, `email`
- `url` — the public URL (used for the RSS feed and canonical links)
- `basePath` — set to `/rad3x` if hosting at `username.github.io/rad3x`, or
  leave empty (`""`) for a custom domain or user page
- `links` — the footer links
- `sections` — the content sections

## Deployment

A GitHub Actions workflow (`.github/workflows/deploy.yml`) builds the site and
publishes it to GitHub Pages on every push to `main`.

To enable it once:

1. Push this repository to GitHub.
2. Go to **Settings → Pages** and set **Source** to **GitHub Actions**.
3. Push to `main` — the site builds and deploys automatically.

If you host at `username.github.io/rad3x`, set `basePath: "/rad3x"` in
`site.config.js`. For a custom domain or a `username.github.io` user page,
leave `basePath` empty and add a `CNAME` file under `public/` if needed.

## License

MIT — see [`site.config.js`](./site.config.js) for author details. Content is
yours; the code is free to reuse.
