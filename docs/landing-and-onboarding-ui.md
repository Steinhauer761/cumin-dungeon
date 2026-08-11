# Landing + Onboarding UI implementation

## Routes
- `/` Landing
- `/enter` 18+ gate
- `/join` Member account creation
- `/profile` Member profile setup
- `/preferences` Privacy, notifications and room interests
- `/consent` Private-chat/media consent tutorial
- `/grand-hall` Grand Hall
- `/creator/apply` Creator application
- `/creator/profile` Creator profile setup

## Shared visual system
- Dark castle interior palette.
- Antique gold borders and typography.
- Deep red accents.
- Dragon crest as recurring brand mark.
- Large wood/velvet architectural surfaces.
- Chandelier and oversized rug used primarily in Grand Hall, not every screen.
- Avoid generic dashboard/card-grid aesthetics where a castle panel or doorway is more appropriate.

## Landing content hierarchy
1. Hero entrance and wordmark.
2. Enter the Dungeon / Become a Creator actions.
3. What the venue is.
4. Grand Hall preview.
5. Live rooms and social rooms.
6. Games, gifts and events.
7. Trust/safety explanation.
8. Footer legal/support navigation.

## Onboarding behavior
- Keep each step focused on one decision.
- Show progress and allow safe resume.
- Do not collect legal identity in the public profile.
- Require acceptance of the current versions of Terms, Privacy and Venue Rules before account activation.
- Show the consent tutorial before first private messaging.
- Finish by entering the Grand Hall.

## Profile editor
Use a preview alongside the form so members can see exactly what other users will see. Clearly label public, member-only and private fields.

## Creator editor
Use the same profile foundation with creator-only sections for stage name, categories, rooms, games, gifts/goals, availability and private-request rules.

## Acceptance criteria
- A new member can understand the venue before signing up.
- A verified member can complete onboarding without seeing private-room content prematurely.
- A member can create an individual profile separate from legal/verification identity.
- A creator has a separate onboarding path and profile model.
- All screens work on mobile first and desktop.
