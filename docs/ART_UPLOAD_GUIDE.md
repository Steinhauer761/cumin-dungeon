# Art Upload Guide

Jay has provided all final room/casino art. Here's the mapping and upload instructions.

## Upload to Cloudinary

Cloud name: `sbjyzl03`

Upload each image with the exact filename below. Once uploaded, update
`public/js/room-art-map.js` with the Cloudinary URLs.

## Image Assignments

### Performer Rooms

| Filename | Source Description |
|----------|--------------------|
| `rooms/velvet-room.jpg` | Burgundy velvet booth, string lights, champagne glasses, intimate |
| `rooms/tangled-throne.jpg` | Golden marble staircase with flowing gold fabric, heavenly light |
| `rooms/pink-silk.jpg` | (Still needed from Jay) |
| `rooms/devils-playground.jpg` | Red spiral staircase with neon "DOWN" arrow, industrial |
| `rooms/back-room.jpg` | Neon blue/pink doorway with laser light beams, underground club |
| `rooms/the-dungeon.jpg` | (Still needed from Jay) |
| `rooms/haleys-halo.jpg` | Pink gothic staircase, "Haley's Halo" neon sign, candles, dark stone |
| `rooms/trans-kinks.jpg` | Neon club entrance, pink/blue prismatic lights, modern |

### Venue / Transitions

| Filename | Source Description |
|----------|--------------------|
| `rooms/grand-hall.jpg` | Chandelier ballroom, people in formal/lingerie mingling, warm gold |
| `rooms/transition-hallway.jpg` | (Still needed from Jay) |
| `rooms/transition-to-casino.jpg` | (Still needed from Jay) |

### Casino Games

| Filename | Source Description |
|----------|--------------------|
| `casino/slots.jpg` | Dragon-topped slot machine "Fortune is Mine", gold/red, candles |
| `casino/blackjack.jpg` | (From first batch, Jay sent but image wasn't visible to me) |
| `casino/dice.jpg` | (Still needed from Jay) |
| `casino/highlow.jpg` | Glowing tarot card with up/down arrows, crystal balls, candlelight |

### Category Icons

| Filename | Source Description |
|----------|--------------------|
| `rooms/category-icons.png` | 8 gold/red heraldic cards: Women, Men, Couples, Gay, Bi, Trans, Fetish, VIP |

## Still Missing

- Pink Silk room art
- The Dungeon (VIP) room art
- Dice casino art
- Transition hallway scene
- Transition to casino scene

## After Upload

1. Get URLs from Cloudinary (format: `https://res.cloudinary.com/sbjyzl03/image/upload/v.../filename.jpg`)
2. Update `public/js/room-art-map.js` with full URLs
3. The room.html and hall.html pages reference this map automatically
4. Commit and deploy
