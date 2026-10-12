# HomeKey

A small web app for learning music harmony by ear, built by Natalie with her piano teacher Troy.

## Status

Section 1, "Home Sweet Home": chapters 1a to 1f are built (home, bright and dark homes, the door, the door with its 7th, the garden, the bedroom). Chapters 1a and 1b have a recorded voice guide and play the real songs from Spotify. Chapters 1g to 1i and the later sections are planned.

## Files

- `index.html`: the page and its styles
- `app.js`: sound (Web Audio synth), progress (saved in the browser), voice, Spotify player, lesson content, and screens
- `voice-*.mp3`: the character's recorded voice, per chapter and step
- `CLAUDE.md`: working notes for Claude sessions

## Run it

Open `index.html` in a browser. No build step and no dependencies.

## Notes

- The explanation texts are placeholders until Troy writes his own.
- Some song examples still need to be confirmed against a recording (marked in `app.js`).
- Songs play as a synthesized groove, then as the real recording in an embedded Spotify player (full tracks when signed in to Spotify, 30-second previews otherwise).
