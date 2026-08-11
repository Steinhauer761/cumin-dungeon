# Private chat retention contract

- Direct-chat requests require recipient acceptance before private delivery.
- Messages and attachments receive a 14-day expiry timestamp at creation.
- Attachments live in private object storage and are never committed to Git.
- `download_allowed` is chosen by the sender for each attachment.
- A download action is authorized server-side and is available only when `download_allowed = true`.
- Normal cleanup removes expired message rows and their storage objects.
- Active safety/legal holds suspend normal cleanup for the held records.
- A cleanup job must be idempotent so a failed storage deletion can be retried safely.
- The UI must explain that a recipient can retain a copy after downloading, even though the platform deletes its hosted copy after the retention period.
