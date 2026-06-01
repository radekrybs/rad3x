// Global site configuration. Edit these values to personalize the site.
export const site = {
  title: "Radek Rybicki",
  tagline: "Thoughts, ventures, analysis, and knowledge worth sharing.",
  description:
    "The personal website of Radek Rybicki — writing about ideas, building ventures, sharing analysis, and publishing knowledge.",
  author: "Radek Rybicki",
  email: "radek.rybicki@gmail.com",

  // The public URL where the site is hosted. Used for absolute links and the
  // RSS feed. Update this once you know your final domain / GitHub Pages URL.
  url: "https://radekrybs.github.io/rad3x",

  // Optional: base path the site is served from. For a GitHub Pages project
  // site this is usually "/<repo-name>". For a custom domain or user page use "".
  basePath: "",

  // Social / contact links shown in the footer. Remove any you don't want.
  links: [
    { label: "Email", href: "mailto:radek.rybicki@gmail.com" },
    { label: "GitHub", href: "https://github.com/radekrybs" },
    { label: "RSS", href: "/feed.xml" },
  ],

  // The four content sections. The `dir` matches a folder under /content.
  sections: [
    {
      dir: "thoughts",
      title: "Thoughts",
      blurb: "Short and long-form reflections on whatever I'm thinking about.",
    },
    {
      dir: "ventures",
      title: "Ventures",
      blurb: "Notes from the things I'm building and the lessons along the way.",
    },
    {
      dir: "analysis",
      title: "Analysis",
      blurb: "Deeper dives, breakdowns, and data-driven write-ups.",
    },
    {
      dir: "knowledge",
      title: "Knowledge",
      blurb: "Guides, references, and things worth knowing — written to last.",
    },
  ],
};
