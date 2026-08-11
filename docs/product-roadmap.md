# Cum IN Dungeon Product Roadmap

## Experience layers

### 1. Landing & onboarding
- Grand castle landing page.
- 18+ gate and jurisdiction check.
- Member onboarding.
- Creator onboarding and verification.
- Consent / privacy / private-chat tutorial.
- Clear member vs creator entry paths.
- Preview the Grand Hall without exposing private rooms.
- Trust, safety, privacy, terms and support links before account creation.
- Accessibility, keyboard navigation and reduced-motion support.
- Account recovery and notification preferences.

### 2. Grand Hall
- Castle entrance with split wooden doors.
- Dragon crest spanning the doors.
- Oversized dragon rug.
- Chandelier / mansion atmosphere.
- Category doors using supplied artwork.
- Trending rooms and active events.
- Event calendar / upcoming premieres.
- Featured creators and rooms.
- Recently visited / favorites.
- Search and filters without exposing sensitive member data.

### 3. Live rooms
- Performer profile and room status.
- Public room chat.
- Consent-based private chat requests.
- Private media permission per attachment.
- Block / report.
- Pinned goals and room state.
- Room rules and creator-controlled permissions.
- Join/leave state and presence indicators.
- Favorites/following and optional room notifications.
- Connection/reconnect handling and graceful degraded mode.

### 4. Revenue-first room mechanics
- Heat Meter shared room goal.
- House Gifts with branded gift catalog.
- Velvet Verdict polls.
- Treasure Ladder sequential goals.
- Secret Door Requests with explicit performer approval.
- Gift streaks.
- Grand Hall trending / near-unlock indicators.
- Creator-configurable goal thresholds and schedules.
- Transparent pricing before a paid action.
- Receipts and transaction history for members and creators.

### 5. Halo Lounge
- Social room for members.
- Member-to-member private chat requests.
- Optional approved media exchange.
- Temporary chat/media retention.
- Moderation and safety controls.
- Consent status visible in the conversation UI.
- Mute, block, report and end-conversation controls.
- No unsolicited media delivery before approval.
- Presence / availability indicators that do not reveal private location information.

### 6. Halo Theater
- Separate recorded-content experience.
- Creator catalog and collections.
- Scheduled screenings / premieres.
- Only properly licensed and approved creator content.
- Creator content pages with rights/status metadata.
- Playback access controls and expiring signed media URLs.
- Content reporting and takedown workflow.

### 7. Creator platform
- Creator profiles.
- Room setup and scheduling.
- Game catalog and game assignments.
- Starter free-game allowance.
- Premium creator games.
- Creator-configurable room goals, gifts and polls.
- Earnings / engagement dashboard.
- Payout onboarding.
- Creator availability calendar.
- Creator notification center.
- Profile preview before publishing.
- Draft/published states for rooms and content.
- Creator support / dispute workflow.

### 8. Games

Build games as reusable modules, not page-specific code.

Each game should support:
- Catalog metadata.
- Free / premium classification.
- Creator assignment.
- Room assignment.
- Thumbnail / artwork.
- Configuration options.
- Engagement analytics.
- Permission checks.
- Enable/disable state.
- Versioning so games can be updated without breaking existing rooms.
- Responsible-play messaging where applicable.

Do not add real-money wagering or cash-prize mechanics to ordinary games without a separate legal / payments review.

### 9. Memberships & monetization
- Membership tiers.
- After Hours access.
- Creator gifts.
- Room goals.
- Premium games.
- Creator payouts.
- Transaction history.
- Refund / dispute handling.
- Promotional codes / launch offers.
- Gift and purchase receipts.
- Creator revenue-share configuration.
- Clear fee disclosure before purchases.

### 10. Safety & trust
- Age / identity verification.
- Safety screening.
- User reports.
- Automated flags.
- Quarantine / review states.
- Block / restrict / suspend / ban actions.
- Safety and legal holds.
- Audit trail.
- Appropriate escalation / reporting workflows.
- Rate limits and anti-spam controls.
- Account/device risk signals.
- Appeals workflow for moderation actions.
- Evidence preservation only when required by a legitimate safety/legal hold.
- Privacy-preserving moderation architecture.

### 11. Operations
- Admin / moderation console.
- Creator approval queue.
- Room / event management.
- Payment reconciliation.
- Safety cases.
- Analytics.
- Support tooling.
- Feature flags for staged launches.
- Audit logs for administrative actions.
- Incident response runbook.
- Provider outage/fallback procedures.

### 12. Notifications & discovery
- In-app notification center.
- Optional email notifications.
- Room/event reminders.
- Creator availability notifications.
- Gift/goal completion notifications.
- Notification preferences by category.
- Follow/favorite system.
- Search, filtering and sorting.
- Privacy-safe discovery controls.

### 13. Account & privacy controls
- Profile visibility controls.
- Private/public presence settings.
- Data export request flow.
- Account deletion flow.
- Session/device management.
- Login security and recovery.
- Consent history.
- Privacy settings for chat, media and notifications.

## Immediate build order

1. Finish and review castle Grand Hall UI.
2. Replace temporary category crests with supplied category artwork.
3. Build landing page and onboarding screens as separate product surfaces.
4. Wire category doors to the backend category API.
5. Build member account / verification state.
6. Build Halo Lounge room shell and consent-based chat model.
7. Build creator onboarding.
8. Build game catalog / assignment model.
9. Build Halo Room revenue mechanics.
10. Add notifications, favorites and event scheduling.
11. Add account/privacy controls and production-grade moderation tooling.
12. Add production providers for authentication, age verification, storage, streaming, payments and moderation.
13. Run a closed beta with staged feature flags before public launch.
