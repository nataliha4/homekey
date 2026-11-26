# HomeKey: notes for Claude

HomeKey is a small web app that teaches music harmony by ear, built by Natalie (product owner, software background) with her piano teacher Troy (content and teaching). GitHub Pages deploys `main`.

**All work happens in HomeKey v2, in the `next/` folder** (https://nataliha4.github.io/homekey/next/). The main app in the root folder (https://nataliha4.github.io/homekey/, the link testers have) is **v1, frozen since Nov 19, 2026: do not change its files**. Only its recordings are shared: v2 reads them with `../`. When Natalie decides, v2 will replace v1.

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
- Anything we decide to park for later goes into the backlog right away, with what was decided.

## Code (v1, frozen; v2 is built on the same structure)

- `index.html`: page skeleton and all CSS (single dark theme: background #0F1724, accent yellow #F5B841, teal #6AD1C7; fonts Outfit and DM Sans).
- `app.js`: everything else, in this order: Sound (Web Audio synth), Progress (localStorage `homekey.progress.v2`: finished chapters and the furthest step reached per chapter), Voice (recorded mp3 with the browser's speech voice as fallback), Spotify (embedded player via the Spotify iFrame API, only on the hosted site; plain links elsewhere), chord constants, `CONTENT` (sections and chapters), then rendering and the click handler.
- `voice-<chapter>[-step].mp3`: recorded voice for the character, per chapter and step (1a and 1b are complete).
- No build step, no dependencies. Check syntax with `node --check app.js`.

## HomeKey v2 (`next/`): where all work happens

- The eighth-note character is **Cady** (short for Cadence, how music comes back home), a girl with a childlike voice. Use her name in texts and scripts; she introduces herself in the intro before 1a (see below).
- Cady's ElevenLabs voice: "Kavya – Cute & Engaging Character", voice id `hpp4J3VqNfWAUOO0d1Us` (https://elevenlabs.io/app/speech-synthesis/text-to-speech?history_voice_id=hpp4J3VqNfWAUOO0d1Us). Use it for every Cady line.

- One screen, one action: the action sits in the content (voice pill, play button, answer cards); a gray Continue at the bottom turns yellow once it's done. Top bar is just ✕ and the lesson's five steps as arrows with their icons (no back arrow since Nov 26: tap a finished, teal step to go back to its first screen; upcoming steps aren't tappable) (💡 🎵 👂 🎹 📌; finished in teal (the app's "done" color, so yellow stays for the one action), current filling up in teal, next ones faded; `stepsBarHtml` in `next/lesson.js`, chosen Nov 26, 2026 over pill shapes, which looked like buttons). The intro keeps a plain bar. Mockups: Design canvas "HomeKey lesson screens" (row "B, chosen · 1a in detail").
- Files: `next/index.html` (page and all CSS), `next/app.js` (started as a copy of v1's app.js; now v2's own and changed freely), `next/lesson.js` (the new lesson design), `next/intro.js` (the "Meet Cady" intro, backlog #19). Check syntax with `node --check` on all three scripts. `next/index.html` loads them with `?v=<date>` (e.g. `app.js?v=2026-11-19b`): bump it on every deploy that changes a script, or phones (especially the installed app) keep the old scripts from their cache.
- Intro (backlog #19): a "Start here · 1 minute" card above Section 1 opens five screens (hello, sound check, how it works, piano nearby?, ready) voiced by `next/voice-intro-*.mp3`. localStorage `homekey.introDone` and `homekey.hasPiano` (yes/no, not used yet); Reset progress clears both. The Welcome screen stays as a cover before the path. On screen 3 the step boxes light up as Cady names them, timed by `cues` in `next/intro.js` (seconds into `voice-intro-3-how.mp3`): measure them again (ffmpeg silencedetect) whenever that line is re-recorded.
- When Cady speaks (decided Nov 19, 2026): on the first screen of the intro and of a lesson (the Idea), she waits for a tap, with a "Tap Cady" hint, because the user may have opened it just to look, somewhere they can't play sound. On screens reached by tapping Continue inside the intro, she starts by herself.
- 1a Songs, first screen (Nov 25, 2026): no groove. Cady starts by herself (reached by Continue), her line shows as she speaks, and the song card appears only once she's done, stopped, or "Read it instead" is tapped (`songsV2` in `next/lesson.js`). Lines: `next/voice-1a-songs-v2.mp3` ("Songs that never leave home are rare...") and, for the second song (Coconut, same design), `next/voice-1a-song2-v2.mp3` ("Next up: Coconut!..."). Third song (v2 only, added in `next/lesson.js`): Inventions by Maserati, line `next/voice-1a-song3-v2.mp3`. A song can set `startAt` (seconds) to skip a quiet opening (Inventions: 30); it applies only to full tracks (logged-in Spotify), never to the ~30-second previews phones often get, and works by reloading the track with a start time (Spotify's `seek()` doesn't move the embed). Groove's future role: backlog #23.
- 1a Ear training (Nov 25, 2026): in round 1 Cady starts by herself and explains the game (`earV2` in `next/lesson.js`); once she's done, stopped, or read, the game takes her place (same layout every round). The play/listen/replay/keyboard slot and the bottom area have fixed heights so the answer cards never move. From round 2 on, no Cady. Question shortened to "Did the music stay home, or leave?". Her line is `next/voice-1a-ear-v2.mp3`. After each answer Cady says a short verdict (`next/voice-ear-correct-1..3.mp3`, `next/voice-ear-notquite-1..3.mp3`, shared by all chapters; `VERDICT` in `next/lesson.js`), picked at random, never the same twice in a row; the chord replay waits until she's done. Lesson screens got more space between the step label, headline and Cady.
- 1a Recap (Nov 26, 2026): Cady (cheering) starts by herself and reads the three points (`recap2` in `next/lesson.js`, `next/voice-1a-recap-v2.mp3`); each point lights up while she says it, timed by `cues` (measure again if re-recorded). "Next: 1b" turns yellow once she's done or stopped.
- New lesson design (backlog #5): only chapter 1a uses it (`NEW_LESSON` in `next/lesson.js`); chapters 1b to 1f still open in the old design inside v2. Natalie approved 1a on Nov 26, 2026 (#5 and the intro #19 moved to Done); 1b is next, chapter by chapter.
- 1b in v2 (started Nov 26, 2026), now titled "Happy home, sad home": happy/sad everywhere (backlog #4). It opens in the new lesson design (`NEW_LESSON['1b']`), set up in the 1b block of `next/lesson.js`. Done: the Idea screen (headline "Home can feel sad, too.", a melancholic Cady under a moon, `next/voice-1b-idea-v2.mp3`). Done: "Hear happy, then sad" (C major, then E steps down to E♭: dashed outline on E, glow on E♭, "One note down" tag, and an orange pointing hand that slides from E to E♭ twice; `demoV2.move`, `pointer: 'hand'` (an arrow version is kept as `'arrow'`)). Songs (Nov 26, 2026): every lesson gets at least three songs (Natalie). Song 2 is Get Up, Stand Up (Bob Marley & The Wailers) in the new song design (`b.songsV2[1]`, line `next/voice-1b-song2-v2.mp3`, `startAt: 9` to skip the bass moving in the first bars); song 1, Carol of the Bells, is in the same design (`b.songsV2[0]`, `next/voice-1b-song1-v2.mp3`, "Let's hear a sad home in real songs!..."); song 3 is A l'écoute du moro (Constantinople, Ablaye Cissoko; only its first minute stays on a sad home, Cady says "Listen to the first part" (about a minute)), line `next/voice-1b-song3-v2.mp3`. Interim, to redo screen by screen: ear training (old pill recording mentions "bright or dark"), Play (old text, no voice), Recap (old recording).
- The test copy is called "HomeKey v2" and installs as its own app (backlog #2): `next/manifest.webmanifest` and `next/icons/` (icon E from the design canvas: yellow roof over the H and K tiles, on navy). The main app has no manifest yet.
- Recordings stay in the main folder; the test copy reads them with `../`. Exception: v2-only recordings live in `next/` (`voiceV2` in `next/lesson.js`), starting with `next/voice-1a-idea-v2.mp3`, the ElevenLabs voice for the 1a Idea (backlog #13). Generated audio only needs trimming and loudness matching, not the noise filter below. 1a Play (Nov 25, 2026): Cady starts by herself and sets up the exercise (`next/voice-1a-play-v2.mp3`, `play2` in `next/lesson.js`); once she's done, a short reminder replaces her line and the keyboard ("End here" over C), groove button and "I played it" appear. The line under the keys follows the intro's piano answer (`homekey.hasPiano`).

## Old lesson design (v1, and chapters 1b to 1f in v2)

Each chapter has five steps (renamed in backlog item 10; internal code names still use explain, listen, choose):

1. 💡 Idea: headline, picture with the eighth-note character, text, chord demo.
2. 🎵 Songs: per song, a synthesized groove, then the real recording from Spotify inside the card.
3. 👂 Ear training: ten ear-training rounds with a balanced, shuffled mix of answers; skippable.
4. 🎹 Play: play along with a groove at the piano (how to make this interactive is open, backlog item 1).
5. 📌 Recap: points to remember.

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
