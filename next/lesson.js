/* ---------- New lesson design (test copy at /next/, chapter 1a only) ----------
   One screen, one action. The action lives in the content (the voice pill, a play button, the answer cards);
   Continue waits at the bottom in gray and turns yellow once that action is done. Designs: "HomeKey lesson screens".
   Loaded after app.js and reuses its Sound, Voice, Spotify, Progress, keyboard and content. */
var AUDIO_BASE = '../'; // the recordings live in the main folder, one level up
var NEW_LESSON = { '1a': true, '1b': true };

// Play step text for the new design (the old recording, voice-1a-play.mp3, no longer matches it).
// v2 voices that live in this folder (not the main one), e.g. the ElevenLabs stand-in for the 1a Idea (backlog #13).
CONTENT.chapters['1a'].voiceV2 = 'voice-1a-idea-v2.mp3';

// Songs screens (new design, Nov 25, 2026): no groove; Cady says her line, then the song card appears.
// One entry per song, in order; Cady's lines are ElevenLabs recordings in this folder.
CONTENT.chapters['1a'].songsV2 = [
  { headline: 'Hear it in a song', voice: 'voice-1a-songs-v2.mp3',
    intro: 'Songs that never leave home are rare, but they exist! Let\'s hear a few. Maybe you know some of them already.' },
  { headline: 'One more song', voice: 'voice-1a-song2-v2.mp3',
    intro: 'Next up: Coconut! You might hear one spicy extra note in the chord. Don\'t worry about it for now. We\'ll get to it soon!' },
  { headline: 'One last song', voice: 'voice-1a-song3-v2.mp3',
    intro: 'Here\'s something different: Inventions, by Maserati. No words, just guitar patterns that repeat over a steady, driving beat. And it stays home the whole time! Listen to how much can happen without ever leaving.' }
];
// Ear training (new design, Nov 25, 2026): in round 1 Cady explains the game, then the play button and answers appear.
// Her line: voice-1a-ear-v2.mp3 (ElevenLabs, in this folder).
CONTENT.chapters['1a'].earV2 = {
  prompt: 'Did the music stay home, or leave?', // shorter: Cady already says "you'll hear four chords"
  intro: 'Now test your ear! You\'ll hear four chords. Did the music stay home, or did it leave? Tap your answer. There are ten rounds, so take your time.',
  voice: 'voice-1a-ear-v2.mp3'
};
/* ---------- 1b in the new design (started Nov 26, 2026; screen by screen) ----------
   One pair of words everywhere: happy and sad (backlog #4). Done so far: the Idea screen (sad Cady under a
   moon, her line voice-1b-idea-v2.mp3). The other screens are interim: the old content in the new frame. */
(function () {
  var b = CONTENT.chapters['1b'];
  b.title = 'Happy home, sad home';
  CONTENT.section1.chapters.forEach(function (x) { if (x.id === '1b') { x.title = 'Happy home, sad home'; } });
  b.mood = 'sad';
  b.headlineV2 = 'Home can feel sad, too.';
  b.voiceV2 = 'voice-1b-idea-v2.mp3';
  b.explainV2 = ['Home can feel happy or sad! A happy home is called major. A sad home is called minor. And here\'s the surprise: only one note is different. The middle one!'];
  b.demoV2 = { title: 'Hear happy, then sad', sub: 'Tap play and watch the middle note.', label: 'Play happy, then sad', lit: [], caption: '',
    // after the first chord, the middle note visibly steps down: E keeps a dashed outline, a tag names the change
    move: { from: 64, to: 63, at: 1.6, tag: 'One note down', pointer: 'hand' } }; // pointer: 'hand' or 'arrow' (Nov 26: trying the hand)
  b.demo = function () { playBeats([{ notes: C_MAJOR.notes, bass: 48, caption: 'Happy: C major (C, E, G)' }, { notes: C_MINOR.notes, bass: 48, caption: 'Sad: C minor (C, E\u266D, G)' }], 1.6, 'block'); };
  b.choose.prompt = 'Listen to the chord. Is it happy or sad?';
  b.choose.options = [{ q: 'major', icon: '😊', label: 'Happy', sub: 'major' }, { q: 'minor', icon: '😢', label: 'Sad', sub: 'minor' }];
  b.play2 = { title: 'Your turn to play', text: 'Start from C major (C, E, G), then lower the middle note to the black key on its left. That\'s C minor, a sad home. Start the groove and play C minor along with it.',
    tips: [], caption: 'C minor: C, E flat, G', lit: C_MINOR.notes, endHere: false, beats: repeat(C_MINOR, 12), beatDur: 0.75 };
  // Songs: at least three per lesson (Natalie, Nov 26, 2026). Songs 1 (Carol of the Bells) and 2 use the new
  // song design (no groove). Song 3: still to be chosen.
  b.songs.push({ title: 'Get Up, Stand Up', artist: 'Bob Marley & The Wailers', kind: 'Minor home',
    url: 'https://open.spotify.com/track/2Mw8xQJpIDAgrktDXEqxCs', spotifyId: '2Mw8xQJpIDAgrktDXEqxCs',
    startAt: 9 }); // skip the opening bars, where the bass moves around before it settles on home
  b.songsV2 = [
    { headline: 'Hear it in a song', voice: 'voice-1b-song1-v2.mp3',
      intro: 'Let\'s hear a sad home in real songs! First: Carol of the Bells. Four little notes circle round and round, like bells ringing in the cold. Can you hear how the home feels sad?' },
    { headline: 'One more song', voice: 'voice-1b-song2-v2.mp3',
      intro: 'Next up: Get Up, Stand Up, by Bob Marley! The home here is sad, but listen to that beat. Sad doesn\'t have to mean slow!' }];
  b.recap = ['Home can be major or minor.', 'Major sounds happy. Minor sounds sad.', 'Only one note differs between them: the middle one.'];
})();

// Recap (new design, Nov 26, 2026): Cady cheers and reads the points; each lights up while she says it.
// cues: when each point starts in voice-1a-recap-v2.mp3 (seconds); measure again if the line is re-recorded.
CONTENT.chapters['1a'].recap2 = {
  voice: 'voice-1a-recap-v2.mp3', line: 'Well done! Here\'s what to remember.',
  intro: 'Well done! Here\'s what to remember. A song can stay on one chord, and that chord is home. Home is where the music feels at rest. And when the chord changes, the music has left home.',
  cues: [3.0, 7.45, 10.4], cuesEnd: 13.9
};
// The third song, v2 only (added Nov 25, 2026): an instrumental that never leaves its one home.
CONTENT.chapters['1a'].songs.push({ title: 'Inventions', artist: 'Maserati', kind: 'Instrumental home',
  url: 'https://open.spotify.com/track/25WeY1hkgBRLjwl0R7JiB8', spotifyId: '25WeY1hkgBRLjwl0R7JiB8',
  startAt: 30 }); // the track opens with near silence: start where the music is clearly there

