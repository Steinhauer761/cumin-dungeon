# Landing + Onboarding Build Contract

## Goal
Turn the current prototype gate into the first production-oriented journey:

Landing -> 18+ gate -> account -> profile -> preferences -> consent tutorial -> Grand Hall.

## Landing
- Grand castle entrance visual language.
- Refined red-script wordmark, dragon crest, dark wood, velvet and antique gold.
- Clear 18+ positioning without exposing private-room content before verification.
- Primary CTA: Enter the Dungeon.
- Secondary CTA: Become a Creator.
- Venue overview: Grand Hall, live rooms, Halo Lounge, Halo Theater, VIP/After Hours, games and events.
- Trust/safety, Terms, Privacy, Rules and Support links.
- Accessible keyboard/focus behavior and reduced-motion option.

## 18+ gate
- Confirm eligibility before account access.
- Show jurisdiction availability before collecting unnecessary profile details.
- Link Terms, Privacy and Venue Rules.
- Record acceptance/version after authentication rather than relying on a visual checkbox alone.

## Member account
- Authentication and account recovery.
- Unique internal user ID separate from public handle.
- Public display name/handle.
- Profile avatar/artwork.
- Bio and optional interests.
- Discoverability setting.
- Private-chat preference.
- Media/download preference.
- Notification preferences.
- Blocked accounts.
- Favorites/following.

## Profile separation
Never expose legal identity, verification documents, payment data, safety cases or moderation records as profile fields.

### Member profile
Public or member-visible fields are controlled independently from account/security fields.

### Creator profile
- Stage name.
- Avatar/banner.
- Bio/categories.
- Availability.
- Rooms/events.
- Games.
- Gifts/goals/polls.
- Private-request rules.
- Membership options.
- Public earnings-independent engagement stats.

## Consent tutorial
Explain before entry:
- Room chat is visible to room participants.
- Private chat requires recipient acceptance.
- Media requests require acceptance.
- Sender chooses whether an attachment may be downloaded.
- Users can block/report at any time.
- Ordinary chat/media follows the 14-day retention policy.
- Legitimate safety/legal holds can override ordinary deletion.

## Onboarding completion
After profile/preferences/consent are complete, route the member to the Grand Hall.
Persist an onboarding checklist so users can resume without repeating completed steps.

## Creator path
Keep creator onboarding separate from ordinary member onboarding:
application -> age/identity verification -> creator agreement -> profile -> categories -> starter games -> gifts/goals -> private-request settings -> safety orientation -> approval -> publish.

## First implementation slices
1. Route/screen model for landing, gate, signup, profile setup, preferences and Grand Hall.
2. Profile schema with strict separation of public/member-visible/account/security data.
3. Versioned agreement acceptance records.
4. Onboarding progress state.
5. Responsive UI shells matching the castle design system.
6. Wire the completed flow to the existing category API and Grand Hall.

## Launch blockers
Production age assurance, authentication, payments, streaming, moderation/safety screening, privacy/legal review and required operational controls must be completed before public launch.
