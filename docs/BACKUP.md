# Electra Smart CRM database backup and recovery

## Architecture

Backups run in GitHub Actions, not in the Vercel frontend. The runner uses `pg_dump` to create a complete Neon PostgreSQL custom-format dump, encrypts it with AES-256-GCM, and uploads it to private Google Drive. The CRM stores only safe job metadata and proxies authenticated downloads. No dump or secret is committed to GitHub or exposed to the browser.

Schedule: `30 20 * * *` UTC. This equals **02:00 AM Asia/Kolkata on the following calendar day**. GitHub cron is UTC; the workflow creates timestamps and idempotency keys in Asia/Kolkata.

## Google Drive setup

1. Enable Google Drive API in a dedicated Google Cloud project.
2. Create OAuth credentials and a refresh token with Drive file access.
3. Create a private root folder named `Electra Smart CRM Backups`, then copy its ID.
4. Share the root folder with the OAuth account. On the first successful run the workflow creates `Automatic`, `Manual`, `Pre-Restore Snapshots`, and `Latest` folders.
5. Do not make the Drive folder public. CRM never returns public Drive links.

## GitHub secrets

| Secret | Purpose |
| --- | --- |
| `DIRECT_DATABASE_URL` | Direct Neon connection string used by pg_dump |
| `BACKUP_ENCRYPTION_KEY` | 32-byte base64 key or 64-character hex key |
| `GOOGLE_DRIVE_CLIENT_ID` | OAuth client ID |
| `GOOGLE_DRIVE_CLIENT_SECRET` | OAuth client secret |
| `GOOGLE_DRIVE_REFRESH_TOKEN` | OAuth refresh token |
| `GOOGLE_DRIVE_ROOT_FOLDER_ID` | Private Drive root folder ID |
| `CRM_API_URL` | Deployed Express API URL, no trailing slash |
| `BACKUP_WORKFLOW_SECRET` | Shared secret protecting workflow callbacks |

## Backend environment variables

Set these only on the deployed Express API (not the frontend):

```text
GOOGLE_DRIVE_CLIENT_ID=
GOOGLE_DRIVE_CLIENT_SECRET=
GOOGLE_DRIVE_REFRESH_TOKEN=
GOOGLE_DRIVE_ROOT_FOLDER_ID=
BACKUP_WORKFLOW_SECRET=
BACKUP_GITHUB_TOKEN=
BACKUP_GITHUB_REPOSITORY=owner/repository
GITHUB_BACKUP_WORKFLOW=backup.yml
GITHUB_BACKUP_REF=main
SENTRY_DSN=
```

`BACKUP_GITHUB_TOKEN` is a fine-grained token allowed only to dispatch Actions workflows for this repository. It is used only by the Owner-triggered manual backup endpoint. Vercel hosts this project’s frontend; it does not need backup secrets. Continue using the existing `VITE_API_URL` to point at the API.

## Behavior

- Owner-only Settings → Backup shows real database job state.
- Manual backup securely dispatches the GitHub workflow, preventing a second running/queued job.
- Successful Drive upload is required before a job becomes Success.
- A dated encrypted backup is retained in its type folder. A verified copy updates Latest only after its dated upload succeeds.
- Automatic backups are retained at 30; Manual and Pre-Restore Snapshot files are never automatically deleted.
- Automatic runs use an IST date idempotency key and GitHub workflow concurrency lock.
- Backup failures are sanitized before logs and are captured by Sentry when `SENTRY_DSN` is configured.

## Restore policy

Production restore is intentionally disabled. It must first be tested by restoring a current encrypted backup into a temporary Neon branch/database, then checking schema, row counts, admin login and critical CRM APIs in staging. Only after this verification can a separately approved production restore workflow be enabled. That workflow must take a successful pre-restore snapshot, verify checksum/authentication, require Owner re-authentication and a confirmation phrase, and lock concurrent restores.

Cloudinary binary assets are not part of a database dump. Their metadata/references remain in PostgreSQL; a deleted Cloudinary asset cannot be recreated from the dump.

## Initial verification

1. Run GitHub Actions workflow manually with `Automatic`.
2. Verify Google Drive `Automatic` and `Latest` files, then CRM history status.
3. From Settings → Backup test Drive connection and trigger Manual backup.
4. Confirm Owner can download and Sales Executive receives 403.
5. Test retention only in a non-production Drive folder.
6. Test restore only in a temporary Neon branch before any production restore enablement.
