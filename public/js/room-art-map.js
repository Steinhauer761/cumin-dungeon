/**
 * CumIN Dungeon - Room Art Map
 * Single source of truth for all room background images.
 * Import this in any page that needs room art.
 *
 * IMPORTANT: These images need to be uploaded to Cloudinary (cloud: sbjyzl03)
 * and the URLs updated here. For now, using /assets/rooms/ local paths.
 * Once on Cloudinary, replace with full URLs for proper CDN delivery.
 */

window.ROOM_ART = {
  // Performer Rooms
  'velvet-room': '/assets/rooms/velvet-room.jpg',
  'tangled-throne': '/assets/rooms/tangled-throne.jpg',
  'pink-silk': '/assets/rooms/pink-silk.jpg',
  'devils-playground': '/assets/rooms/devils-playground.jpg',
  'back-room': '/assets/rooms/back-room.jpg',
  'the-dungeon': '/assets/rooms/the-dungeon.jpg',
  'haleys-halo': '/assets/rooms/haleys-halo.jpg',
  'trans-kinks': '/assets/rooms/trans-kinks.jpg',

  // Venue
  'grand-hall': '/assets/rooms/grand-hall.jpg',
  'transition-hallway': '/assets/rooms/transition-hallway.jpg',
  'transition-to-casino': '/assets/rooms/transition-to-casino.jpg',

  // Casino Games
  'casino-slots': '/assets/casino/slots.jpg',
  'casino-blackjack': '/assets/casino/blackjack.jpg',
  'casino-dice': '/assets/casino/dice.jpg',
  'casino-highlow': '/assets/casino/highlow.jpg',
};

// Room category icons (replace chess pieces)
window.CATEGORY_ICONS = '/assets/rooms/category-icons.png';
