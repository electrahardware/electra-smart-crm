import { open, stat } from "node:fs/promises";

const args = Object.fromEntries(process.argv.slice(2).reduce((pairs, value, index, values) => {
  if (value.startsWith("--")) pairs.push([value.slice(2), values[index + 1]]);
  return pairs;
}, []));
const filePath = args.file;
const type = args.type === "Manual" ? "Manual" : args.type === "Pre-Restore Snapshot" ? "Pre-Restore Snapshots" : "Automatic";
const latest = args.latest === "true";
if (!filePath) throw new Error("--file is required");

const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
  method: "POST",
  headers: { "Content-Type": "application/x-www-form-urlencoded" },
  body: new URLSearchParams({ client_id: required("GOOGLE_DRIVE_CLIENT_ID"), client_secret: required("GOOGLE_DRIVE_CLIENT_SECRET"), refresh_token: required("GOOGLE_DRIVE_REFRESH_TOKEN"), grant_type: "refresh_token" }),
});
if (!tokenResponse.ok) throw new Error("Google Drive OAuth token refresh failed.");
const { access_token: accessToken } = await tokenResponse.json();

const rootId = required("GOOGLE_DRIVE_ROOT_FOLDER_ID");
const typeFolderId = await ensureFolder(type, rootId);
const latestFolderId = await ensureFolder("Latest", rootId);
const fileInfo = await stat(filePath);
const fileName = filePath.split(/[\\/]/).pop();
const uploaded = await retry(() => resumableUpload(filePath, fileInfo.size, fileName, typeFolderId));

if (latest) {
  const oldLatest = await listFiles(latestFolderId, "electra-crm-latest");
  const latestUpload = await retry(() => resumableUpload(filePath, fileInfo.size, "electra-crm-latest.dump.enc", latestFolderId));
  for (const old of oldLatest) await deleteFile(old.id);
  uploaded.latestFileId = latestUpload.id;
}
if (type === "Automatic") {
  const retention = Math.max(1, Number(process.env.BACKUP_RETENTION_COUNT || "30"));
  const dated = (await listFiles(typeFolderId, "electra-crm-backup-")).sort((a, b) => String(a.createdTime).localeCompare(String(b.createdTime)));
  for (const stale of dated.slice(0, Math.max(0, dated.length - retention))) await deleteFile(stale.id);
}
console.log(JSON.stringify({ fileId: uploaded.id, latestFileId: uploaded.latestFileId ?? null, folder: type, fileName, fileSize: fileInfo.size }));

function required(key) { const value = process.env[key]; if (!value) throw new Error(`${key} is not configured.`); return value; }
async function drive(url, options = {}) { const response = await fetch(url, { ...options, headers: { Authorization: `Bearer ${accessToken}`, ...(options.headers ?? {}) } }); if (!response.ok) throw new Error(`Google Drive request failed (${response.status}).`); return response; }
async function ensureFolder(name, parentId) { const found = await listFiles(parentId, name, "application/vnd.google-apps.folder"); const exact = found.find((file) => file.name === name); if (exact) return exact.id; const response = await drive("https://www.googleapis.com/drive/v3/files", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name, mimeType: "application/vnd.google-apps.folder", parents: [parentId] }) }); return (await response.json()).id; }
async function listFiles(parentId, prefix = "", mimeType = "") { const terms = [`'${parentId}' in parents`, "trashed = false"]; if (mimeType) terms.push(`mimeType = '${mimeType}'`); const params = new URLSearchParams({ q: terms.join(" and "), fields: "files(id,name,size,createdTime)", orderBy: "createdTime asc", pageSize: "1000" }); const response = await drive(`https://www.googleapis.com/drive/v3/files?${params}`); const data = await response.json(); return (data.files ?? []).filter((file) => !prefix || file.name?.startsWith(prefix)); }
async function resumableUpload(path, size, name, parentId) { const start = await drive("https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable", { method: "POST", headers: { "Content-Type": "application/json", "X-Upload-Content-Type": "application/octet-stream", "X-Upload-Content-Length": String(size) }, body: JSON.stringify({ name, parents: [parentId], mimeType: "application/octet-stream" }) }); const location = start.headers.get("location"); if (!location) throw new Error("Google Drive upload session was not created."); const handle = await open(path, "r"); try { const chunkSize = 8 * 1024 * 1024; let offset = 0; while (offset < size) { const length = Math.min(chunkSize, size - offset); const buffer = Buffer.alloc(length); await handle.read(buffer, 0, length, offset); const response = await fetch(location, { method: "PUT", headers: { Authorization: `Bearer ${accessToken}`, "Content-Length": String(length), "Content-Range": `bytes ${offset}-${offset + length - 1}/${size}` }, body: buffer }); if (response.status === 308) { offset += length; continue; } if (!response.ok) throw new Error(`Google Drive upload chunk failed (${response.status}).`); return response.json(); } } finally { await handle.close(); } throw new Error("Google Drive upload did not complete."); }
async function deleteFile(id) { await drive(`https://www.googleapis.com/drive/v3/files/${encodeURIComponent(id)}`, { method: "DELETE" }); }
async function retry(operation, attempts = 3) { let lastError; for (let index = 0; index < attempts; index += 1) { try { return await operation(); } catch (error) { lastError = error; if (index < attempts - 1) await new Promise((resolve) => setTimeout(resolve, 2 ** index * 1000)); } } throw lastError; }
