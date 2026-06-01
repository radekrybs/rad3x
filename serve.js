// Tiny zero-dependency static file server for previewing the built site.
// Run `npm run build` first, then `npm run serve` and open http://localhost:3000
import { createServer } from "node:http";
import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "dist");
const PORT = process.env.PORT || 3000;

const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".xml": "application/xml; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".txt": "text/plain; charset=utf-8",
};

async function resolve(urlPath) {
  let p = decodeURIComponent(urlPath.split("?")[0]);
  let filePath = path.join(ROOT, p);
  // Prevent path traversal outside the dist directory.
  if (!filePath.startsWith(ROOT)) return null;
  try {
    const stat = await fs.stat(filePath);
    if (stat.isDirectory()) filePath = path.join(filePath, "index.html");
  } catch {
    // Fall through to the 404 handling below.
  }
  return filePath;
}

const server = createServer(async (req, res) => {
  const filePath = await resolve(req.url);
  if (filePath) {
    try {
      const data = await fs.readFile(filePath);
      const type = TYPES[path.extname(filePath)] || "application/octet-stream";
      res.writeHead(200, { "Content-Type": type });
      res.end(data);
      return;
    } catch {
      // Not found — serve the custom 404 page.
    }
  }
  try {
    const data = await fs.readFile(path.join(ROOT, "404.html"));
    res.writeHead(404, { "Content-Type": "text/html; charset=utf-8" });
    res.end(data);
  } catch {
    res.writeHead(404).end("Not found");
  }
});

server.listen(PORT, () => {
  console.log(`Serving dist/ at http://localhost:${PORT}`);
});
