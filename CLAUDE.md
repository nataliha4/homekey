# HomeKey: notes for Claude

HomeKey is a small web app that teaches music harmony by ear, built by Natalie (product owner, software background) with her piano teacher Troy (content and teaching). It is live at https://nataliha4.github.io/homekey/ (GitHub Pages, deployed from `main`, root folder).

## Key documents (Claude Docs, readable with the Docs tools)

- Product brief, with the full learning path: https://claude.ai/code/artifact/1c3d3b6d-7d49-4386-9631-64d3a33aff98
- Backlog of feedback and ideas, numbered items with status: https://claude.ai/code/artifact/1556af23-53d1-4b0e-8ec8-2d259f1d3301

Read the backlog before starting work. When an item is done, move it to the Done table with a line on what changed.

## How Natalie likes to work

- Step by step, no rushing. Propose the plan (or a mockup for visual changes) and wait for her OK before coding.
- Warm, concise, no filler. American English. She iterates on wording in chat before it goes into the app.
- She tests on her Android phone and her Mac; testers also use iPhones. Remind her to hard-refresh (Cmd + Shift + R) after a deploy if something looks old.
- Commit messages: a subject of at most 50 characters (GitHub's limit in her workflow), plus a short bullet description.
- Recordings are stand-ins and will all be re-recorded. Change texts freely; just list which recordings no longer match.

## Code

- `index.html`: page skeleton and all CSS (single dark theme: background #0F1724, accent yellow #F5B841, teal #6AD1C7; fonts Outfit and DM Sans).
- `app.js`: everything else, in this order: Sound (Web Audio synth), Progress (localStorage `homekey.progress.v2`: finished chapters and the furthest step reached per chapter), Voice (recorded mp3 with the browser's speech voice as fallback), Spotify (embedded player via the Spotify iFrame API, only on the hosted site; plain links elsewhere), chord constants, `CONTENT` (sections and chapters), then rendering and the click handler.
- `voice-<chapter>[-step].mp3`: recorded voice for the character, per chapter and step (1a and 1b are complete).
- No build step, no dependencies. Check syntax with `node --check app.js`.

## Lesson design (as built)

Each chapter has five steps (to be renamed, backlog item 10: Idea, Songs, Ear training, Play, Recap):

1. Explain: headline, picture with the eighth-note character, text, chord demo.
2. Listen: per song, a synthesized groove, then the real recording from Spotify inside the card.
3. Choose: ten ear-training rounds with a balanced, shuffled mix of answers; skippable.
4. Play: play along with a groove at the piano (how to make this interactive is open, backlog item 1).
5. Recap: points to remember.

Interaction rules built so far:

- Exactly one filled yellow button at a time: the next thing to do. An outlined yellow button means "available". Nothing is ever locked.
- The character's speech bubble ("Tap to listen") is the first action on each step of a voiced chapter; the step's main button takes over once the voice is heard, stopped or skipped.
- Sounds never overlap: starting one stops the others (groove, voice, Spotify).
- Returning users see steps they've passed already unlocked and highlighted forward.

## Content status

- Section 1 "Home Sweet Home" has nine chapters (1a to 1i); 1a to 1f are built. 1a and 1b are complete (voice, Spotify, scripts). 1c to 1f need instruction scripts, recordings and exact Spotify track links.
- The brief has 11 sections; the app's map still lists 10 sections and 53 chapters (not yet synced).
- All explanation texts are placeholders until Troy writes his own.

## Processing a new voice recording

Natalie sends phone recordings (m4a). Clean them up like this, then set the chapter's `audio` field in `app.js`:

```
ffmpeg -y -i input.m4a -ac 1 -af "highpass=f=80,silenceremove=start_periods=1:start_threshold=-40dB:start_silence=0.1,areverse,silenceremove=start_periods=1:start_threshold=-40dB:start_silence=0.25,areverse,afftdn=nf=-40,loudnorm=I=-16:TP=-2:LRA=11,afade=t=in:d=0.04" -ar 44100 -b:a 96k voice-1c.mp3
```
