# Live Streaming Setup (Mux)

## Overview

Performers stream via OBS (or any RTMP encoder) to Mux. Mux converts to HLS.
Viewers get low-latency HLS playback in room.html via hls.js.

## Architecture

```
Performer (OBS) → RTMP → Mux Ingest → HLS CDN
                                         ↓
                            room.html (hls.js player)
                                         ↓
                         Mux webhook → /api/stream/webhook
                                         ↓
                           Supabase (performer_streams table)
```

## Required Env Vars (Vercel)

| Variable | Description |
|----------|-------------|
| `MUX_TOKEN_ID` | API Access Token ID from mux.com/settings/access-tokens |
| `MUX_TOKEN_SECRET` | API Access Token Secret |
| `MUX_WEBHOOK_SECRET` | Webhook signing secret (optional, add before production) |

## Setup Steps

### 1. Create Mux Account

1. Go to https://www.mux.com and sign up
2. It's pay-as-you-go: $0.00 until someone actually streams
3. Pricing: ~$0.025/min for live streaming + $0.007/min per viewer for delivery

### 2. Get API Credentials

1. Dashboard → Settings → Access Tokens
2. Create a new token with "Mux Video" read/write permissions
3. Copy the Token ID and Token Secret

### 3. Add Env Vars to Vercel

```bash
vercel env add MUX_TOKEN_ID
vercel env add MUX_TOKEN_SECRET
```

### 4. Set Up Webhook

1. Mux Dashboard → Settings → Webhooks
2. Add endpoint: `https://cumindungeon.com/api/stream/webhook`
3. Select events: `video.live_stream.active`, `video.live_stream.idle`

### 5. Create Supabase Table

```sql
CREATE TABLE performer_streams (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  performer_id TEXT NOT NULL UNIQUE,
  room_id TEXT NOT NULL,
  mux_stream_id TEXT,
  mux_stream_key TEXT,
  mux_playback_id TEXT,
  status TEXT DEFAULT 'idle', -- idle | active
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_streams_room_status ON performer_streams(room_id, status);
```

### 6. Performer Flow

1. Performer opens dashboard, clicks Go Live tab
2. System calls `/api/stream/go-live` which creates a Mux stream
3. Performer gets RTMP URL + stream key
4. Performer enters these in OBS → Settings → Stream → Custom
5. Performer starts OBS stream
6. Mux detects incoming video, sends webhook to mark stream "active"
7. room.html polls `/api/stream/playback`, gets HLS URL, starts playing

### 7. OBS Settings for Performers

Recommended settings to share with performers:

- **Service**: Custom
- **Server**: `rtmps://global-live.mux.com:443/app`
- **Stream Key**: (from their dashboard)
- **Output Resolution**: 1920x1080 or 1280x720
- **FPS**: 30
- **Bitrate**: 2500-4500 kbps
- **Encoder**: x264 or NVENC
- **Keyframe Interval**: 2 seconds

## File Map

| File | Purpose |
|------|---------|
| `api/stream/create.ts` | Creates a new Mux live stream for a performer |
| `api/stream/go-live.ts` | Gets or creates stream credentials for performer |
| `api/stream/playback.ts` | Returns HLS playback URL for a room |
| `api/stream/webhook.ts` | Receives Mux webhooks for stream status |
| `public/js/live-player.js` | Client-side HLS player with auto-detection |

## Cost Estimate

- 1 performer streaming 4 hours/day = ~$6/month ingest
- 50 concurrent viewers for 4 hours = ~$84/month delivery
- Total for 1 active performer: ~$90/month
- This scales linearly. 10 performers = ~$900/month

## Notes

- Mux uses RTMPS (encrypted), which is more secure than plain RTMP
- Reduced latency mode is enabled (3-5 second delay vs 15-30 default)
- Streams auto-disconnect after 12 hours continuous
- No recording by default (add `new_asset_settings` to keep VODs)