CONTENT.chapters['1a'].play2 = {
  title: 'Your turn to play',
  text: 'Time to make your own little tune! Here\'s how: start the groove, and play along! Any melody or sequence of notes, one note at a time, in any order and rhythm you like.',
  tips: ['Skip the black keys.', 'When the groove stops, end on <b>C</b>. Notice how it feels like landing home.'],
  caption: 'The groove plays C major: C, E, G',
  beats: repeat(C_MAJOR, 24), beatDur: 0.75, // about 18 seconds, enough time for a little tune
  // New design (Nov 25, 2026): Cady sets up the exercise, then a short reminder replaces her line on screen.
  voice: 'voice-1a-play-v2.mp3',
  intro: 'Your turn! In this groove, the chord stays home the whole time. But your melody doesn\'t have to! Make up a little tune, one note at a time. Skip the black keys, and when the groove stops, end on C. Hear how it lands home?',
  reminder: 'Make up a little tune on the white keys. When the groove stops, end on <b class="iaccent">C</b>!'
};

var L = (function () {
  var s = null;
  var ICON = {
    play: '<svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M6 4 L20 12 L6 20 Z"></path></svg>',
    stop: '<svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><rect x="5" y="5" width="14" height="14" rx="2"></rect></svg>',
    again: '<svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12 A8 8 0 1 0 7 5.8"></path><path d="M4 4 V9 H9"></path></svg>',
    bars: '<svg class="lbars" aria-hidden="true" width="30" height="22" viewBox="0 0 30 22"><rect x="1" y="8" width="4" height="6" rx="2"></rect><rect x="9" y="2" width="4" height="18" rx="2"></rect><rect x="17" y="5" width="4" height="12" rx="2"></rect><rect x="25" y="9" width="4" height="4" rx="2"></rect></svg>',
    back: '<svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12 H5 M11 6 L5 12 L11 18"></path></svg>',
    close: '<svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M6 6 L18 18 M18 6 L6 18"></path></svg>',
    phones: '<svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 14 V12 A9 9 0 0 1 21 12 V14"></path><rect x="3" y="14" width="4" height="7" rx="1.5" fill="currentColor"></rect><rect x="17" y="14" width="4" height="7" rx="1.5" fill="currentColor"></rect></svg>',
    arrow: '<svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12 H19 M13 6 L19 12 L13 18"></path></svg>',
    check: '<svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12 L10 17 L19 7"></path></svg>',
    cross: '<svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><path d="M7 7 L17 17 M17 7 L7 17"></path></svg>',
    note: '<svg aria-hidden="true" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18 V5 L20 3 V16"></path><circle cx="6.5" cy="18" r="2.5"></circle><circle cx="17.5" cy="16" r="2.5"></circle></svg>',
    cheer: '<svg aria-hidden="true" width="64" height="76" viewBox="0 0 64 76"><line x1="46" y1="52" x2="46" y2="8" stroke="#F5B841" stroke-width="4.5" stroke-linecap="round"></line><path d="M46 8 C48 22 62 26 58 44 C58 32 51 28 46 26 Z" fill="#F5B841"></path><ellipse cx="27" cy="57" rx="22" ry="16" transform="rotate(-18 27 57)" fill="#F5B841"></ellipse><path d="M17 52 Q20 48 23 52" fill="none" stroke="#1A1300" stroke-width="2.2" stroke-linecap="round"></path><path d="M29 49 Q32 45 35 49" fill="none" stroke="#1A1300" stroke-width="2.2" stroke-linecap="round"></path><path d="M20 61 Q28 68 37 58" fill="none" stroke="#1A1300" stroke-width="2.4" stroke-linecap="round"></path><path d="M8 50 L2 40" stroke="#F5B841" stroke-width="4" stroke-linecap="round"></path></svg>'
  };

  function ch() { return CONTENT.chapters[s.id]; }
  // Fade something in only the first time it appears: the screen is redrawn on every voice change (start, end,
  // replay), and replaying the fade made the text look like it reloaded.
  // (A redraw during the fade continues it from where it was, via a negative delay, instead of starting over.)
  function fadeOnce(key) {
    s.seen = s.seen || {};
    var now = Date.now(), t0 = s.seen[key] || (s.seen[key] = now), gone = now - t0;
    return gone > 500 ? '' : ' fadein" style="animation-delay: -' + gone + 'ms';
  }
  // The new-design entry for a song screen ('song0', 'song1', ...), if that song has one.
  function v2Song(name) { var c = ch(), si = songIndex(name); return si >= 0 && c.songsV2 && c.songsV2[si] || null; }
  function cur() { return s.list[s.i]; }
  function songIndex(name) { return name.indexOf('song') === 0 ? Number(name.slice(4)) : -1; }
  function stepOf(name) { return songIndex(name) >= 0 ? 1 : { idea: 0, demo: 0, ear: 2, play: 3, recap: 4 }[name]; }

  /* ---------- Voice: the note reads the screen's text aloud ---------- */
  function voiceFor(name) {
    var c = ch();
    var v = name === 'idea' ? c.voice && { url: c.voiceV2 || c.voice.audio, local: !!c.voiceV2, words: (c.explainV2 || (c.voice.skipHeadline ? c.explain : [c.headline].concat(c.explain))).join(' ') }
      : v2Song(name) ? { url: v2Song(name).voice, local: true, words: v2Song(name).intro }
      : name === 'song0' ? c.listenVoice && { url: c.listenVoice.audio, words: c.listenIntro }
      : name === 'play' && c.play2 && c.play2.voice ? { url: c.play2.voice, local: true, words: c.play2.intro }
      : name === 'ear' && c.earV2 ? (s.round === 1 && !s.picked) && { url: c.earV2.voice, local: true, words: c.earV2.intro }
      : name === 'ear' ? (hasGuide(c.choose) && s.round === 1 && !s.picked) && { url: c.choose.voice.audio, words: c.choose.intro }
      : name === 'recap' && c.recap2 ? { url: c.recap2.voice, local: true, words: c.recap2.intro }
      : name === 'recap' ? hasGuide(c.recapGuide) && { url: c.recapGuide.voice.audio, words: [c.recapGuide.intro].concat(c.recap).join(' ') }
      : null;
    return v && (v.url || Voice.supported) ? v : null;
  }
  // The voice is the first thing to do on a screen that has one, until it has been heard (or read instead).
  function voiceFirst(name) { return !!voiceFor(name) && name !== 'recap' && !s.heard[name] && !s.read[name]; }
  function textShown(name) { return !voiceFor(name) || s.voice !== 'idle' || s.heard[name] || s.read[name]; }

  function speak() {
    var name = cur(), v = voiceFor(name);
    if (!v) { return; }
    if (s.voice === 'speaking' || s.voice === 'loading') { Voice.stop(); voiceEnded(); return; }
    stopAll();
    s.voice = 'loading'; refresh();
    var begin = function () { if (s && cur() === name && s.voice === 'loading') { s.voice = 'speaking'; refresh(); } };
    var finish = function () { if (s && cur() === name && (s.voice === 'speaking' || s.voice === 'loading')) { voiceEnded(); } };
    timers.push(setTimeout(begin, 4000)); // some browsers never report the start
    if (v.url) { Voice.play((v.local ? '' : AUDIO_BASE) + v.url, v.words, begin, finish); } else { Voice.speak(v.words, begin, finish); }
    if (name === 'recap' && ch().recap2) { followRecapCues(); }
  }
  // Heard, or stopped part way: either way the screen moves on to its next action.
  function voiceEnded() { s.voice = 'idle'; s.heard[cur()] = true; refresh(); }

  /* ---------- Grooves: one at a time; Stop, the end of the groove, or any other sound counts as heard ---------- */
  function startGroove(id, beats, beatDur, style) {
    playBeats(beats, beatDur, style); // stops every other sound first
    s.groove = id;
    timers.push(setTimeout(function () { if (s && s.groove === id) { s.groove = null; grooveHeard(id); refresh(); } }, lastPlayLen * 1000 + 300));
    refresh();
  }
  function grooveHeard(id) {
    if (id === 'play') { s.playGroove = true; ch().play.ready(); light(ch().play2.lit || C_MAJOR.notes, ch().play2.caption); }
    else { s.songs[id] = s.songs[id] || {}; s.songs[id].groove = true; }
  }
  // Called by app.js when all sounds stop: a playing groove counts as heard.
  function onStop() {
    if (!s || state.view !== 'lesson') { return; }
    if (s.groove) { var g = s.groove; s.groove = null; grooveHeard(g); }
  }
  // Called by app.js when only the voice is hushed (a piano key, another sound): the groove keeps playing.
  function onHush() {
    if (!s || state.view !== 'lesson') { return; }
    if (s.voice === 'speaking' || s.voice === 'loading') { s.voice = 'idle'; s.heard[cur()] = true; refresh(); }
  }

  /* ---------- Ear training ---------- */
  function setupEar() {
    s.round = 1; s.results = []; s.picked = null; s.asked = false; s.listening = false;
    state.round = 1; s.q = drawQuestion(ch(), null);
  }
  function ask() {
    var c = ch();
    c.choose.play(s.q);
    s.asked = true; s.listening = true;
    var secs = s.q.beats ? s.q.beats.length * 0.8 + 0.4 : 1.8;
    var round = s.round;
    timers.push(setTimeout(function () { if (s && s.round === round && s.listening) { s.listening = false; refresh(); } }, secs * 1000));
    refresh();
  }

  /* Cady's short verdict after each answer ("Correct!", "Almost!" ...), picked at random but never the same twice
     in a row. The chords replay only once she's done, so the two never overlap. Clips live in this folder. */
  var VERDICT = {
    good: [['voice-ear-correct-1.mp3', 'Correct!'], ['voice-ear-correct-2.mp3', 'Yes! That\'s it!'], ['voice-ear-correct-3.mp3', 'You got it!']],
    bad: [['voice-ear-notquite-1.mp3', 'Not quite.'], ['voice-ear-notquite-2.mp3', 'Almost!'], ['voice-ear-notquite-3.mp3', 'Hmm, not this time.']]
  };
  var lastVerdict = null;
  function verdictVoice(good, then) {
    var list = VERDICT[good ? 'good' : 'bad'].filter(function (x) { return x[0] !== lastVerdict; });
    var pickV = list[Math.floor(Math.random() * list.length)], round = s.round, done = false;
    lastVerdict = pickV[0];
    var go = function () { if (!done && s && s.round === round && s.picked) { done = true; then(); } };
    Voice.play(pickV[0], pickV[1], function () {}, function () { timers.push(setTimeout(go, 150)); });
    timers.push(setTimeout(go, 3000)); // in case the clip never reports its end
  }

  /* ---------- Moving through the screens ---------- */
  function start(id) {
    stopAll();
    s = { id: id, i: 0, voice: 'idle', heard: {}, read: {}, demoPlayed: false, songs: {}, groove: null, spotOpen: null,
      round: 1, results: [], q: null, picked: null, asked: false, listening: false, playGroove: false };
    s.list = ['idea', 'demo'];
    CONTENT.chapters[id].songs.forEach(function (x, i) { s.list.push('song' + i); });
    s.list.push('ear', 'play', 'recap');
    state.chapter = id; state.lit = []; state.caption = '';
    go('lesson');
    render();
  }
  function goTo(i, back) {
    stopAll();
    s.i = i; s.voice = 'idle'; s.spotOpen = null; s.groove = null;
    var name = cur();
    Progress.reach(s.id, stepOf(name));
    state.lit = []; state.caption = '';
    if (name === 'demo') { var dv = ch().demoV2; state.lit = dv ? dv.lit : C_MAJOR.notes; state.caption = dv ? dv.caption : 'Home: C major (C, E, G)'; }
    if (name === 'ear') { setupEar(); }
    if (name === 'play' && !ch().play2.voice) { state.lit = ch().play2.lit || C_MAJOR.notes; state.caption = ch().play2.caption; }
    render();
    window.scrollTo(0, 0);
    // Without a voice guide, the first chords play as soon as the ear training opens.
    if (name === 'ear' && !voiceFor('ear')) { ask(); }
    // The new Songs screen is reached by tapping Continue, so Cady may start by herself (not when coming back).
    if ((v2Song(name) || (name === 'ear' && ch().earV2) || (name === 'play' && ch().play2.voice) || (name === 'recap' && ch().recap2)) && !back && !s.heard[name] && voiceFor(name)) { speak(); }
  }
  function canContinue(name) {
    var si = songIndex(name);
    if (name === 'idea') { return !voiceFor('idea') || !!s.heard.idea || !!s.read.idea; }
    if (name === 'demo') { return s.demoPlayed; }
    if (si >= 0) { var sg = s.songs['song' + si] || {}; if (v2Song(name)) { return !!sg.real || !ch().songs[si].url; } return !!sg.real || (!!sg.groove && !ch().songs[si].url); }
    if (name === 'play') { return s.playGroove; }
    return true;
  }

  /* ---------- Drawing ---------- */
  /* The five steps as arrows (Nov 26, 2026): finished steps yellow, the current one filling up as you go
     (by screen, or by round in ear training), the next ones dark with faded icons. */
  function stepsBarHtml() {
    var name = cur(), step = stepOf(name), same = s.list.filter(function (n) { return stepOf(n) === step; });
    var frac = name === 'ear' ? (s.round - (s.picked ? 0 : 0.5)) / ch().rounds : name === 'recap' ? 1 : (same.indexOf(name) + 0.5) / same.length;
    var h = '<div class="lsteps" role="img" aria-label="Step ' + (step + 1) + ' of 5: ' + STEP_LABEL[step][1] + '">';
    STEP_LABEL.forEach(function (x, k) {
      var fill = k < step ? 100 : k === step ? Math.round(frac * 100) : 0;
      var inner = '<div class="lsegfill" style="width: ' + fill + '%"></div><span aria-hidden="true">' + x[0] + '</span>';
      // Finished steps can be tapped to go back to their first screen (this replaces the back arrow).
      h += k < step
        ? '<button type="button" class="lseg done" data-act="l-step" data-k="' + k + '" aria-label="Back to ' + x[1] + '">' + inner + '</button>'
        : '<div class="lseg' + (k === step ? ' now' : '') + '">' + inner + '</div>';
    });
    return h + '</div>';
  }
  function topHtml() {
    return '<div class="ltop"><button type="button" class="lx" data-act="l-close" aria-label="Close lesson">' + ICON.close + '</button>' +
      stepsBarHtml() + '</div>';
  }
  function pillHtml(name, optional) {
    if (!voiceFor(name)) { return ''; }
    var v = s.voice, cta = !optional && v === 'idle' && voiceFirst(name);
    var cls = 'lpill' + (cta ? ' primary' : '');
    var inner = v === 'loading' ? ICON.bars + 'Getting ready…'
      : v === 'speaking' ? ICON.bars + 'Playing · tap to stop'
      : (s.heard[name] ? ICON.again + 'Listen again' : ICON.play + (optional ? 'Listen' : 'Tap to listen'));
    return '<button type="button" class="' + cls + '" data-act="l-speak" data-voice="' + v + '">' + inner + '</button>';
  }
  function readLink(name) {
    if (!voiceFor(name) || s.voice !== 'idle' || s.heard[name] || s.read[name]) { return ''; }
    return '<button type="button" class="llink" data-act="l-read">Can’t play sound? Read it instead</button>';
  }
  // A screen still waiting for its action shows a small "Skip" under the gray Continue (handy when testing,
  // and for anyone who'd rather not wait for the voice). Its slot keeps its height, so nothing jumps.
  function bottomHtml(label, on, act, noSkip, skipLink) {
    var skip = skipLink ? '<div class="lskipslot">' + skipLink + '</div>'
      : act || noSkip ? '' : '<div class="lskipslot">' + (on ? '' : '<button type="button" class="llink lskip" data-act="l-skipscreen">Skip</button>') + '</div>';
    return '<div class="lbottom" id="lbottom"><button type="button" class="lgo' + (on ? ' on' : '') + '" data-act="' + (act || 'l-next') + '"' + (on ? '' : ' aria-disabled="true"') + '>' + label + '</button>' + skip + '</div>';
  }
  /* The note on its couch, in the middle of the screen. The whole note is the button: before listening it bobs,
     its mouth moves as if about to speak and a "..." bubble shows; while speaking it talks and the bubble shows
     sound bars; once heard it smiles and the bubble offers a replay. No text label: a small hint shows until the first tap. */
  var COUCH =
    '<line x1="20" y1="190" x2="300" y2="190" stroke="#2B3A52" stroke-width="3" stroke-linecap="round"></line>' +
    '<circle cx="262" cy="52" r="17" fill="none" stroke="#4A5E7E" stroke-width="3"></circle><path d="M262 42 V52 L270 57" fill="none" stroke="#4A5E7E" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"></path>' +
    '<rect x="66" y="84" width="188" height="76" rx="18" fill="#2B3A52"></rect><rect x="50" y="138" width="220" height="40" rx="14" fill="#3A4C69"></rect><rect x="40" y="114" width="34" height="66" rx="14" fill="#44587A"></rect><rect x="246" y="114" width="34" height="66" rx="14" fill="#44587A"></rect><rect x="62" y="178" width="10" height="12" rx="2" fill="#2B3A52"></rect><rect x="248" y="178" width="10" height="12" rx="2" fill="#2B3A52"></rect>';
  var CADY =
    '<g class="nbody"><line x1="182" y1="112" x2="182" y2="40" stroke="#F5B841" stroke-width="5" stroke-linecap="round"></line><path d="M182 40 C184 58 206 62 200 86 C200 72 190 66 182 64 Z" fill="#F5B841" stroke="#F5B841" stroke-width="2" stroke-linejoin="round"></path><ellipse cx="160" cy="120" rx="27" ry="21" transform="rotate(-18 160 120)" fill="#F5B841"></ellipse><circle cx="151" cy="116" r="2.8" fill="#1A1300"></circle><circle cx="166" cy="112" r="2.8" fill="#1A1300"></circle>' +
    '<path class="nsmile" d="M152 126 Q161 133 171 123" fill="none" stroke="#1A1300" stroke-width="2.4" stroke-linecap="round"></path><ellipse class="nmouth" cx="161" cy="127" rx="5.5" ry="4.5" fill="#1A1300" transform="rotate(-18 161 127)"></ellipse>' +
    '<path d="M150 139 L141 150 L133 150" fill="none" stroke="#F5B841" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"></path><path d="M168 139 L162 151 L154 151" fill="none" stroke="#F5B841" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"></path>' +
    '<path class="nbub" d="M96 28 H136 Q146 28 146 38 V52 Q146 62 136 62 H124 L138 78 L112 62 H96 Q86 62 86 52 V38 Q86 28 96 28 Z"></path>' +
    '<g class="ndots"><circle cx="102" cy="45" r="4.2"></circle><circle cx="116" cy="45" r="4.2"></circle><circle cx="130" cy="45" r="4.2"></circle></g>' +
    '<g class="nbars"><rect x="100" y="41" width="4" height="8" rx="2"></rect><rect x="108" y="35" width="4" height="20" rx="2"></rect><rect x="116" y="38" width="4" height="14" rx="2"></rect><rect x="124" y="42" width="4" height="6" rx="2"></rect></g>' +
    '<path class="nagain" d="M109 45 A7 7 0 1 0 111.5 39.6 M109 36 V40.5 H113.5" fill="none" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"></path></g>';
  var NOTE_SCENE = COUCH + CADY;
  // 1b: a melancholic Cady (worried brows, eyes down, a small frown once she's done) under a moon, no clock.
  var SAD_CADY = CADY
    .replace('<circle cx="151" cy="116" r="2.8" fill="#1A1300"></circle><circle cx="166" cy="112" r="2.8" fill="#1A1300"></circle>',
      '<circle cx="151" cy="117.5" r="2.6" fill="#1A1300"></circle><circle cx="166" cy="113.5" r="2.6" fill="#1A1300"></circle>' +
      '<path d="M145.5 112.5 L152.5 108" stroke="#1A1300" stroke-width="2" stroke-linecap="round"></path><path d="M161 104 L169 107.5" stroke="#1A1300" stroke-width="2" stroke-linecap="round"></path>')
    .replace('d="M152 126 Q161 133 171 123"', 'd="M154 131 Q161 126.5 169 128"');
  var SAD_SCENE = COUCH.replace(/<circle cx="262"[^]*?<\/path>/, '') +
    '<circle cx="262" cy="46" r="13" fill="#D9D4C4"></circle><circle cx="269" cy="41" r="11.5" fill="#0F1724"></circle>' +
    '<circle cx="246" cy="32" r="1.8" fill="#D9D4C4"></circle><circle cx="282" cy="66" r="1.5" fill="#D9D4C4"></circle><circle cx="240" cy="60" r="1.3" fill="#D9D4C4"></circle>' + SAD_CADY;
  var HINT_KEY = 'homekey.noteTapped';
  function noteTapped() { try { return localStorage.getItem(HINT_KEY) === '1'; } catch (e) { return true; } }
  // Which of the five steps a screen belongs to, as a small label above its headline (same icons as the intro).
  var STEP_LABEL = [['\uD83D\uDCA1', 'Idea'], ['\uD83C\uDFB5', 'Songs'], ['\uD83D\uDC42', 'Ear training'], ['\uD83C\uDFB9', 'Play'], ['\uD83D\uDCCC', 'Recap']];
  function stepLabel(name) {
    var x = STEP_LABEL[stepOf(name)];
    return '<div class="eyebrow lstep"><span aria-hidden="true">' + x[0] + '</span>' + x[1] + '</div>';
  }
  function ideaHtml() {
    var c = ch(), shown = textShown('idea'), v = s.voice;
    var st = v === 'speaking' ? 'speaking' : v === 'loading' ? 'loading' : (s.heard.idea || s.read.idea) ? 'heard' : 'idle';
    var label = st === 'speaking' || st === 'loading' ? 'Stop Cady' : st === 'heard' ? 'Hear Cady again' : 'Tap Cady to listen';
    var h = stepLabel('idea') + '<h1 class="lh">' + esc(c.headlineV2 || c.headline) + '</h1>';
    h += '<div class="lstage"><button type="button" class="lnote" data-act="l-speak" data-state="' + st + '" aria-label="' + label + '">' +
      '<svg aria-hidden="true" viewBox="30 10 260 190">' + (c.mood === 'sad' ? SAD_SCENE : NOTE_SCENE) + '</svg></button>' +
      '<div class="lhint">' + (st === 'idle' ? 'Tap Cady' : '') + '</div></div>'; // shown every time she waits, as in the intro
    h += '<div class="lsubs' + (shown ? fadeOnce('subs-idea') : '') + '" aria-live="polite">' + (shown ? (c.explainV2 || c.explain).map(function (p) { return '<p>' + esc(p) + '</p>'; }).join('') : '') + '</div>';
    h += '<div class="llinkslot">' + readLink('idea') + '</div>'; // a fixed slot, so nothing moves when the link goes away
    return h + bottomHtml('Continue', canContinue('idea'));
  }
  function demoHtml() {
    var d = ch().demoV2 || { title: 'Hear a home chord', sub: 'Tap play and notice how settled it sounds.', label: 'Play the home chord' };
    var h = stepLabel('demo') + '<h1 class="lh">' + esc(d.title) + '</h1><p class="lp">' + esc(d.sub) + '</p>';
    h += '<div class="lmid"><div class="lcenter"><button type="button" class="lround' + (s.demoPlayed ? '' : ' primary') + '" data-act="l-demo" aria-label="' + (s.demoPlayed ? 'Play it again' : esc(d.label)) + '">' + (s.demoPlayed ? ICON.again : ICON.play) + '</button>' +
      '<div class="lroundlbl' + (s.demoPlayed ? '' : ' on') + '">' + (s.demoPlayed ? 'Play it again' : esc(d.label)) + '</div></div>';
    var kb = keyboardHtml();
    if (d.move) {
      // A fixed slot for the tag above the keys (empty until the note has moved), so nothing jumps.
      var mv = s.demoMoved;
      // Right after the move, a straight arrow shoots from E up to E flat, twice, then fades away.
      var since = mv && s.movedAt ? Date.now() - s.movedAt : 1e9;
      var arrow = since >= 3000 ? '' : d.move.pointer === 'hand'
        // A pointing hand slides from E over to E flat, twice, then disappears.
        ? '<span class="lmovehand" aria-hidden="true" style="animation-delay: -' + since + 'ms"><svg viewBox="0 0 24 30" width="30" height="38"><g fill="#FF9A5C"><rect x="7.5" y="1" width="5.4" height="16" rx="2.7"></rect><rect x="5" y="12" width="15" height="15" rx="5.5"></rect><rect x="12" y="10.5" width="4.6" height="7" rx="2.3"></rect><rect x="15.6" y="11.5" width="4.4" height="7" rx="2.2"></rect><rect x="1.2" y="14.5" width="8" height="4.6" rx="2.3" transform="rotate(28 5 17)"></rect></g><g fill="none" stroke="#C9693A" stroke-width="0.9" stroke-linecap="round"><path d="M12.4 13.5 V16.5"></path><path d="M16.1 14 V17"></path></g></svg></span>'
        // The arrow (tried first, kept for now): rises from E toward E flat, twice, then fades.
        : since < 2800 ? '<svg class="lmovearrow" aria-hidden="true" style="animation-delay: -' + since + 'ms"><defs>' +
        '<marker id="lmah" viewBox="0 0 10 10" refX="3" refY="5" markerWidth="3" markerHeight="3" orient="auto"><path d="M0 0 L10 5 L0 10 Z" fill="#FF9A5C" stroke="#0F1724" stroke-width="1.2"></path></marker></defs>' +
        '<line class="sh" x1="27.5%" y1="78%" x2="22.2%" y2="52%"></line>' +
        '<line class="ar" x1="27.5%" y1="78%" x2="22.2%" y2="52%" marker-end="url(#lmah)"></line></svg>' : '';
      kb = kb.replace('<div class="kb">', '<div class="lmove"><span' + (mv ? '' : ' hidden') + '>' + esc(d.move.tag) + '</span></div><div class="kb' + (mv ? ' lmoved' : '') + '">' + arrow);
      if (mv) { kb = kb.replace('class="wk" data-note="' + d.move.from + '"', 'class="wk was" data-note="' + d.move.from + '"').replace('class="wk lit" data-note="' + d.move.from + '"', 'class="wk was" data-note="' + d.move.from + '"'); }
    }
    h += kb + '</div>'; // play button and keys together, centered in the space above Continue
    return h + bottomHtml('Continue', canContinue('demo'));
  }
  // New first Songs screen: only the real song (the card appears once Cady is done, stopped, or read).
  function songV2CtlHtml(i) {
    var song = ch().songs[i], sg = s.songs['song' + i] || {};
    if (hasSpot(song)) {
      if (s.spotOpen === i) { return ''; }
      return '<button type="button" class="btn lgroove' + (sg.real ? ' ready' : ' primary') + '" data-act="l-spot" data-i="' + i + '">' + ICON.phones + (sg.real ? 'Play it again' : 'Play the song') + '</button>' +
        '<div class="lnext">Plays from Spotify, right here</div>';
    }
    return song.url ? '<a class="btn lgroove' + (sg.real ? ' ready' : ' primary') + '" data-act="l-link" data-i="' + i + '" href="' + song.url + '" target="_blank" rel="noopener">' + ICON.phones + 'Play the song on Spotify ↗</a>' : '';
  }
  function songV2Html(i) {
    var c = ch(), id = 'song' + i, song = c.songs[i], line = c.songsV2[i], v = s.voice, done = !!s.heard[id] || !!s.read[id];
    var st = v === 'speaking' ? 'speaking' : v === 'loading' ? 'loading' : done ? 'heard' : 'idle';
    var label = st === 'speaking' || st === 'loading' ? 'Stop Cady' : st === 'heard' ? 'Hear Cady again' : 'Tap Cady to listen';
    var h = stepLabel(id) + '<h1 class="lh">' + esc(line.headline) + '</h1>';
    h += '<div class="irow lsongrow"><button type="button" class="lnote ismall" data-act="l-speak" data-state="' + st + '" aria-label="' + label + '">' +
      '<svg aria-hidden="true" viewBox="80 20 140 140">' + CADY + '</svg></button>' +
      '<p class="lp lsubline" aria-live="polite">' + (v !== 'idle' || done ? esc(line.intro) : '') + '</p></div>';
    h += '<div class="llinkslot">' + (done ? '' : '<button type="button" class="llink" data-act="l-read">Can’t play sound? Read it instead</button>') + '</div>';
    h += '<div class="grow"></div>';
    if (done) {
      h += '<div class="lcard' + fadeOnce('card-' + id) + '"><div class="lsong"><div class="lsongic">' + ICON.note + '</div><div><div class="lsongt">' + esc(song.title) + '</div><div class="lsongs">' + esc(song.artist) + ' · ' + esc(song.kind) + '</div></div></div>' +
        '<div class="lctl" id="song-ctl">' + songV2CtlHtml(i) + '</div><div class="spot lspot" id="spot-' + i + '"></div></div>'; // Cady says any note about the song
    }
    h += '<div class="grow"></div>';
    return h + bottomHtml('Continue', canContinue(id));
  }
  function songCtlHtml(i) {
    var c = ch(), song = c.songs[i], id = 'song' + i, sg = s.songs[id] || {}, wait = voiceFirst(id);
    var h = s.groove === id
      ? '<button type="button" class="btn ready lgroove" data-act="l-groove" data-i="' + i + '">' + ICON.stop + 'Stop</button>'
      : sg.groove
        ? '<button type="button" class="btn ready lgroove" data-act="l-groove" data-i="' + i + '">' + ICON.again + 'Groove again</button>'
        : '<button type="button" class="btn lgroove' + (wait ? ' ready' : ' primary') + '" data-act="l-groove" data-i="' + i + '">' + ICON.play + 'Play the groove</button>';
    if (!sg.groove) { h += '<div class="lnext">Next: the real recording</div>'; }
    else if (hasSpot(song)) {
      if (s.spotOpen !== i) {
        h += '<button type="button" class="btn lgroove' + (sg.real ? ' ready' : ' primary') + '" data-act="l-spot" data-i="' + i + '">' + ICON.phones + (sg.real ? 'Hear the real song again' : 'Hear the real song') + '</button>' +
          '<div class="lnext">Plays from Spotify, right here</div>';
      }
    } else if (song.url) {
      h += '<a class="btn lgroove' + (sg.real ? ' ready' : ' primary') + '" data-act="l-link" data-i="' + i + '" href="' + song.url + '" target="_blank" rel="noopener">' + ICON.phones + 'Hear the real song on Spotify ↗</a>';
    }
    return h;
  }
  function songHtml(i) {
    var c = ch(), song = c.songs[i], id = 'song' + i;
    var h = stepLabel(id) + '<h1 class="lh">' + (i === 0 ? 'Hear it in a song' : 'One more song') + '</h1>';
    if (i === 0) {
      h += '<div class="lsub">' + (textShown(id) ? '<p>' + esc(c.listenIntro) + '</p>' : '') + '</div>';
      h += '<div class="lguide">' + pillHtml(id) + '</div>';
    } else {
      h += '<p class="lp">Same feeling, another song. Play the groove, then the real recording.</p>';
    }
    h += '<div class="lcard"><div class="lsong"><div class="lsongic">' + ICON.note + '</div><div><div class="lsongt">' + esc(song.title) + '</div><div class="lsongs">' + esc(song.artist) + ' · ' + esc(song.kind) + '</div></div></div>' +
      (song.note ? '<div class="lsongs">' + esc(song.note) + '</div>' : '') +
      '<div class="lctl" id="song-ctl">' + songCtlHtml(i) + '</div>' +
      '<div class="spot lspot" id="spot-' + i + '"></div></div>';
    h += readLink(id);
    h += '<div class="grow"></div>' + keyboardHtml();
    return h + bottomHtml('Continue', canContinue(id));
  }
  function dotsHtml(total, results, current) {
    var h = '<div class="ldots" role="img" aria-label="Round ' + Math.min(current, total) + ' of ' + total + '">';
    for (var k = 0; k < total; k++) {
      h += '<span class="' + (k < results.length ? (results[k] ? 'ok' : 'miss') : (k === current - 1 ? 'now' : '')) + '"></span>';
    }
    return h + '</div>';
  }
  function earHtml() {
    var c = ch(), picked = s.picked, waitVoice = voiceFor('ear') && voiceFirst('ear');
    var h = '<div class="spread lsteprow">' + stepLabel('ear') + dotsHtml(c.rounds, s.results, s.round) + '</div>';
    h += '<h1 class="lh">' + esc(c.earV2 ? c.earV2.prompt : c.choose.prompt) + '</h1>';
    if (c.earV2) {
      // Round 1: small Cady explains the game; the play button and answers appear once she's done (or read).
      var v = s.voice, done = !!s.heard.ear || !!s.read.ear, talk = s.round === 1 && !done;
      // Once she's done, the game takes her place: every round then has the same layout, and nothing jumps while playing.
      if (talk) {
        var st = v === 'speaking' ? 'speaking' : v === 'loading' ? 'loading' : done ? 'heard' : 'idle';
        h += '<div class="irow lsongrow"><button type="button" class="lnote ismall" data-act="l-speak" data-state="' + st + '" aria-label="' + (st === 'speaking' || st === 'loading' ? 'Stop Cady' : 'Hear Cady again') + '">' +
          '<svg aria-hidden="true" viewBox="80 20 140 140">' + CADY + '</svg></button>' +
          '<p class="lp lsubline" aria-live="polite">' + (v !== 'idle' || done ? esc(c.earV2.intro) : '') + '</p></div>';
        h += '<div class="llinkslot">' + (done ? '' : '<button type="button" class="llink" data-act="l-read">Can’t play sound? Read it instead</button>') + '</div>';
        if (!done) { return h + '<div class="grow"></div>' + bottomHtml('Continue', false, null, true, '<button type="button" class="llink lskip" data-act="l-skip">Skip the ear training</button>'); }
      }
      waitVoice = false;
    } else if (voiceFor('ear')) {
      h += '<div class="lsub">' + (textShown('ear') ? '<p>' + esc(c.choose.intro) + '</p>' : '') + '</div><div class="lguide">' + pillHtml('ear') + '</div>';
    }
    if (c.earV2) { h += '<div class="grow"></div>'; } // the game sits in the middle of the free space
    // One fixed-height slot for the play button, the listening circle, the replay button and the keyboard,
    // so the answer cards below never move when it changes.
    h += '<div class="learslot">';
    if (picked) {
      h += keyboardHtml();
    } else {
      h += '<div class="lcenter">' + (s.listening
        ? '<div class="lround listen" role="status" aria-label="Listening">' + ICON.bars + '</div><div class="lroundlbl">Listening…</div>'
        : !s.asked
          ? '<button type="button" class="lround' + (waitVoice ? '' : ' primary') + '" data-act="l-ask" aria-label="Play the chords">' + ICON.play + '</button><div class="lroundlbl' + (waitVoice ? '' : ' on') + '">Play the chords</div>'
          : '<button type="button" class="lround" data-act="l-ask" aria-label="' + esc(c.choose.replay) + '">' + ICON.again + '</button><div class="lroundlbl">' + esc(c.choose.replay) + '</div>') + '</div>';
    }
    h += '</div>';
    h += '<div class="choices' + (c.choose.options.length > 2 ? ' three' : '') + (s.asked && !s.listening && !picked ? ' go' : '') + '">';
    c.choose.options.forEach(function (o) {
      var cls = !picked ? '' : (s.q.q === o.q ? ' right' : (picked === o.q ? ' wrong' : ' dim'));
      h += '<button type="button" class="choice' + cls + '" data-act="l-pick" data-q="' + o.q + '">' + (o.icon ? '<span class="emo' + (o.iconWhite ? ' white' : '') + '" aria-hidden="true">' + o.icon + '</span>' : '') + '<b>' + esc(o.label) + '</b><span>' + esc(o.sub) + '</span></button>';
    });
    h += '</div>';
    if (c.earV2) { h += '<div class="grow"></div>'; }
    if (!picked) {
      var skipEar = '<button type="button" class="llink' + (c.earV2 ? ' lskip' : '') + '" data-act="l-skip">Skip the ear training</button>';
      if (c.earV2) { return h + '<div class="learbottom">' + bottomHtml('Continue', false, null, true, skipEar) + '</div>'; }
      return h + skipEar + bottomHtml('Continue', false, null, true); // has its own "Skip the ear training"
    }
    var good = picked === s.q.q, last = s.round >= c.rounds;
    var words = c.choose.verdict(s.q, good).replace(/^(Correct|Not quite): /, '');
    words = words.charAt(0).toUpperCase() + words.slice(1);
    if (c.earV2) { h += '<div class="learbottom">'; } // same height before and after answering, so nothing above moves
    return h + '<div class="lfeed ' + (good ? 'good' : 'bad') + '" id="lbottom" role="status"><div class="lfrow"><div class="lfic">' + (good ? ICON.check : ICON.cross) + '</div><div><div class="lft">' + (good ? 'Correct!' : 'Not quite') + '</div><div class="lfs">' + esc(words) + '</div></div></div>' +
      '<button type="button" class="lgo on" data-act="l-round">' + (last ? 'Continue' : 'Next round' + ICON.arrow) + '</button></div>' + (c.earV2 ? '</div>' : '');
  }
  function hasPiano() { try { return localStorage.getItem('homekey.hasPiano') === 'yes'; } catch (e) { return false; } }
  function play2Html() {
    var p = ch().play2, v = s.voice, done = !!s.heard.play || !!s.read.play;
    var st = v === 'speaking' ? 'speaking' : v === 'loading' ? 'loading' : done ? 'heard' : 'idle';
    var h = stepLabel('play') + '<h1 class="lh">' + esc(p.title) + '</h1>';
    // While she talks, her full line; once she's done, a short reminder (the tips) takes its place.
    h += '<div class="irow lsongrow"><button type="button" class="lnote ismall" data-act="l-speak" data-state="' + st + '" aria-label="' + (st === 'speaking' || st === 'loading' ? 'Stop Cady' : 'Hear Cady again') + '">' +
      '<svg aria-hidden="true" viewBox="80 20 140 140">' + CADY + '</svg></button>' +
      '<p class="lp lsubline' + (done ? ' short' : '') + '" aria-live="polite">' + (done ? p.reminder : v !== 'idle' ? esc(p.intro) : '') + '</p></div>';
    if (!done) {
      h += '<div class="llinkslot"><button type="button" class="llink" data-act="l-read">Can’t play sound? Read it instead</button></div>';
      return h + '<div class="grow"></div>' + bottomHtml('I played it', false);
    }
    h += '<div class="grow"></div>' + keyboardHtml().replace('<div class="kb">', '<div class="lend" aria-hidden="true"><span>End here</span></div><div class="kb">');
    h += '<p class="lsmall">' + (hasPiano() ? 'Play on your piano, or on these keys.' : 'Play on these keys.') + '</p>';
    h += s.groove === 'play'
      ? '<button type="button" class="btn ready lgroove" data-act="l-groove" data-i="play">' + ICON.stop + 'Stop</button>'
      : '<button type="button" class="btn lgroove' + (s.playGroove ? ' ready' : ' primary') + '" data-act="l-groove" data-i="play">' + (s.playGroove ? ICON.again + 'Play the groove again' : ICON.play + 'Start the groove') + '</button>';
    return h + bottomHtml('I played it', canContinue('play'));
  }
  function playHtml() {
    var p = ch().play2;
    if (p.voice) { return play2Html(); }
    var h = stepLabel('play') + '<h1 class="lh">' + esc(p.title) + '</h1><p class="lp">' + esc(p.text) + '</p>';
    if (p.tips.length) { h += '<div class="ltips"><div class="eyebrow">Tips for a pro sound</div>' + p.tips.map(function (t) { return '<div class="ltip"><span></span><div>' + t + '</div></div>'; }).join('') + '</div>'; }
    h += '<div class="grow"></div>' + (p.endHere === false ? keyboardHtml() : keyboardHtml().replace('<div class="kb">', '<div class="lend" aria-hidden="true"><span>End here</span></div><div class="kb">'));
    h += '<p class="lsmall">No piano nearby? Play on these keys.</p>';
    h += s.groove === 'play'
      ? '<button type="button" class="btn ready lgroove" data-act="l-groove" data-i="play">' + ICON.stop + 'Stop</button>'
      : '<button type="button" class="btn lgroove' + (s.playGroove ? ' ready' : ' primary') + '" data-act="l-groove" data-i="play">' + (s.playGroove ? ICON.again + 'Play the groove again' : ICON.play + 'Start the groove') + '</button>';
    return h + bottomHtml('I played it', canContinue('play'));
  }
  function nextChapter() {
    var list = CONTENT.section1.chapters;
    for (var k = 0; k < list.length - 1; k++) { if (list[k].id === s.id && CONTENT.chapters[list[k + 1].id]) { return list[k + 1]; } }
    return null;
  }
  // While Cady reads the recap, the point she's on lights up, following the clip's own clock.
  var cueTicker = null;
  function followRecapCues() {
    clearInterval(cueTicker);
    var r = ch().recap2, lit = -1;
    cueTicker = setInterval(function () {
      if (!s || cur() !== 'recap') { clearInterval(cueTicker); return; }
      var t = s.voice === 'speaking' ? Voice.clipTime() : -1, k = -1;
      if (t >= 0 && t < r.cuesEnd) { r.cues.forEach(function (c0, j) { if (t >= c0) { k = j; } }); }
      if (k !== lit) { lit = k; document.querySelectorAll('.lrpoint').forEach(function (el, j) { el.classList.toggle('on', j === k); }); }
    }, 100);
  }
  function recap2Html() {
    var c = ch(), r = c.recap2, n = nextChapter(), got = s.results.filter(Boolean).length, v = s.voice, done = !!s.heard.recap || !!s.read.recap;
    var st = v === 'speaking' ? 'speaking' : v === 'loading' ? 'loading' : done ? 'heard' : 'idle';
    var h = stepLabel('recap') + '<h1 class="lh">Chapter ' + esc(s.id) + ' done!</h1>';
    if (s.results.length) { h += '<div class="spread lscore"><div class="lgot">You got ' + got + ' of ' + s.results.length + ' by ear.</div>' + dotsHtml(s.results.length, s.results, 0) + '</div>'; }
    h += '<div class="irow lsongrow lrecaprow"><button type="button" class="lnote ismall" data-act="l-speak" data-state="' + st + '" aria-label="' + (st === 'speaking' || st === 'loading' ? 'Stop Cady' : 'Hear Cady again') + '">' +
      '<svg aria-hidden="true" viewBox="80 20 140 140">' + CADY + '<path d="M140 108 L122 92" stroke="#F5B841" stroke-width="5" stroke-linecap="round"></path></svg></button>' +
      '<p class="lp">' + esc(r.line) + '</p></div>';
    h += '<div class="lcard lrecap"><div class="eyebrow">To remember</div>' + c.recap.map(function (p) { return '<div class="lrpoint"><span></span><div>' + esc(p) + '</div></div>'; }).join('') + '</div>';
    h += '<div class="grow"></div><button type="button" class="llink" data-act="l-again">Do this chapter again</button>';
    return h + (n ? bottomHtml('Next: ' + esc(n.id) + ', ' + esc(n.title), done, 'l-nextch') : bottomHtml('Back to your path', done, 'l-close'));
  }
  function recapHtml() {
    if (ch().recap2) { return recap2Html(); }
    var c = ch(), n = nextChapter(), got = s.results.filter(Boolean).length;
    var h = stepLabel('recap') + '<div class="lwin">' + ICON.cheer + '<div><h1 class="lh">Chapter ' + esc(s.id) + ' done!</h1>' +
      (s.results.length ? '<div class="lgot">You got ' + got + ' of ' + s.results.length + ' by ear.</div>' : '') + '</div></div>';
    if (s.results.length) { h += dotsHtml(s.results.length, s.results, 0); }
    h += '<div class="lcard"><div class="spread"><div class="eyebrow">To remember</div>' + pillHtml('recap', true) + '</div>' +
      c.recap.map(function (r) { return '<div class="ltip"><span></span><div>' + esc(r) + '</div></div>'; }).join('') + '</div>';
    h += '<div class="grow"></div><button type="button" class="llink" data-act="l-again">Do this chapter again</button>';
    return h + (n ? bottomHtml('Next: ' + esc(n.id) + ', ' + esc(n.title), true, 'l-nextch') : bottomHtml('Back to your path', true, 'l-close'));
  }
  function html() {
    var name = cur(), si = songIndex(name);
    var body = name === 'idea' ? ideaHtml() : name === 'demo' ? demoHtml() : v2Song(name) ? songV2Html(si) : si >= 0 ? songHtml(si) : name === 'ear' ? earHtml() : name === 'play' ? playHtml() : recapHtml();
    return '<div class="lesson">' + topHtml() + body + '</div>';
  }
  // Redraws the screen, except where a Spotify player is open: then only its buttons and Continue change.
  function refresh() {
    if (!s || state.view !== 'lesson') { return; }
    var si = songIndex(cur());
    if (si >= 0 && s.spotOpen === si) {
      var ctl = document.getElementById('song-ctl'); if (ctl) { ctl.innerHTML = v2Song(cur()) ? songV2CtlHtml(si) : songCtlHtml(si); }
      var b = document.getElementById('lbottom'); if (b) { b.outerHTML = bottomHtml('Continue', canContinue(cur())); }
      return;
    }
    var y = window.scrollY;
    render();
    window.scrollTo(0, y);
  }

  /* ---------- Taps ---------- */
  function click(act, el) {
    var c = ch(), name = cur();
    if (act === 'l-close') { stopAll(); s = null; go('path'); render(); }
    else if (act === 'l-speak') { try { localStorage.setItem(HINT_KEY, '1'); } catch (e) {} speak(); }
    else if (act === 'l-read') { if (s.voice !== 'idle') { Voice.stop(); s.voice = 'idle'; } s.read[name] = true; refresh(); }
    else if (act === 'l-next') { if (canContinue(name) && s.i < s.list.length - 1) { if (name === 'play') { Progress.complete(s.id); } goTo(s.i + 1); } }
    else if (act === 'l-step') {
      var k = Number(el.getAttribute('data-k'));
      for (var j = 0; j < s.list.length; j++) { if (stepOf(s.list[j]) === k) { goTo(j, true); break; } }
    }
    else if (act === 'l-back') { if (s.i > 0) { goTo(s.i - 1, true); } } // the screen comes back as it was left (ear training starts over)
    else if (act === 'l-skipscreen') { if (s.i < s.list.length - 1) { if (name === 'play') { Progress.complete(s.id); } goTo(s.i + 1); } }
    else if (act === 'l-demo') {
      stopAll(); c.demo(); s.demoPlayed = true; s.demoMoved = false; refresh();
      var mvd = c.demoV2 && c.demoV2.move;
      if (mvd) { timers.push(setTimeout(function () { if (s && cur() === 'demo') { s.demoMoved = true; s.movedAt = Date.now(); refresh(); } }, mvd.at * 1000 + 60)); }
    }
    else if (act === 'l-groove') {
      var gi = el.getAttribute('data-i'), gid = gi === 'play' ? 'play' : 'song' + gi;
      if (s.groove === gid) { stopAll(); if (gid !== 'play') { light([], ''); } refresh(); return; }
      if (s.spotOpen !== null) { Spotify.forget(); s.spotOpen = null; render(); }
      if (gid === 'play') { startGroove('play', c.play2.beats, c.play2.beatDur, 'groove'); }
      else { var sg = c.songs[Number(gi)]; startGroove(gid, sg.beats, sg.beatDur, sg.style || 'groove'); }
    }
    else if (act === 'l-spot') {
      var pi = Number(el.getAttribute('data-i')), sp = c.songs[pi];
      stopAll();
      s.songs['song' + pi] = s.songs['song' + pi] || {}; s.songs['song' + pi].real = true; s.spotOpen = pi;
      refresh();
      var box = document.getElementById('spot-' + pi);
      Spotify.open(box, sp.spotifyId, function () {
        box.innerHTML = '<a class="spotify" href="' + sp.url + '" target="_blank" rel="noopener">Open the real song on Spotify ↗</a>';
      }, sp.startAt);
    }
    else if (act === 'l-link') { var li = Number(el.getAttribute('data-i')); stopAll(); s.songs['song' + li] = s.songs['song' + li] || {}; s.songs['song' + li].real = true; setTimeout(refresh, 300); return 'follow'; }
    else if (act === 'l-ask') { if (!s.picked) { ask(); } else { c.choose.play(s.q); } }
    else if (act === 'l-pick') {
      if (s.picked || !s.asked) { return; }
      s.picked = el.getAttribute('data-q'); s.listening = false;
      s.results.push(s.picked === s.q.q);
      render();
      if (c.earV2) { verdictVoice(s.picked === s.q.q, function () { c.choose.reveal(s.q); }); } else { c.choose.reveal(s.q); }
    }
    else if (act === 'l-round') {
      stopAll();
      if (s.round >= c.rounds) { goTo(s.list.indexOf('play')); return; }
      s.round += 1; state.round = s.round; s.picked = null;
      s.q = drawQuestion(c, s.q);
      state.lit = []; state.caption = '';
      render();
      ask();
    }
    else if (act === 'l-skip') { goTo(s.list.indexOf('play')); }
    else if (act === 'l-again') { start(s.id); }
    else if (act === 'l-nextch' && name === 'recap' && ch().recap2 && !(s.heard.recap || s.read.recap)) { return; }
    else if (act === 'l-nextch') { var nx = nextChapter(); s = null; if (nx) { startChapter(nx.id); } }
  }

  return { scene: NOTE_SCENE, cady: CADY, start: start, html: html, click: click, onStop: onStop, onHush: onHush, refresh: refresh, active: function () { return !!s; }, debug: function () { return s; } };
})();
