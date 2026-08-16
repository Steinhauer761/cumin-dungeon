# Transition Video Map

Drop your 9 videos here. Name them to match the transition keys:

| File name | Transition |
|-----------|------------|
| `lobby-to-hall.mp4` | Lobby → Grand Hall |
| `lobby-to-room.mp4` | Lobby → Any Room |
| `hall-to-room.mp4` | Grand Hall → Room |
| `hall-to-casino.mp4` | Grand Hall → Casino Game |
| `room-to-hall.mp4` | Room → Back to Hall |
| `room-to-vip.mp4` | Room → Private Show |
| `casino-to-hall.mp4` | Casino → Back to Hall |
| `hall-to-lobby.mp4` | Hall → Back to Lobby |
| `generic.mp4` | Fallback for any other transition |

If a video isn't present, the system gracefully falls back to a quick fade.

## Specs
- Format: MP4 (H.264)
- Duration: 3-5 seconds
- Resolution: 1920x1080 or 1080x1920 (system uses object-fit:cover)
- Keep file size under 2MB each for fast load
