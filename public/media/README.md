# Cinematic entrance media

The entrance flow expects these three production video assets in this directory:

- `castle-hall-sequence.mp4`
- `hall-casino-sequence.mp4`
- `castle-to-casino-reveal.mp4`

They are played sequentially by `/entrance.html`, with a Skip button and a graceful fallback to `/hall.html` if a video is unavailable.

The MP4 binaries are prepared locally from the supplied storyboard frames and still need to be copied into this directory because the GitHub connector cannot accept local binary attachments directly.
