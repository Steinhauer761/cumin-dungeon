# Lovense Integration Setup

## Overview

CumIN Dungeon uses **Lovense Cam Kit v2** to connect performer toys to the tip system.
When a viewer tips, the performer's toy reacts based on their configured levels.

## Architecture

```
Viewer tips → /api/tokens/tip → lovense.receiveTip() → Toy vibrates
                                       ↓ (fallback)
                              /api/lovense/command → Lovense Server API → Toy
```

## Required Env Vars (Vercel)

| Variable | Description |
|----------|-------------|
| `LOVENSE_DEV_TOKEN` | Developer token from https://www.lovense.com/user/developer/info |
| `LOVENSE_CALLBACK_SECRET` | Random string you generate, used to verify callbacks |

## Setup Steps

### 1. Register as Lovense Developer

1. Go to https://www.lovense.com/user/developer/info
2. Fill in:
   - **Website Name**: `CumIN Dungeon`
   - **Website URL**: `https://cumindungeon.com`
   - **Callback URL**: `https://cumindungeon.com/api/lovense/callback?secret=YOUR_SECRET`
3. Copy your **Developer Token** (dToken)
4. Under "Cam Kit Developer settings (v2.0)", configure your platform

### 2. Add Env Vars to Vercel

```bash
vercel env add LOVENSE_DEV_TOKEN
vercel env add LOVENSE_CALLBACK_SECRET
```

### 3. Generate Performer Tokens

When a performer signs up and connects their toy:

```js
const resp = await fetch('/api/lovense/token', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    modelId: performer.id,
    modelName: performer.stageName,
  }),
});
const { data } = await resp.json();
// Store data.mToken in Supabase: performers.lovense_mtoken
```

### 4. Performer Broadcast Page

On the performer's room page when they go live:

```html
<script src="/public/js/lovense.js"></script>
<script>
  DungeonLovense.initPerformer({ mToken: performerMToken });
</script>
```

### 5. Hook Tips to Toys

In your tip handler (after token deduction succeeds):

```js
DungeonLovense.receiveTip(tipperDisplayName, tokenAmount);
```

### 6. Performer Settings Page

Let performers configure their tip levels via Lovense's hosted settings page:

```html
<iframe
  src="https://api.lovense.com/api/cam/model/v2/setting?mToken=PERFORMER_MTOKEN"
  width="100%"
  height="1500px"
  frameborder="0"
></iframe>
```

## File Map

| File | Purpose |
|------|---------|
| `api/lovense/token.ts` | Generate mToken for new performers |
| `api/lovense/command.ts` | Server-side toy control (fallback) |
| `api/lovense/callback.ts` | Receive Lovense Connect callbacks |
| `public/js/lovense.js` | Client-side integration module |

## Testing

1. Get the Lovense Connect app on your phone
2. Use a test toy or the app's virtual toy feature
3. Your dashboard status should show "Pending" until Lovense approves you
4. During testing, models add your site using `test:CumIN Dungeon` in Cam Extension

## Notes

- Performers control their own vibration levels and patterns
- The platform never needs to know specific toy settings
- All communication is encrypted (HTTPS only)
- Never expose `LOVENSE_DEV_TOKEN` client-side
