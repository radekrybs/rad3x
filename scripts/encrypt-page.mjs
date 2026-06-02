// Encrypt an HTML file into a password-protected, self-contained page.
//
// The output page contains only AES-256-GCM ciphertext (key derived from the
// password via PBKDF2-SHA256). The plaintext never appears in the output, so it
// is safe to commit to a public repo / serve from static hosting. Decryption
// happens entirely in the browser via the Web Crypto API.
//
// Usage:
//   PAGE_PASSWORD="your-password" \
//   node scripts/encrypt-page.mjs <input.html> <output.html> "Page Title"
//
// If PAGE_PASSWORD is not set, a strong random password is generated and printed.
import { promises as fs } from "node:fs";
import crypto from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ITERATIONS = 200000;

function generatePassword(len = 16) {
  // Unambiguous alphabet (no 0/O/1/l/I) for easy sharing.
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";
  const bytes = crypto.randomBytes(len);
  let out = "";
  for (let i = 0; i < len; i++) out += alphabet[bytes[i] % alphabet.length];
  return out;
}

async function main() {
  const [inputPath, outPath, titleArg] = process.argv.slice(2);
  if (!inputPath || !outPath) {
    console.error('Usage: node scripts/encrypt-page.mjs <input.html> <output.html> "Title"');
    process.exit(1);
  }
  const title = titleArg || "Protected analysis";
  const password = process.env.PAGE_PASSWORD || generatePassword();

  const plaintext = await fs.readFile(inputPath, "utf8");
  const template = await fs.readFile(
    path.join(__dirname, "protected-template.html"),
    "utf8"
  );

  const salt = crypto.randomBytes(16);
  const iv = crypto.randomBytes(12);
  const key = crypto.pbkdf2Sync(password, salt, ITERATIONS, 32, "sha256");

  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  const ct = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  // Web Crypto's AES-GCM expects the 16-byte auth tag appended to the ciphertext.
  const payload = Buffer.concat([ct, tag]).toString("base64");

  // Function replacements so "$" in base64 (there are none, but be safe) and
  // titles are never interpreted as replacement patterns.
  const page = template
    .replaceAll("__TITLE__", () => title)
    .replace("__SALT__", () => salt.toString("base64"))
    .replace("__IV__", () => iv.toString("base64"))
    .replace("__ITER__", () => String(ITERATIONS))
    .replace("__CT__", () => payload);

  await fs.mkdir(path.dirname(outPath), { recursive: true });
  await fs.writeFile(outPath, page, "utf8");

  console.log("Wrote protected page:", outPath);
  console.log("Title:           ", title);
  console.log("Plaintext bytes: ", Buffer.byteLength(plaintext));
  console.log("PASSWORD:        ", password);
}

main().catch((e) => {
  console.error("Encryption failed:", e);
  process.exit(1);
});
