# Ably Setup for CumIN Dungeon

## 1. Create an Ably account

Go to https://ably.com and sign up (free tier: 6M messages/month).

## 2. Create an app

In the Ably dashboard, create a new app called `cumin-dungeon`.

## 3. Get your API key

Copy the API key from the app settings. It looks like: `aBcDeF.GhIjKl:xYz123456`

## 4. Add to Vercel environment variables

In your Vercel project:
- Go to **Settings → Environment Variables**
- Add: `ABLY_API_KEY` = your full API key
- Apply to **Production**, **Preview**, and **Development**
- Hit **Save**

## 5. Redeploy

Push any commit or trigger a redeploy from the Vercel dashboard so the new env var takes effect.

## 6. Test

Hit `POST /api/chat/token` with:
```json
{ "roomId": "velvet-room", "clientId": "testuser" }
```

You should get back a signed token request object.

## 7. Frontend usage

Add to your HTML:
```html
<script src="https://cdn.ably.com/lib/ably.min-1.js"></script>
<script src="/public/js/chat.js"></script>
<script>
  DungeonChat.init('velvet-room', 'MyUsername', 
    document.querySelector('#chat-list'),
    document.querySelector('.viewers')
  );
</script>
```

That's it. Real-time chat is live.
