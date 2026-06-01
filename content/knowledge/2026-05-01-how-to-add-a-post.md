---
title: "How to add a new post"
date: 2026-05-01
summary: "The 60-second guide to publishing on this site."
tags: ["reference", "how-to"]
---

This site is built from plain Markdown files. Publishing a new post takes about
a minute.

## 1. Create a Markdown file

Add a `.md` file to the folder for the section you want:

```
content/
  thoughts/
  ventures/
  analysis/
  knowledge/
```

Name it however you like. A date prefix keeps things tidy and sortable, e.g.
`2026-06-01-my-new-idea.md`.

## 2. Add the front matter

Every post starts with a small block of metadata between `---` lines:

```markdown
---
title: "My new idea"
date: 2026-06-01
summary: "A one-line description shown in lists and previews."
tags: ["optional", "tags"]
draft: false
---

Your content starts here. Write in **Markdown**.
```

Notes:

- `title` and `date` are the important ones.
- `summary` shows up on list pages and in the RSS feed.
- Set `draft: true` to keep a post out of the build while you work on it.

## 3. Build and preview

```bash
npm install      # first time only
npm run dev      # builds the site and serves it at localhost:3000
```

## 4. Publish

Commit and push. The GitHub Actions workflow rebuilds the site and deploys it
automatically.

```bash
git add content/
git commit -m "Add post: My new idea"
git push
```

That's the whole workflow. Write, commit, push.
