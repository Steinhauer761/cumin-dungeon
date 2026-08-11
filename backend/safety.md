# Safety & Trust pipeline

The platform should treat child-safety signals as a dedicated trust-and-safety workflow, not as ordinary chat moderation.

## Message flow

1. A message or attachment is submitted only after the recipient has accepted the direct-chat request.
2. Automated safety systems may evaluate content for prohibited or high-risk signals.
3. Normal content is delivered.
4. A suspicious signal creates a `safety_cases` record and can restrict delivery while it is reviewed.
5. A high-confidence safety event can quarantine the message/attachment and restrict the sender account pending review.
6. Moderators record an explicit action in `moderation_actions` rather than silently changing an account.
7. Safety/legal cases can create `safety_holds` so the normal 14-day cleanup process does not destroy material that must lawfully be preserved.
8. When a hold is released, the normal retention cleanup removes the message and associated storage object.

## Important implementation boundary

Do not build a feature that encourages moderators, developers, or users to search for or manually collect child sexual abuse material. Detection should use appropriately vetted safety providers and established matching/reporting workflows. The application should store references, hashes, case metadata, and provider results where appropriate rather than copying prohibited material into the repository or ordinary moderation tooling.

## User reporting

Every direct conversation and live room should expose a visible Report and Block action. A report should create a safety case with the reporter, target account, conversation/message reference, category, and timestamp.

## Enforcement

Suggested account actions are:

- warn
- restrict messaging/media
- suspend
- permanently ban
- restore after review

The signup flow should make the 18+ requirement and prohibited-content rules explicit and require affirmative acceptance. That agreement is useful evidence of the platform rules, but enforcement decisions should still be based on the actual safety case and applicable law.

## Retention

Ordinary chat messages and attachments are intended to expire after 14 days. Active safety/legal holds override that normal expiry until the hold is released. The cleanup worker must remove both database records and corresponding private object-storage files.

## Reporting and legal escalation

The production implementation must be reviewed by qualified Canadian counsel and the applicable safety/reporting providers before launch. Where Canadian law requires reporting or preservation, follow the applicable process and jurisdiction rather than relying on an automated ban alone.
