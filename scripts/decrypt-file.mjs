import { createDecipheriv } from "node:crypto";
import { open, stat } from "node:fs/promises";
import { createReadStream, createWriteStream } from "node:fs";
import { pipeline } from "node:stream/promises";

const [input, output] = process.argv.slice(2);
if (!input || !output) throw new Error("Usage: node decrypt-file.mjs <input> <output>");
const source = process.env.BACKUP_ENCRYPTION_KEY ?? "";
const key = /^[a-f0-9]{64}$/i.test(source) ? Buffer.from(source, "hex") : Buffer.from(source, "base64");
if (key.length !== 32) throw new Error("BACKUP_ENCRYPTION_KEY must be a 32-byte base64 value or 64-character hex value.");

const file = await open(input, "r");
try {
  const info = await stat(input);
  if (info.size < 33) throw new Error("Encrypted backup is too small.");
  const header = Buffer.alloc(17);
  await file.read(header, 0, 17, 0);
  if (header.subarray(0, 5).toString() !== "ECRM1") throw new Error("Unsupported encrypted backup format.");
  const tag = Buffer.alloc(16);
  await file.read(tag, 0, 16, info.size - 16);
  const decipher = createDecipheriv("aes-256-gcm", key, header.subarray(5));
  decipher.setAuthTag(tag);
  await pipeline(createReadStream(input, { start: 17, end: info.size - 17 }), decipher, createWriteStream(output));
} finally { await file.close(); }
