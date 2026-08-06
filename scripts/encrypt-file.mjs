import { createCipheriv, randomBytes } from "node:crypto";
import { appendFile, writeFile } from "node:fs/promises";
import { createReadStream, createWriteStream } from "node:fs";
import { pipeline } from "node:stream/promises";

const [input, output] = process.argv.slice(2);
if (!input || !output) throw new Error("Usage: node encrypt-file.mjs <input> <output>");

const source = process.env.BACKUP_ENCRYPTION_KEY ?? "";
const key = /^[a-f0-9]{64}$/i.test(source) ? Buffer.from(source, "hex") : Buffer.from(source, "base64");
if (key.length !== 32) throw new Error("BACKUP_ENCRYPTION_KEY must be a 32-byte base64 value or 64-character hex value.");

const iv = randomBytes(12);
const cipher = createCipheriv("aes-256-gcm", key, iv);
// ECRM1 + 12-byte IV + ciphertext + 16-byte authentication tag.
await writeFile(output, Buffer.concat([Buffer.from("ECRM1"), iv]));
await pipeline(createReadStream(input), cipher, createWriteStream(output, { flags: "a" }));
await appendFile(output, cipher.getAuthTag());
