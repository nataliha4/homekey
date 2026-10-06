
/* ---------- Sound: synthesized for now; swap this one module for sampled piano later ---------- */
var Sound = (function () {
  var ctx = null, live = [];
  function ac() {
    if (!ctx) { var AC = window.AudioContext || window.webkitAudioContext; ctx = new AC(); }
    if (ctx.state === 'suspended') { ctx.resume(); }
    return ctx;
  }
  function tone(midi, when, dur, vol) {
    var c = ac();
    var f = 440 * Math.pow(2, (midi - 69) / 12);
    var g = c.createGain();
    g.gain.setValueAtTime(0.0001, when);
    g.gain.exponentialRampToValueAtTime(vol, when + 0.015);
    g.gain.exponentialRampToValueAtTime(0.0001, when + dur);
    var o1 = c.createOscillator(); o1.type = 'triangle'; o1.frequency.value = f;
    var o2 = c.createOscillator(); o2.type = 'sine'; o2.frequency.value = f * 2;
    var g2 = c.createGain(); g2.gain.value = 0.25;
    o1.connect(g); o2.connect(g2); g2.connect(g); g.connect(c.destination);
    o1.start(when); o2.start(when);
    o1.stop(when + dur + 0.05); o2.stop(when + dur + 0.05);
    live.push(o1, o2);
    if (live.length > 600) { live = live.slice(-300); }
  }
  function stop() {
    live.forEach(function (o) { try { o.stop(); } catch (e) {} });
    live = [];
  }
  return {
    stop: stop,
    note: function (midi) { try { tone(midi, ac().currentTime + 0.01, 1.2, 0.25); } catch (e) {} },
    chord: function (notes, dur) {
      try { stop(); var t = ac().currentTime + 0.03; notes.forEach(function (n, i) { tone(n, t + i * 0.012, dur || 1.6, 0.22); }); } catch (e) {}
    },
    // beats: [{notes, bass}]; style "groove" = bass then chord, "block" = bass and chord together
    beats: function (beats, beatDur, style) {
      try {
        stop();
        var t0 = ac().currentTime + 0.05;
        beats.forEach(function (b, i) {
          var t = t0 + i * beatDur;
          if (style === 'groove') {
            tone(b.bass, t, beatDur * 0.9, 0.28);
            b.notes.forEach(function (n) { tone(n, t + beatDur / 2, 0.3, 0.16); });
          } else if (style === 'waltz') {
            // Three beats to the bar: bass on beat one, the chord on beats two and three.
            if (i % 3 === 0) { tone(b.bass, t, beatDur * 2.6, 0.3); }
            else { b.notes.forEach(function (n) { tone(n, t, 0.3, 0.16); }); }
          } else {
            tone(b.bass, t, beatDur * 1.1, 0.2);
            b.notes.forEach(function (n, k) { tone(n, t + k * 0.01, beatDur * 1.15, 0.2); });
          }
        });
      } catch (e) {}
    }
  };
})();

/* ---------- Progress: saved on this device ---------- */
var Progress = (function () {
  var KEY = 'homekey.progress.v2';
  function load() {
    try { var p = JSON.parse(localStorage.getItem(KEY)); if (p && Array.isArray(p.done)) { return p; } } catch (e) {}
    return { done: [] };
  }
  var data = load();
  function save() { try { localStorage.setItem(KEY, JSON.stringify(data)); } catch (e) {} }
  return {
    isDone: function (id) { return data.done.indexOf(id) >= 0; },
    count: function () { return data.done.length; },
    complete: function (id) { if (data.done.indexOf(id) < 0) { data.done.push(id); save(); } },
    reset: function () { data = { done: [] }; save(); }
  };
})();

/* ---------- Playback with the keyboard lighting up in time ---------- */
var timers = [];
/* ---------- Voice: the character reads the explanation aloud ----------
   Stand-in: the device's built-in voice. Swap speak() for recorded audio later. */
var Voice = (function () {
  var synth = null;
  try { if ('speechSynthesis' in window && typeof SpeechSynthesisUtterance !== 'undefined') { synth = window.speechSynthesis; } } catch (e) {}
  var current = null; // keeps the utterance alive while it speaks
  var clip = null;    // the recorded voice file being played, if any
  var token = 0;
  // Devices ship several voices of very different quality. Prefer the natural-sounding ones by name.
  var NICE = [/natural/i, /premium/i, /enhanced/i, /^Samantha/i, /^Ava/i, /^Allison/i, /Google US English/i, /Aria/i, /Jenny/i];
  function pickVoice() {
    try {
      var all = synth.getVoices() || [];
      var us = all.filter(function (v) { return /^en[-_]US/i.test(v.lang); });
      var en = all.filter(function (v) { return /^en/i.test(v.lang); });
      for (var i = 0; i < NICE.length; i++) {
        var hit = us.filter(function (v) { return NICE[i].test(v.name); })[0];
        if (hit) { return hit; }
      }
      return us.filter(function (v) { return v.default; })[0] || us[0] || en[0] || null;
    } catch (e) { return null; }
  }
  // Ask for the voice list early, so the first tap doesn't have to wait for it.
  try { if (synth) { synth.getVoices(); if (synth.addEventListener) { synth.addEventListener('voiceschanged', function () { synth.getVoices(); }); } } } catch (e) {}
  return {
    supported: !!synth,
    speak: function (text, onStart, onDone) {
      if (!synth) { return; }
      var mine = ++token;
      try {
        if (synth.speaking || synth.pending) { synth.cancel(); }
        var u = new SpeechSynthesisUtterance(text);
        var v = pickVoice(); if (v) { u.voice = v; }
        u.lang = 'en-US'; u.rate = 1; u.pitch = 1.1;
        u.onstart = function () { if (mine === token) { onStart(); } };
        u.onend = u.onerror = function () { if (mine === token) { current = null; onDone(); } };
        current = u;
        synth.speak(u);
      } catch (e) { onDone(); }
    },
    // Plays a recorded voice file; if it cannot load or play, falls back to the built-in voice.
    play: function (url, text, onStart, onDone) {
      var self = this, mine = ++token, fellBack = false;
      var fallback = function () {
        if (fellBack || mine !== token) { return; }
        fellBack = true; clip = null;
        if (synth) { self.speak(text, onStart, onDone); } else { onDone(); }
      };
      try {
        clip = new Audio(url);
        clip.onplaying = function () { if (mine === token) { onStart(); } };
        clip.onended = function () { if (mine === token) { clip = null; onDone(); } };
        clip.onerror = fallback;
        var p = clip.play();
        if (p && p.catch) { p.catch(fallback); }
      } catch (e) { fallback(); }
    },
    stop: function () {
      token += 1; current = null;
      try { if (clip) { clip.onerror = null; clip.pause(); clip = null; } } catch (e) {}
      try { if (synth) { synth.cancel(); } } catch (e) {}
    }
  };
})();
function setVoice(v) {
  state.voice = v;
  var el = document.getElementById('speak');
  if (el) {
    el.setAttribute('data-voice', v);
    el.setAttribute('aria-label', v === 'speaking' || v === 'loading' ? 'Stop reading' : 'Read this aloud');
  }
}
function hushVoice() {
  Voice.stop();
  if (typeof state !== 'undefined' && (state.voice === 'speaking' || state.voice === 'loading')) { setVoice('idle'); }
}

function stopAll() {
  timers.forEach(function (t) { clearTimeout(t); });
  timers = [];
  Sound.stop();
  hushVoice();
}
var lastPlayLen = 0;   // seconds of sound started by the latest playBeats call
var swapTimer = null;  // trades the looks of the demo and "Next" buttons after three plays
var nextTimer = null;  // highlights "Next" on the Explain step
var NEXT_PAUSE = 4;    // seconds of quiet after the first demo before "Next" is highlighted
function playBeats(beats, beatDur, style) {
  stopAll();
  lastPlayLen = beats.length * beatDur;
  Sound.beats(beats, beatDur, style);
  beats.forEach(function (b, i) {
    if (i > 0 && beats[i - 1].caption === b.caption) { return; }
    timers.push(setTimeout(function () { light(b.notes, b.caption); }, i * beatDur * 1000 + 40));
  });
}
function repeat(chord, n) { var out = []; for (var i = 0; i < n; i++) { out.push(chord); } return out; }
function pick(list) { return list[Math.floor(Math.random() * list.length)]; }

/* ---------- Content: lessons live here, separate from the app code below ---------- */
var C_MAJOR = { notes: [60, 64, 67], bass: 48, caption: 'Home: C major (C, E, G)' };
var C_MINOR = { notes: [60, 63, 67], bass: 48, caption: 'Home: C minor' };
var G_DOOR = { notes: [67, 71, 74], bass: 43, caption: 'The Door: G major (G, B, D)' };
var G_DOOR7 = { notes: [65, 67, 71, 74], bass: 43, caption: 'The Door: G7 (G, B, D and F)' };
var F_GARDEN = { notes: [65, 69, 72], bass: 41, caption: 'The Garden: F major (F, A, C)' };
var F_GARDEN_MINOR = { notes: [65, 68, 72], bass: 41, caption: 'The Garden: F minor' };
var A_BED = { notes: [60, 64, 69], bass: 45, caption: 'The Bedroom: A minor (A, C, E)' };
var NOTE_NAMES = { 60: 'C', 62: 'D', 64: 'E', 65: 'F', 67: 'G', 69: 'A' };

var CONTENT = {
  totalChapters: 53,
  section1: {
    title: 'Home Sweet Home',
    short: 'Home',
    blurb: 'From one chord to four.',
    chapters: [
      { id: '1a', title: 'One chord: home', sub: 'A whole song on one chord' },
      { id: '1b', title: 'Home can be dark', sub: 'Major and minor' },
      { id: '1c', title: 'Two chords: the door', sub: 'Home (I) and the door (V)' },
      { id: '1d', title: 'The door, easy to spot', sub: 'The V7 chord' },
      { id: '1e', title: 'Three chords: the garden', sub: 'I, IV and V7' },
      { id: '1f', title: 'Four chords: the bedroom', sub: 'The vi chord, in a major home' },
      { id: '1g', title: 'The door, without its seventh', sub: 'Plain V returns' },
      { id: '1h', title: 'The four-chord loop', sub: 'I, V, vi, IV' },
      { id: '1i', title: 'The same four, reordered', sub: 'I, vi, IV, V' }
    ]
  },
  comingUp: [
    ['2', 'Every Scale Note Gets a Chord', 5],
    ['3', 'First Steps Out the Door', 2],
    ['4', 'Borrowing from the Minor Side', 3],
    ['5', 'Visiting Other Keys', 3],
    ['6', 'The Blues', 2],
    ['7', 'Chromatic Shortcuts', 6],
    ['8', 'Decorations', 7],
    ['9', 'The Western Harmony Timeline', 13],
    ['10', 'Wrapping Up', 3]
  ],
  chapters: {}
};

CONTENT.chapters['1a'] = {
  title: 'One chord: home',
  scene: '<svg role="img" aria-label="An eighth note with a face sitting on a couch" viewBox="0 0 320 220" width="100%" style="display: block"><rect x="236" y="36" width="44" height="34" rx="3" fill="none" stroke="#4A5E7E" stroke-width="3"></rect><path d="M244 62 L254 50 L262 58 L268 52 L274 62 Z" fill="#4A5E7E"></path><line x1="20" y1="190" x2="300" y2="190" stroke="#2B3A52" stroke-width="3" stroke-linecap="round"></line><rect x="66" y="84" width="188" height="76" rx="18" fill="#2B3A52"></rect><rect x="50" y="138" width="220" height="40" rx="14" fill="#3A4C69"></rect><rect x="40" y="114" width="34" height="66" rx="14" fill="#44587A"></rect><rect x="246" y="114" width="34" height="66" rx="14" fill="#44587A"></rect><rect x="62" y="178" width="10" height="12" rx="2" fill="#2B3A52"></rect><rect x="248" y="178" width="10" height="12" rx="2" fill="#2B3A52"></rect><line x1="182" y1="112" x2="182" y2="40" stroke="#F5B841" stroke-width="5" stroke-linecap="round"></line><path d="M182 40 C184 58 206 62 200 86 C200 72 190 66 182 64 Z" fill="#F5B841" stroke="#F5B841" stroke-width="2" stroke-linejoin="round"></path><ellipse cx="160" cy="120" rx="27" ry="21" transform="rotate(-18 160 120)" fill="#F5B841"></ellipse><circle cx="151" cy="116" r="2.8" fill="#1A1300"></circle><circle cx="166" cy="112" r="2.8" fill="#1A1300"></circle><path class="smile" d="M152 126 Q161 133 171 123" fill="none" stroke="#1A1300" stroke-width="2.4" stroke-linecap="round"></path><ellipse class="mouth" cx="161" cy="127" rx="5" ry="4" fill="#1A1300" transform="rotate(-18 161 127)"></ellipse><path d="M150 139 L141 150 L133 150" fill="none" stroke="#F5B841" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"></path><path d="M168 139 L162 151 L154 151" fill="none" stroke="#F5B841" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"></path></svg>',
  // Placeholder text, to be rewritten by Troy in his own voice.
  headline: 'Every song has a home.',
  // The character can read the explanation aloud: where its speech bubble sits in the scene.
  voice: { cx: 80, cy: 68, tail: 'M112 84 L142 106 L98 92 Z', audio: 'voice-1a.mp3' },
  explain: [
    'Home is the one chord where the music feels at rest. Some songs never leave it.',
    'Listen for that "we\'re home" feeling, because everything else in harmony is about leaving home and coming back.'
  ],
  demoLabel: 'Hear a home chord',
  demo: function () { light(C_MAJOR.notes, 'C major: C, E, G'); Sound.chord(C_MAJOR.notes, 2); },
  toListen: 'Next: listen to two songs',
  listenIntro: 'Now hear it in real songs. These two stay on one chord, from start to finish. Play each groove, and listen for the feeling of staying home.',
  // The character reads the Listen instruction aloud, from a small strip at the top of the step.
  listenVoice: { audio: 'voice-1a-listen.mp3' },
  songs: [
    // To confirm with Troy: this recording seems to stay on one plain major chord.
    { title: 'Are You Sleeping? (Fr\u00e8re Jacques)', artist: 'Traditional', kind: 'Major home',
      url: 'https://open.spotify.com/track/67m0guhBCj1j9MTVSPus15',
      beats: repeat({ notes: [60, 64, 67], bass: 48, caption: 'One chord the whole way: C major' }, 8), beatDur: 0.75 },
    { title: 'Coconut', artist: 'Harry Nilsson', kind: 'Major home',
      note: 'You may hear one extra, spicy note in this chord. Ignore it for now: we\'ll meet it in chapter 1d.',
      url: 'https://open.spotify.com/search/Coconut%20Harry%20Nilsson',
      beats: repeat({ notes: [60, 64, 67, 70], bass: 48, caption: 'One chord the whole way: C7 (major)' }, 8), beatDur: 0.75 }
  ],
  rounds: 10,
  choose: {
    prompt: 'Listen to four chords. Did the music stay home, or leave?',
    // With a voice guide, round 1 waits: the character can explain the game before the chords play.
    intro: 'Now test your ear. You\'ll hear four chords. Did the music stay home, or did it leave? Tap your answer. There are ten rounds, so take your time.',
    voice: { audio: 'voice-1a-choose.mp3' },
    replay: 'Hear the chords again',
    options: [{ q: 'stay', label: 'Stayed home', sub: 'one chord' }, { q: 'leave', label: 'Left home', sub: 'the chord changed' }],
    make: function (prev) {
      var roots = [60, 62, 65, 67];
      var root = pick(roots);
      if (prev && prev.root === root) { root = roots[(roots.indexOf(root) + 1) % roots.length]; }
      var home = { notes: [root, root + 4, root + 7], bass: root - 12, caption: 'Home' };
      var up = Math.random() < 0.5 ? 5 : 7;
      var away = { notes: [root + up - 12, root + up - 8, root + up - 5], bass: root + up - 24, caption: 'Away from home' };
      var q = Math.random() < 0.5 ? 'stay' : 'leave';
      var shape = q === 'stay' ? 'HHHH' : pick(['HHAH', 'HAAH', 'HAHH', 'HHAA']);
      var beats = shape.split('').map(function (c) { return c === 'H' ? home : away; });
      return { root: root, q: q, beats: beats };
    },
    play: function (cur) { stopAll(); Sound.beats(cur.beats, 0.8, 'block'); },
    reveal: function (cur) { playBeats(cur.beats, 0.8, 'block'); },
    verdict: function (cur, good) {
      return (good ? 'Correct: ' : 'Not quite: ') + (cur.q === 'stay' ? 'the music stayed home.' : 'the music left home.') + ' Watch the keyboard as it plays again.';
    }
  },
  play: {
    paras: [
      'Now you. Find <strong>C major</strong> on your piano: C, E and G, as lit on the keyboard below.',
      'Start the groove and play the chord along with it, in any rhythm you like.'
    ],
    start: function () { playBeats(repeat(C_MAJOR, 8), 0.75, 'groove'); },
    ready: function () { light(C_MAJOR.notes, 'C major: C, E, G'); }
  },
  recap: [
    'A song can stay on one chord. That chord is home.',
    'Home is where the music feels at rest.',
    'When the chord changes, the music has left home.'
  ]
};

CONTENT.chapters['1b'] = {
  title: 'Home can be dark',
  scene: '<svg role="img" aria-label="An eighth note on a couch between two windows: a sunny one and a moonlit one" viewBox="0 0 320 220" width="100%" style="display: block"><rect x="40" y="30" width="44" height="40" rx="3" fill="#1E4A50" stroke="#4A5E7E" stroke-width="3"></rect><circle cx="62" cy="50" r="9" fill="#F5B841"></circle><rect x="236" y="30" width="44" height="40" rx="3" fill="#0B111B" stroke="#4A5E7E" stroke-width="3"></rect><circle cx="258" cy="50" r="9" fill="#F4F1EA"></circle><circle cx="262" cy="47" r="8" fill="#0B111B"></circle><line x1="20" y1="190" x2="300" y2="190" stroke="#2B3A52" stroke-width="3" stroke-linecap="round"></line><rect x="66" y="84" width="188" height="76" rx="18" fill="#2B3A52"></rect><rect x="50" y="138" width="220" height="40" rx="14" fill="#3A4C69"></rect><rect x="40" y="114" width="34" height="66" rx="14" fill="#44587A"></rect><rect x="246" y="114" width="34" height="66" rx="14" fill="#44587A"></rect><rect x="62" y="178" width="10" height="12" rx="2" fill="#2B3A52"></rect><rect x="248" y="178" width="10" height="12" rx="2" fill="#2B3A52"></rect><line x1="182" y1="112" x2="182" y2="40" stroke="#F5B841" stroke-width="5" stroke-linecap="round"></line><path d="M182 40 C184 58 206 62 200 86 C200 72 190 66 182 64 Z" fill="#F5B841" stroke="#F5B841" stroke-width="2" stroke-linejoin="round"></path><ellipse cx="160" cy="120" rx="27" ry="21" transform="rotate(-18 160 120)" fill="#F5B841"></ellipse><circle cx="151" cy="116" r="2.8" fill="#1A1300"></circle><circle cx="166" cy="112" r="2.8" fill="#1A1300"></circle><path d="M152 126 Q161 133 171 123" fill="none" stroke="#1A1300" stroke-width="2.4" stroke-linecap="round"></path><path d="M150 139 L141 150 L133 150" fill="none" stroke="#F5B841" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"></path><path d="M168 139 L162 151 L154 151" fill="none" stroke="#F5B841" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"></path></svg>',
  // Placeholder text, to be rewritten by Troy in his own voice.
  headline: 'Home can be bright or dark.',
  explain: [
    'A home chord comes in two colors. Major sounds bright. Minor sounds dark.',
    'Only one note differs between them: the middle one. Watch it move on the keyboard.'
  ],
  demoLabel: 'Hear bright, then dark',
  demo: function () { playBeats([{ notes: C_MAJOR.notes, bass: 48, caption: 'C major: C, E, G' }, { notes: C_MINOR.notes, bass: 48, caption: 'C minor: C, E flat, G' }], 1.6, 'block'); },
  toListen: 'Next: listen to two songs',
  listenIntro: 'Two songs with a dark home. Each one stays on a single minor chord.',
  songs: [
    { title: 'Carol of the Bells', artist: 'Mykola Leontovych', kind: 'Minor home',
      url: 'https://open.spotify.com/search/Carol%20of%20the%20Bells',
      beats: repeat({ notes: [60, 63, 67], bass: 48, caption: 'Circling one chord: C minor' }, 12), beatDur: 0.75, style: 'waltz' },
    // To confirm against a recording: widely described as a one-chord song (C minor 7).
    { title: 'Chain of Fools', artist: 'Aretha Franklin', kind: 'Minor home',
      note: 'This chord also carries one extra note. Ignore it for now.',
      url: 'https://open.spotify.com/search/Chain%20of%20Fools%20Aretha%20Franklin',
      beats: repeat({ notes: [60, 63, 67, 70], bass: 48, caption: 'One chord the whole way: C minor 7' }, 8), beatDur: 0.75 }
  ],
  rounds: 10,
  choose: {
    prompt: 'Listen to the chord. Is it major or minor?',
    replay: 'Hear the chord again',
    options: [{ q: 'major', label: 'Major', sub: 'bright' }, { q: 'minor', label: 'Minor', sub: 'dark' }],
    make: function (prev) {
      var roots = [60, 62, 64, 65, 67, 69];
      var root = pick(roots);
      if (prev && prev.root === root) { root = roots[(roots.indexOf(root) + 1) % roots.length]; }
      var q = Math.random() < 0.5 ? 'major' : 'minor';
      return { root: root, q: q, name: NOTE_NAMES[root] + ' ' + q, notes: [root, root + (q === 'major' ? 4 : 3), root + 7] };
    },
    play: function (cur) { Sound.chord(cur.notes); },
    reveal: function (cur) { light(cur.notes, 'That was ' + cur.name); Sound.chord(cur.notes); },
    verdict: function (cur, good) { return (good ? 'Correct: ' : 'Not quite: that was ') + cur.name + '.'; }
  },
  play: {
    paras: [
      'Now you. Start from C major (C, E, G), then lower the middle note to the black key on its left. That is <strong>C minor</strong>.',
      'Start the groove and play C minor along with it, in any rhythm you like.'
    ],
    start: function () { playBeats(repeat(C_MINOR, 8), 0.75, 'groove'); },
    ready: function () { light(C_MINOR.notes, 'C minor: C, E flat, G'); }
  },
  recap: [
    'Home can be major or minor.',
    'Major sounds bright. Minor sounds dark.',
    'Only one note differs between them: the middle one.'
  ]
};

CONTENT.chapters['1c'] = {
  title: 'Two chords: the door',
  scene: '<svg role="img" aria-label="An eighth note with a face opening a door and looking outside" viewBox="0 0 320 220" width="100%" style="display: block"><line x1="20" y1="190" x2="300" y2="190" stroke="#2B3A52" stroke-width="3" stroke-linecap="round"></line><rect x="176" y="34" width="92" height="156" fill="#12333A"></rect><circle cx="246" cy="66" r="9" fill="#F4F1EA"></circle><path d="M222 190 L222 150 Q240 132 268 146 L268 190 Z" fill="#1E4A50"></path><path d="M222 190 L268 190 L296 212 L196 212 Z" fill="#F5B841" opacity="0.3"></path><rect x="176" y="34" width="92" height="156" fill="none" stroke="#4A5E7E" stroke-width="5"></rect><path d="M176 34 L222 46 L222 202 L176 190 Z" fill="#3A4C69" stroke="#4A5E7E" stroke-width="3" stroke-linejoin="round"></path><circle cx="208" cy="141" r="4" fill="#F4F1EA"></circle><line x1="150" y1="142" x2="150" y2="68" stroke="#F5B841" stroke-width="5" stroke-linecap="round"></line><path d="M150 68 C152 86 174 90 168 114 C168 100 158 94 150 92 Z" fill="#F5B841" stroke="#F5B841" stroke-width="2" stroke-linejoin="round"></path><ellipse cx="128" cy="150" rx="27" ry="21" transform="rotate(-18 128 150)" fill="#F5B841"></ellipse><circle cx="126" cy="146" r="2.8" fill="#1A1300"></circle><circle cx="141" cy="142" r="2.8" fill="#1A1300"></circle><path d="M124 157 Q133 163 142 154" fill="none" stroke="#1A1300" stroke-width="2.4" stroke-linecap="round"></path><path d="M152 152 L204 142" fill="none" stroke="#F5B841" stroke-width="5" stroke-linecap="round"></path><path d="M120 169 L118 188 L110 188" fill="none" stroke="#F5B841" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"></path><path d="M138 168 L140 188 L148 188" fill="none" stroke="#F5B841" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"></path></svg>',
  // Placeholder text, to be rewritten by Troy in his own voice.
  explain: [
    'Now let\'s open the door a little and see what\'s out there. The second chord is the door: when the music stands in the doorway, it sounds unfinished and wants to turn back inside.',
    'Two-chord songs do just this, over and over: home, the door, home. Musicians number these chords I and V.'
  ],
  demoLabel: 'Hear home, the door, home',
  demo: function () { playBeats([C_MAJOR, G_DOOR, C_MAJOR], 1.1, 'block'); },
  toListen: 'Next: listen to two songs',
  listenIntro: 'Two songs built on home and the door. Watch the keyboard: it shows the moment the chord changes.',
  songs: [
    { title: 'Jambalaya', artist: 'Hank Williams', kind: 'Major',
      url: 'https://open.spotify.com/search/Jambalaya%20Hank%20Williams',
      beats: [].concat(repeat(C_MAJOR, 4), repeat(G_DOOR, 8), repeat(C_MAJOR, 4)), beatDur: 0.75 },
    // To confirm against a recording: usually played on just these two chords.
    { title: 'Joshua Fit the Battle of Jericho', artist: 'Traditional', kind: 'Minor',
      url: 'https://open.spotify.com/search/Joshua%20Fit%20the%20Battle%20of%20Jericho',
      beats: [].concat(repeat(C_MINOR, 4), repeat(G_DOOR, 4), repeat(C_MINOR, 4), repeat(G_DOOR, 2), repeat(C_MINOR, 2)), beatDur: 0.75 }
  ],
  rounds: 10,
  choose: {
    prompt: 'Listen to four chords. Does the music end at home, or at the door?',
    replay: 'Hear the chords again',
    options: [{ q: 'home', label: 'Home (I)', sub: 'at rest' }, { q: 'door', label: 'The Door (V)', sub: 'unfinished' }],
    make: function (prev) {
      var keys = [{ root: 60, door: 67 }, { root: 65, door: 60 }, { root: 67, door: 62 }, { root: 62, door: 69 }];
      var key = pick(keys);
      if (prev && prev.root === key.root) { key = keys[(keys.indexOf(key) + 1) % keys.length]; }
      var minor = Math.random() < 0.4;
      var home = { notes: [key.root, key.root + (minor ? 3 : 4), key.root + 7], bass: key.root - 12,
        caption: 'Home: ' + NOTE_NAMES[key.root] + (minor ? ' minor' : ' major') };
      var door = { notes: [key.door, key.door + 4, key.door + 7], bass: key.door - 12,
        caption: 'The Door: ' + NOTE_NAMES[key.door] + ' major' };
      var q = Math.random() < 0.5 ? 'home' : 'door';
      var shape = q === 'home' ? pick(['HDDH', 'HHDH', 'HDHH']) : pick(['HHHD', 'HDHD', 'HHDD']);
      var beats = shape.split('').map(function (c) { return c === 'H' ? home : door; });
      return { root: key.root, q: q, beats: beats };
    },
    play: function (cur) { stopAll(); Sound.beats(cur.beats, 0.8, 'block'); },
    reveal: function (cur) { playBeats(cur.beats, 0.8, 'block'); },
    verdict: function (cur, good) {
      return (good ? 'Correct: ' : 'Not quite: ') + (cur.q === 'home' ? 'it ended at home.' : 'it ended at the door.') + ' Watch the keyboard as it plays again.';
    }
  },
  play: {
    paras: [
      'Now you. Find two chords on your piano: <strong>C major</strong> (C, E, G) for home and <strong>G major</strong> (G, B, D) for the door.',
      'The groove goes home, home, door, home. Change chords when the keyboard does.'
    ],
    start: function () {
      var bar = [].concat(repeat(C_MAJOR, 4), repeat(C_MAJOR, 4), repeat(G_DOOR, 4), repeat(C_MAJOR, 4));
      playBeats(bar.concat(bar), 0.75, 'groove');
    },
    ready: function () { light(C_MAJOR.notes, C_MAJOR.caption); }
  },
  recap: [
    'The V chord is the door: it sounds unfinished and pulls toward home.',
    'Two-chord songs move between home (I) and the door (V).',
    'Minor songs use the same door.'
  ]
};

CONTENT.chapters['1d'] = {
  title: 'The door, easy to spot',
  scene: '<svg role="img" aria-label="An eighth note with a face switching on a lamp above a slightly open door" viewBox="0 0 320 220" width="100%" style="display: block"><line x1="20" y1="190" x2="300" y2="190" stroke="#2B3A52" stroke-width="3" stroke-linecap="round"></line><rect x="196" y="60" width="88" height="130" fill="#12333A"></rect><circle cx="264" cy="88" r="8" fill="#F4F1EA"></circle><path d="M238 190 L238 156 Q256 140 284 152 L284 190 Z" fill="#1E4A50"></path><path d="M238 190 L284 190 L308 212 L214 212 Z" fill="#F5B841" opacity="0.3"></path><rect x="196" y="60" width="88" height="130" fill="none" stroke="#4A5E7E" stroke-width="5"></rect><path d="M196 60 L238 72 L238 202 L196 190 Z" fill="#4E6490" stroke="#6C83AE" stroke-width="3" stroke-linejoin="round"></path><circle cx="228" cy="138" r="4" fill="#F4F1EA"></circle><path d="M226 42 Q240 24 254 42 Z" fill="#4A5E7E"></path><circle cx="240" cy="46" r="8" fill="#F5B841"></circle><g stroke="#F5B841" stroke-width="3" stroke-linecap="round"><line x1="222" y1="46" x2="213" y2="46"></line><line x1="258" y1="46" x2="267" y2="46"></line><line x1="226" y1="34" x2="220" y2="28"></line><line x1="254" y1="34" x2="260" y2="28"></line></g><rect x="161" y="106" width="14" height="22" rx="3" fill="none" stroke="#4A5E7E" stroke-width="3"></rect><rect x="165" y="111" width="6" height="12" rx="2" fill="#F4F1EA"></rect><line x1="132" y1="142" x2="132" y2="68" stroke="#F5B841" stroke-width="5" stroke-linecap="round"></line><path d="M132 68 C134 86 156 90 150 114 C150 100 140 94 132 92 Z" fill="#F5B841" stroke="#F5B841" stroke-width="2" stroke-linejoin="round"></path><ellipse cx="110" cy="150" rx="27" ry="21" transform="rotate(-18 110 150)" fill="#F5B841"></ellipse><circle cx="108" cy="146" r="2.8" fill="#1A1300"></circle><circle cx="123" cy="142" r="2.8" fill="#1A1300"></circle><path d="M106 157 Q115 163 124 154" fill="none" stroke="#1A1300" stroke-width="2.4" stroke-linecap="round"></path><path d="M134 150 L164 124" fill="none" stroke="#F5B841" stroke-width="5" stroke-linecap="round"></path><path d="M102 169 L100 188 L92 188" fill="none" stroke="#F5B841" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"></path><path d="M120 168 L122 188 L130 188" fill="none" stroke="#F5B841" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"></path></svg>',
  // Placeholder text, to be rewritten by Troy in his own voice.
  explain: [
    'You may have noticed that the door was sometimes hard to tell from home. Both are plain three-note chords, so only the context gives the door away.',
    'Musicians know this too. They often add one more note on top of the V chord, which makes it V7. That fourth note pulls toward home much more strongly, so the door becomes hard to miss.'
  ],
  demoLabel: 'Hear the plain door, then the seventh',
  demo: function () { playBeats([G_DOOR, G_DOOR7, C_MAJOR], 1.2, 'block'); },
  toListen: 'Next: listen to two songs',
  listenIntro: 'The same two songs, now with the seventh on the door. Listen to how much harder it pulls toward home.',
  songs: [
    { title: 'Jambalaya', artist: 'Hank Williams', kind: 'Major',
      url: 'https://open.spotify.com/search/Jambalaya%20Hank%20Williams',
      beats: [].concat(repeat(C_MAJOR, 4), repeat(G_DOOR7, 8), repeat(C_MAJOR, 4)), beatDur: 0.75 },
    // To confirm against a recording: usually played on just these two chords.
    { title: 'Joshua Fit the Battle of Jericho', artist: 'Traditional', kind: 'Minor',
      url: 'https://open.spotify.com/search/Joshua%20Fit%20the%20Battle%20of%20Jericho',
      beats: [].concat(repeat(C_MINOR, 4), repeat(G_DOOR7, 4), repeat(C_MINOR, 4), repeat(G_DOOR7, 2), repeat(C_MINOR, 2)), beatDur: 0.75 }
  ],
  rounds: 10,
  choose: {
    prompt: 'Listen to one chord. Is it plain, or does it have the seventh?',
    replay: 'Hear the chord again',
    options: [{ q: 'plain', label: 'Plain', sub: 'three notes' }, { q: 'seventh', label: 'With the 7th', sub: 'four notes, more pull' }],
    make: function (prev) {
      var roots = [60, 62, 64, 65, 67, 69];
      var root = pick(roots);
      if (prev && prev.root === root) { root = roots[(roots.indexOf(root) + 1) % roots.length]; }
      var q = Math.random() < 0.5 ? 'plain' : 'seventh';
      var notes = [root, root + 4, root + 7];
      if (q === 'seventh') { notes = root + 10 <= 76 ? notes.concat([root + 10]) : [root - 2].concat(notes); }
      return { root: root, q: q, notes: notes, name: NOTE_NAMES[root] + (q === 'seventh' ? '7, with the seventh' : ' major, a plain chord') };
    },
    play: function (cur) { Sound.chord(cur.notes); },
    reveal: function (cur) { light(cur.notes, 'That was ' + cur.name); Sound.chord(cur.notes); },
    verdict: function (cur, good) { return (good ? 'Correct: ' : 'Not quite: ') + 'that was ' + cur.name + '.'; }
  },
  play: {
    paras: [
      'Now you. Find <strong>G7</strong> on your piano: G, B and D, plus F. The keyboard shows the F just below the G, where it is easy to reach.',
      'The groove goes home, home, door, home, as before. Hear how G7 leans back toward C.'
    ],
    start: function () {
      var bar = [].concat(repeat(C_MAJOR, 4), repeat(C_MAJOR, 4), repeat(G_DOOR7, 4), repeat(C_MAJOR, 4));
      playBeats(bar.concat(bar), 0.75, 'groove');
    },
    ready: function () { light(G_DOOR7.notes, G_DOOR7.caption); }
  },
  recap: [
    'V7 is the V chord with one more note on top: the seventh.',
    'That note makes the door pull toward home much more strongly.',
    'V7 is far easier to recognize by ear than a plain V.'
  ]
};

CONTENT.chapters['1e'] = {
  title: 'Three chords: the garden',
  scene: '<svg role="img" aria-label="An eighth note with a face standing in the garden outside the house, next to a tree and flowers" viewBox="0 0 320 220" width="100%" style="display: block"><circle cx="206" cy="40" r="9" fill="#F4F1EA"></circle><rect x="22" y="78" width="84" height="100" fill="#2B3A52"></rect><path d="M12 80 L64 40 L116 80 Z" fill="#3A4C69"></path><rect x="50" y="112" width="30" height="62" fill="#F5B841" opacity="0.6"></rect><rect x="50" y="112" width="30" height="62" fill="none" stroke="#4A5E7E" stroke-width="4"></rect><rect x="255" y="112" width="10" height="62" fill="#4A5E7E"></rect><circle cx="260" cy="96" r="34" fill="#2F6F6A"></circle><path d="M0 178 Q160 160 320 178 L320 220 L0 220 Z" fill="#1E4A50"></path><g stroke="#6AD1C7" stroke-width="3" stroke-linecap="round"><line x1="204" y1="186" x2="204" y2="174"></line><line x1="222" y1="192" x2="222" y2="180"></line><line x1="106" y1="190" x2="106" y2="178"></line></g><circle cx="204" cy="171" r="5" fill="#F4F1EA"></circle><circle cx="222" cy="177" r="5" fill="#F5B841"></circle><circle cx="106" cy="175" r="5" fill="#F4F1EA"></circle><line x1="172" y1="138" x2="172" y2="64" stroke="#F5B841" stroke-width="5" stroke-linecap="round"></line><path d="M172 64 C174 82 196 86 190 110 C190 96 180 90 172 88 Z" fill="#F5B841" stroke="#F5B841" stroke-width="2" stroke-linejoin="round"></path><ellipse cx="150" cy="146" rx="27" ry="21" transform="rotate(-18 150 146)" fill="#F5B841"></ellipse><circle cx="148" cy="142" r="2.8" fill="#1A1300"></circle><circle cx="163" cy="138" r="2.8" fill="#1A1300"></circle><path d="M146 153 Q155 159 164 150" fill="none" stroke="#1A1300" stroke-width="2.4" stroke-linecap="round"></path><path d="M142 165 L140 184 L132 184" fill="none" stroke="#F5B841" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"></path><path d="M160 164 L162 184 L170 184" fill="none" stroke="#F5B841" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"></path></svg>',
  // Placeholder text, to be rewritten by Troy in his own voice.
  explain: [
    'Now we step outside, into the garden. This is the third chord, the IV. You have left the house, but you are relaxed and in no hurry: the garden does not pull you home the way the door does.',
    'With home (I), the garden (IV) and the door (V7), you can already play thousands of songs.'
  ],
  demoLabel: 'Hear home, garden, door, home',
  demo: function () { playBeats([C_MAJOR, F_GARDEN, G_DOOR7, C_MAJOR], 1.1, 'block'); },
  toListen: 'Next: listen to two songs',
  listenIntro: 'Two songs built on three chords. Watch the keyboard to see when the music goes out to the garden.',
  songs: [
    { title: 'Happy Birthday', artist: 'Traditional', kind: 'Major',
      url: 'https://open.spotify.com/search/Happy%20Birthday',
      beats: [].concat(repeat(C_MAJOR, 2), repeat(G_DOOR7, 4), repeat(C_MAJOR, 4), repeat(F_GARDEN, 2), [C_MAJOR, G_DOOR7], repeat(C_MAJOR, 2)), beatDur: 0.75 },
    // To confirm against a recording: usually played on just these three chords.
    { title: 'Dark Eyes', artist: 'Traditional', kind: 'Minor',
      url: 'https://open.spotify.com/search/Dark%20Eyes%20Ochi%20Chernye',
      beats: [].concat(repeat(G_DOOR7, 2), repeat(C_MINOR, 2), repeat(G_DOOR7, 2), repeat(C_MINOR, 2), repeat(F_GARDEN_MINOR, 2), repeat(C_MINOR, 2), repeat(G_DOOR7, 2), repeat(C_MINOR, 2)), beatDur: 0.75 }
  ],
  rounds: 10,
  choose: {
    prompt: 'Listen to four chords. Where does the music end: at home, in the garden, or at the door?',
    replay: 'Hear the chords again',
    options: [{ q: 'home', label: 'Home', sub: 'I' }, { q: 'garden', label: 'Garden', sub: 'IV' }, { q: 'door', label: 'Door', sub: 'V7' }],
    make: function (prev) {
      var keys = [
        { root: 60, garden: 65, door: 67, doorNotes: [65, 67, 71, 74] },
        { root: 67, garden: 60, door: 62, doorNotes: [62, 66, 69, 72] },
        { root: 62, garden: 67, door: 69, doorNotes: [67, 69, 73, 76] },
        { root: 69, garden: 62, door: 64, doorNotes: [64, 68, 71, 74] }
      ];
      var key = pick(keys);
      if (prev && prev.root === key.root) { key = keys[(keys.indexOf(key) + 1) % keys.length]; }
      var minor = Math.random() < 0.4;
      var third = minor ? 3 : 4;
      var kind = minor ? ' minor' : ' major';
      var chords = {
        H: { notes: [key.root, key.root + third, key.root + 7], bass: key.root - 12, caption: 'Home: ' + NOTE_NAMES[key.root] + kind },
        G: { notes: [key.garden, key.garden + third, key.garden + 7], bass: key.garden - 12, caption: 'The Garden: ' + NOTE_NAMES[key.garden] + kind },
        D: { notes: key.doorNotes, bass: key.door - 12, caption: 'The Door: ' + NOTE_NAMES[key.door] + '7' }
      };
      var q = pick(['home', 'garden', 'door']);
      var shape = q === 'home' ? pick(['HGDH', 'HDGH', 'HGHH']) : (q === 'garden' ? pick(['HHDG', 'HDHG', 'HHHG']) : pick(['HGHD', 'HHGD', 'HGGD']));
      return { root: key.root, q: q, beats: shape.split('').map(function (c) { return chords[c]; }) };
    },
    play: function (cur) { stopAll(); Sound.beats(cur.beats, 0.8, 'block'); },
    reveal: function (cur) { playBeats(cur.beats, 0.8, 'block'); },
    verdict: function (cur, good) {
      var where = { home: 'it ended at home.', garden: 'it ended in the garden.', door: 'it ended at the door.' }[cur.q];
      return (good ? 'Correct: ' : 'Not quite: ') + where + ' Watch the keyboard as it plays again.';
    }
  },
  play: {
    paras: [
      'Now you. Three chords on your piano: <strong>C major</strong> for home, <strong>F major</strong> (F, A, C) for the garden and <strong>G7</strong> for the door.',
      'The groove goes home, garden, door, home. Change chords when the keyboard does.'
    ],
    start: function () {
      var bar = [].concat(repeat(C_MAJOR, 4), repeat(F_GARDEN, 4), repeat(G_DOOR7, 4), repeat(C_MAJOR, 4));
      playBeats(bar.concat(bar), 0.75, 'groove');
    },
    ready: function () { light(C_MAJOR.notes, C_MAJOR.caption); }
  },
  recap: [
    'The IV chord is the garden: outside the house, but relaxed and in no hurry.',
    'The door (V7) pulls you home. The garden (IV) does not.',
    'Home, the garden and the door are enough for thousands of songs.'
  ]
};

CONTENT.chapters['1f'] = {
  title: 'Four chords: the bedroom',
  scene: '<svg role="img" aria-label="An eighth note with a face sitting up in bed with its eyes closed, in a dark bedroom with the moon in the window" viewBox="0 0 320 220" width="100%" style="display: block"><rect x="216" y="36" width="64" height="56" fill="#12333A" stroke="#4A5E7E" stroke-width="4"></rect><circle cx="262" cy="56" r="8" fill="#F4F1EA"></circle><line x1="248" y1="36" x2="248" y2="92" stroke="#4A5E7E" stroke-width="3"></line><line x1="216" y1="64" x2="280" y2="64" stroke="#4A5E7E" stroke-width="3"></line><line x1="20" y1="190" x2="300" y2="190" stroke="#2B3A52" stroke-width="3" stroke-linecap="round"></line><rect x="60" y="92" width="16" height="98" rx="4" fill="#44587A"></rect><rect x="244" y="132" width="12" height="58" rx="4" fill="#44587A"></rect><rect x="70" y="140" width="180" height="30" rx="8" fill="#3A4C69"></rect><ellipse cx="108" cy="136" rx="26" ry="10" fill="#C9D2E0"></ellipse><line x1="134" y1="108" x2="134" y2="38" stroke="#F5B841" stroke-width="5" stroke-linecap="round"></line><path d="M134 38 C136 56 158 60 152 84 C152 70 142 64 134 62 Z" fill="#F5B841" stroke="#F5B841" stroke-width="2" stroke-linejoin="round"></path><ellipse cx="112" cy="116" rx="27" ry="21" transform="rotate(-18 112 116)" fill="#F5B841"></ellipse><path d="M104 113 Q108 116 112 112" fill="none" stroke="#1A1300" stroke-width="2.4" stroke-linecap="round"></path><path d="M119 109 Q123 112 127 108" fill="none" stroke="#1A1300" stroke-width="2.4" stroke-linecap="round"></path><path d="M110 124 Q117 128 124 122" fill="none" stroke="#1A1300" stroke-width="2.4" stroke-linecap="round"></path><path d="M96 132 Q170 116 250 134 L250 164 Q170 172 96 164 Z" fill="#2F6F6A"></path><g fill="#A9B4C6" font-family="sans-serif" font-weight="700"><text x="166" y="92" font-size="16">z</text><text x="180" y="76" font-size="20">z</text><text x="198" y="58" font-size="24">z</text></g></svg>',
  // Placeholder text, to be rewritten by Troy in his own voice.
  explain: [
    'So far, every chord in a major home has been a bright one: home, the garden and the door are all major chords.',
    'Now we find a room that sounds dark and quiet: the bedroom. It is a minor chord living inside a major home, and musicians number it vi. It shares two of its three notes with the home chord, which is why it feels close to home, only more wistful.',
    'This chapter stays in a major home. Minor homes have a room like this too, a bright one, and we will visit it later.'
  ],
  demoLabel: 'Hear home, then the bedroom',
  demo: function () { playBeats([C_MAJOR, A_BED, C_MAJOR, A_BED], 1.1, 'block'); },
  toListen: 'Next: listen to two songs',
  listenIntro: 'Two songs in a major home that visit the bedroom early on. Watch the keyboard: only one note moves between home and the bedroom.',
  songs: [
    // To confirm against a recording: opening goes home, bedroom, home, bedroom.
    { title: 'Hallelujah', artist: 'Leonard Cohen', kind: 'Major home',
      url: 'https://open.spotify.com/search/Hallelujah%20Leonard%20Cohen',
      beats: [].concat(repeat(C_MAJOR, 2), repeat(A_BED, 2), repeat(C_MAJOR, 2), repeat(A_BED, 2), repeat(F_GARDEN, 2), repeat(G_DOOR7, 2), repeat(C_MAJOR, 2), repeat(G_DOOR7, 2)), beatDur: 0.75 },
    // To confirm against a recording: home, bedroom, garden, door.
    { title: 'Stand by Me', artist: 'Ben E. King', kind: 'Major home',
      url: 'https://open.spotify.com/search/Stand%20by%20Me%20Ben%20E.%20King',
      beats: [].concat(repeat(C_MAJOR, 4), repeat(A_BED, 4), repeat(F_GARDEN, 2), repeat(G_DOOR7, 2), repeat(C_MAJOR, 4)), beatDur: 0.75 }
  ],
  rounds: 10,
  choose: {
    prompt: 'Listen to four chords in a major home. Does the music end at home, or in the bedroom?',
    replay: 'Hear the chords again',
    options: [{ q: 'home', label: 'Home (I)', sub: 'bright' }, { q: 'bed', label: 'Bedroom (vi)', sub: 'dark and quiet' }],
    make: function (prev) {
      var keys = [
        { root: 60, name: 'C', bed: 'A', garden: 65, gname: 'F', door: 67, dname: 'G', doorNotes: [65, 67, 71, 74] },
        { root: 62, name: 'D', bed: 'B', garden: 67, gname: 'G', door: 69, dname: 'A', doorNotes: [67, 69, 73, 76] },
        { root: 67, name: 'G', bed: 'E', garden: 60, gname: 'C', door: 62, dname: 'D', doorNotes: [62, 66, 69, 72] }
      ];
      var key = pick(keys);
      if (prev && prev.root === key.root) { key = keys[(keys.indexOf(key) + 1) % keys.length]; }
      var chords = {
        H: { notes: [key.root, key.root + 4, key.root + 7], bass: key.root - 12, caption: 'Home: ' + key.name + ' major' },
        B: { notes: [key.root, key.root + 4, key.root + 9], bass: key.root - 15, caption: 'The Bedroom: ' + key.bed + ' minor' },
        G: { notes: [key.garden, key.garden + 4, key.garden + 7], bass: key.garden - 12, caption: 'The Garden: ' + key.gname + ' major' },
        D: { notes: key.doorNotes, bass: key.door - 12, caption: 'The Door: ' + key.dname + '7' }
      };
      var q = Math.random() < 0.5 ? 'home' : 'bed';
      var shape = q === 'home' ? pick(['HBDH', 'HGDH', 'HBGH']) : pick(['HGDB', 'HHDB', 'HGHB']);
      return { root: key.root, q: q, beats: shape.split('').map(function (c) { return chords[c]; }) };
    },
    play: function (cur) { stopAll(); Sound.beats(cur.beats, 0.8, 'block'); },
    reveal: function (cur) { playBeats(cur.beats, 0.8, 'block'); },
    verdict: function (cur, good) {
      return (good ? 'Correct: ' : 'Not quite: ') + (cur.q === 'home' ? 'it ended at home.' : 'it ended in the bedroom.') + ' Watch the keyboard as it plays again.';
    }
  },
  play: {
    paras: [
      'Now you. Play <strong>C major</strong> (C, E, G), then move just one finger: G goes up to A. That is <strong>A minor</strong>, the bedroom.',
      'The groove goes home, bedroom, garden, door. Change chords when the keyboard does.'
    ],
    start: function () {
      var bar = [].concat(repeat(C_MAJOR, 4), repeat(A_BED, 4), repeat(F_GARDEN, 4), repeat(G_DOOR7, 4));
      playBeats(bar.concat(bar, repeat(C_MAJOR, 2)), 0.75, 'groove');
    },
    ready: function () { light(C_MAJOR.notes, C_MAJOR.caption); }
  },
  recap: [
    'The vi chord is the bedroom: a dark, quiet minor chord inside a major home.',
    'It shares two of its three notes with home, so it feels close to home.',
    'A phrase that heads for home can land in the bedroom instead, which sounds like a gentle surprise.'
  ]
};

/* ---------- App ---------- */
var STEPS = [
  { icon: '💡', label: 'Explain' },
  { icon: '🎵', label: 'Listen' },
  { icon: '🤔', label: 'Choose' },
  { icon: '🎹', label: 'Play' },
  { icon: '📌', label: 'Recap' }
];
var state = { view: 'path', chapter: '1a', step: 0, maxStep: 0, round: 1, score: 0, cur: null, picked: null, lit: [], caption: '', askReset: false, songsPlayed: {}, voice: 'idle', asked: true };
var view = document.getElementById('view');

function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }

/* Keyboard */
var WHITE = [60, 62, 64, 65, 67, 69, 71, 72, 74, 76];
var LETTER = { 60: 'C', 62: 'D', 64: 'E', 65: 'F', 67: 'G', 69: 'A', 71: 'B', 72: 'C', 74: 'D', 76: 'E' };
var BLACK = [[61, 1, 'C sharp'], [63, 2, 'E flat'], [66, 4, 'F sharp'], [68, 5, 'A flat'], [70, 6, 'B flat'], [73, 8, 'C sharp'], [75, 9, 'E flat']];
function keyboardHtml() {
  var h = '<div class="stack" style="gap: 8px"><div class="kb-caption" id="kb-caption">' + esc(state.caption) + '</div><div class="kb">';
  WHITE.forEach(function (m) {
    h += '<button type="button" class="wk' + (state.lit.indexOf(m) >= 0 ? ' lit' : '') + '" data-note="' + m + '" aria-label="' + LETTER[m] + ' key"><span>' + LETTER[m] + '</span></button>';
  });
  BLACK.forEach(function (b) {
    h += '<button type="button" class="bk' + (state.lit.indexOf(b[0]) >= 0 ? ' lit' : '') + '" data-note="' + b[0] + '" style="left: ' + (b[1] * 10) + '%" aria-label="' + b[2] + ' key"></button>';
  });
  return h + '</div></div>';
}
function light(notes, caption) {
  state.lit = notes; state.caption = caption;
  var cap = document.getElementById('kb-caption');
  if (cap) { cap.textContent = caption; }
  view.querySelectorAll('[data-note]').forEach(function (k) {
    k.classList.toggle('lit', notes.indexOf(Number(k.getAttribute('data-note'))) >= 0);
  });
}

/* Path screen */
function pathHtml() {
  var s1 = CONTENT.section1;
  var done = Progress.count();
  var pct = Math.max(2, Math.round(done / CONTENT.totalChapters * 100));
  var pattern = [5.3, 36.7, 74, 36.7];
  var xs = s1.chapters.map(function (c, i) { return pattern[i % 4]; });
  var step = 116;
  var trailHeight = (s1.chapters.length - 1) * step + 68 + 28;
  var h = '<div class="stack" style="gap: 8px"><h1>Your path</h1>' +
    '<div class="muted" style="font-size: 15px">10 sections, ' + CONTENT.totalChapters + ' chapters, one tiny step at a time.</div>' +
    '<div class="progress" style="margin-top: 6px"><div style="width: ' + pct + '%"></div></div>' +
    '<div class="small muted" style="font-weight: 700">' + done + ' of ' + CONTENT.totalChapters + ' chapters done</div></div>';

  h += '<section class="card"><div class="stack" style="gap: 4px"><div class="eyebrow">Section 1</div><h2>' + esc(s1.title) + '</h2>' +
    '<div class="muted" style="font-size: 14px">' + esc(s1.blurb) + ' You are here.</div></div><div class="trail" style="height: ' + trailHeight + 'px">';
  for (var i = 0; i < s1.chapters.length - 1; i++) {
    [0.34, 0.5, 0.66].forEach(function (t) {
      var x = xs[i] + (xs[i + 1] - xs[i]) * t;
      var y = i * step + 34 + step * t;
      h += '<div class="dot" aria-hidden="true" style="left: calc(' + x.toFixed(1) + '% + 31px); top: ' + Math.round(y - 3) + 'px"></div>';
    });
  }
  s1.chapters.forEach(function (c, i) {
    var top = i * step;
    var right = xs[i] > 60;
    var built = !!CONTENT.chapters[c.id];
    var isDone = Progress.isDone(c.id);
    var open = built && (i === 0 || Progress.isDone(s1.chapters[i - 1].id));
    var pos = 'left: ' + xs[i] + '%; top: ' + top + 'px';
    var labelPos = right
      ? 'left: 0; right: calc(' + (100 - xs[i]) + '% + 14px); text-align: right; top: ' + (top + 12) + 'px'
      : 'left: calc(' + xs[i] + '% + 82px); right: 0; top: ' + (top + 10) + 'px';
    if (isDone || open) {
      h += '<button type="button" class="node ' + (isDone ? 'done' : 'current') + '" data-act="open" data-id="' + c.id + '" style="' + pos + '" aria-label="Open chapter ' + c.id + ', ' + esc(c.title) + '">' + c.id + '</button>';
      h += '<button type="button" tabindex="-1" aria-hidden="true" class="node-label live' + (isDone ? ' done' : '') + '" data-act="open" data-id="' + c.id + '" style="' + labelPos + '"><span class="t">' + esc(c.title) + '</span><span class="s">' + (isDone ? 'Done · replay' : (i === 0 ? 'Start here' : 'Next up')) + '</span></button>';
    } else {
      h += '<div class="node" style="' + pos + '">' + c.id + '</div>';
      h += '<div class="node-label" style="' + labelPos + '"><div class="t">' + esc(c.title) + '</div><div class="s">' + esc(c.sub) + '</div></div>';
    }
  });
  h += '</div></section>';

  h += '<section class="stack" style="gap: 10px"><div class="eyebrow">Coming up</div>';
  CONTENT.comingUp.forEach(function (s) {
    h += '<div class="locked"><div class="num">' + s[0] + '</div><div class="txt"><div class="name">' + esc(s[1]) + '</div><div class="small muted">' + s[2] + ' chapters</div></div>' +
      '<svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#A9B4C6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="11" width="14" height="9" rx="2"></rect><path d="M8 11V8a4 4 0 0 1 8 0v3"></path></svg></div>';
  });
  h += '</section>';

  {
    h += '<div class="reset-row">' + (state.askReset
      ? '<span class="small muted">Erase your progress on this device?</span><button type="button" class="btn quiet" id="reset-yes" data-act="reset-yes">Yes, erase it</button><button type="button" class="btn quiet" id="reset-no" data-act="reset-no">Keep it</button>'
      : '<button type="button" class="btn quiet" id="how" data-act="how">How it works</button><button type="button" class="btn quiet" id="reset-ask" data-act="reset-ask">Reset progress</button>') + '</div>';
  }
  return h;
}

/* Chapter screen */
function chapterHtml() {
  var ch = CONTENT.chapters[state.chapter];
  var h = '<div class="topbar"><button type="button" class="btn quiet" id="back" data-act="back">&larr; Your path</button>' +
    '<div class="eyebrow">Section 1 · ' + esc(CONTENT.section1.short) + ' · ' + state.chapter + '</div></div>';
  h += '<h1>' + esc(ch.title) + '</h1>';
  // Progress line: finished steps are checked and tappable, the current step has a yellow ring.
  // No filled yellow here: that look is reserved for the next action inside the card.
  var reached = Math.max(state.step, state.maxStep);
  h += '<div class="stepper"><div class="line">';
  STEPS.forEach(function (s, i) {
    if (i > 0) { h += '<div class="seg' + (i <= reached ? ' done' : '') + '"></div>'; }
    if (i === state.step) { h += '<div class="stop" aria-current="step" aria-label="Step ' + (i + 1) + ', ' + s.label + '"><span class="dot active">' + (i + 1) + '</span></div>'; }
    else if (i <= state.maxStep) { h += '<button type="button" class="stop" id="chip-' + i + '" data-act="goto" data-step="' + i + '" aria-label="Go to step ' + (i + 1) + ', ' + s.label + '"><span class="dot done">\u2713</span></button>'; }
    else { h += '<div class="stop" aria-label="Step ' + (i + 1) + ', ' + s.label + ', not reached yet"><span class="dot">' + (i + 1) + '</span></div>'; }
  });
  h += '</div><div class="cap">Step ' + (state.step + 1) + ' of ' + STEPS.length + ' \u00B7 <b><span aria-hidden="true">' + STEPS[state.step].icon + ' </span>' + STEPS[state.step].label + '</b></div>';
  h += '</div><section class="card step" aria-live="polite">';

  if (state.step === 0) {
    if (ch.headline) { h += '<p class="idea">' + esc(ch.headline) + '</p>'; }
    if (ch.scene && ch.voice && (ch.voice.audio || Voice.supported)) {
      h += '<button type="button" class="scene talk" id="speak" data-act="speak" data-voice="' + state.voice + '" aria-label="' + (state.voice === 'speaking' ? 'Stop reading' : 'Read this explanation aloud') + '">' +
        ch.scene.replace('</svg>', bubbleSvg(ch.voice) + '</svg>') + '</button>';
    } else if (ch.scene) { h += '<div class="scene">' + ch.scene + '</div>'; }
    ch.explain.forEach(function (p) { h += '<p>' + esc(p) + '</p>'; });
    // Listening comes first and is never rushed: the demo stays the bright button. "Next" is only
    // outlined in yellow, a few seconds after the first demo has finished playing.
    var ready = state.nextReady || state.maxStep > 0;
    // After three plays the two buttons trade looks, and "Next" becomes the main action.
    h += '<button type="button" class="btn ' + (state.swapped ? 'ready' : 'primary') + '" id="demo" data-act="demo"><span aria-hidden="true">\uD83D\uDD0A </span>' + esc(state.demoPlayed ? 'Hear it again' : ch.demoLabel) + '</button>' +
      '<div class="grow"></div><button type="button" class="btn' + (state.swapped ? ' primary' : ready ? ' ready' : '') + '" id="next" data-act="next">' + esc(ch.toListen) + '</button>';
  } else if (state.step === 1) {
    if (ch.listenVoice && (ch.listenVoice.audio || Voice.supported)) {
      h += '<button type="button" class="guide talk" id="speak" data-act="speak" data-voice="' + state.voice + '" aria-label="' + (state.voice === 'speaking' ? 'Stop reading' : 'Read this instruction aloud') + '">' + guideSvg() + '<span>' + esc(ch.listenIntro) + '</span></button>';
    } else { h += '<p>' + esc(ch.listenIntro) + '</p>'; }
    ch.songs.forEach(function (s, i) {
      h += '<div class="song"><div class="head"><span class="icon" aria-hidden="true">🎵</span><div><div class="name">"' + esc(s.title) + '"</div><div class="small muted">' + esc(s.artist) + ' · ' + esc(s.kind) + '</div></div></div>' +
        (s.note ? '<div class="small muted">' + esc(s.note) + '</div>' : '') +
        '<button type="button" class="btn ' + listenLook(ch).songs[i] + '" id="song-' + i + '" data-act="song" data-i="' + i + '"><span aria-hidden="true">\uD83D\uDD0A </span><span class="lbl">' + (state.songsPlayed[i] ? 'Play again' : 'Play the groove') + '</span></button>' +
        '<a class="spotify" href="' + s.url + '" target="_blank" rel="noopener">Hear the real song on Spotify <span aria-hidden="true">\u2197</span></a></div>';
    });
    h += '<p class="small muted">For now, a simple groove stands in for each song here. The Spotify link opens the real recording in a new tab.</p>' +
      '<div class="grow"></div><button type="button" class="btn' + (listenLook(ch).next ? ' primary' : '') + '" id="next" data-act="next">Next: your turn to choose</button>';
  } else if (state.step === 2) {
    var answered = state.picked !== null;
    var cur = state.cur;
    h += '<div class="spread small muted" style="font-weight: 700"><span>Round ' + state.round + ' of ' + ch.rounds + '</span><span>' + state.score + ' correct</span></div>' +
      (hasGuide(ch.choose)
        ? '<button type="button" class="guide talk" id="speak" data-act="speak" data-voice="' + state.voice + '" aria-label="' + (state.voice === 'speaking' ? 'Stop reading' : 'Read this instruction aloud') + '">' + guideSvg() + '<span>' + esc(ch.choose.intro) + '</span></button>'
        : '<p>' + esc(ch.choose.prompt) + '</p>') +
      (state.asked ? '' : '<button type="button" class="btn primary" id="hear" data-act="hear"><span aria-hidden="true">\uD83D\uDD0A </span>Play the chords</button>') +
      '<div class="small listening' + (state.listening && !answered ? ' on' : '') + '" id="listening" aria-live="polite"><span aria-hidden="true">\uD83D\uDD0A </span>Listening\u2026</div>' +
      '<div id="choices" class="choices' + (ch.choose.options.length > 2 ? ' three' : '') + (!state.listening && !answered && state.asked ? ' go' : '') + '">';
    ch.choose.options.forEach(function (o) {
      var cls = !answered ? '' : (cur.q === o.q ? ' right' : (state.picked === o.q ? ' wrong' : ''));
      h += '<button type="button" class="choice' + cls + '" id="pick-' + o.q + '" data-act="pick" data-q="' + o.q + '"><b>' + esc(o.label) + '</b><span>' + esc(o.sub) + '</span></button>';
    });
    h += '</div>' + (!state.asked ? '' : '<button type="button" class="btn quiet hear" id="hear" data-act="hear"><span aria-hidden="true">\uD83D\uDD0A </span>' + esc(ch.choose.replay) + '</button>');
    if (answered) {
      var good = state.picked === cur.q;
      h += '<div class="feedback ' + (good ? 'good' : 'bad') + '" role="status">' + esc(ch.choose.verdict(cur, good)) + '</div>' +
        '<div class="grow"></div><button type="button" class="btn primary" id="next" data-act="next-round">' + (state.round >= ch.rounds ? 'Next: play it yourself' : 'Next round') + '</button>';
    }
  } else if (state.step === 3) {
    ch.play.paras.forEach(function (p) { h += '<p>' + p + '</p>'; });
    h += '<button type="button" class="btn" id="groove" data-act="groove">Start the groove</button>' +
      '<p class="small muted">No piano nearby? Tap the keys below to try it here.</p>' +
      '<div class="grow"></div><button type="button" class="btn primary" id="next" data-act="played">I played it</button>';
  } else {
    h += '<div style="display: flex; align-items: center; gap: 10px"><span aria-hidden="true" style="font-size: 24px">📌</span><h2>Recap</h2></div>' +
      '<div style="font-weight: 700; color: var(--ok)">Chapter ' + state.chapter + ' done.' + (state.cur ? ' You got ' + state.score + ' of ' + ch.rounds + ' by ear.' : '') + '</div><ul class="recap-list">';
    ch.recap.forEach(function (r) { h += '<li>' + esc(r) + '</li>'; });
    h += '</ul><div class="grow"></div><button type="button" class="btn primary" id="next" data-act="back">Back to your path</button>' +
      '<button type="button" class="btn" id="again" data-act="again">Do it again</button>';
  }
  h += '</section>' + keyboardHtml();
  return h;
}

/* ---------- Welcome: shown on the first visit, and again after a reset ---------- */
var WELCOME_KEY = 'homekey.welcomed.v1';
function hasBeenWelcomed() { try { return localStorage.getItem(WELCOME_KEY) === '1'; } catch (e) { return false; } }
function setWelcomed(on) { try { if (on) { localStorage.setItem(WELCOME_KEY, '1'); } else { localStorage.removeItem(WELCOME_KEY); } } catch (e) {} }
function welcomeHtml() {
  var h = '<div class="stack" style="gap: 14px"><h1>Music has logic, like math. Understand it, and you can play the songs you love by ear.</h1>' +
    '<p class="lead">Hear a new favorite? Recognize its patterns, with no sheet music in front of you.</p></div>';
  h += '<div class="card welcome-card"><svg class="greeter" aria-hidden="true" viewBox="0 0 84 130"><line x1="56" y1="86" x2="56" y2="14" stroke="#F5B841" stroke-width="5" stroke-linecap="round"></line><path d="M56 14 C58 32 80 36 74 60 C74 46 64 40 56 38 Z" fill="#F5B841" stroke="#F5B841" stroke-width="2" stroke-linejoin="round"></path><path d="M16 88 L5 72" fill="none" stroke="#F5B841" stroke-width="5" stroke-linecap="round"></path><ellipse cx="34" cy="94" rx="27" ry="21" transform="rotate(-18 34 94)" fill="#F5B841"></ellipse><circle cx="25" cy="90" r="2.8" fill="#1A1300"></circle><circle cx="40" cy="86" r="2.8" fill="#1A1300"></circle><path d="M26 100 Q35 107 45 97" fill="none" stroke="#1A1300" stroke-width="2.4" stroke-linecap="round"></path><path d="M24 112 L22 126" fill="none" stroke="#F5B841" stroke-width="5" stroke-linecap="round"></path><path d="M42 111 L42 126" fill="none" stroke="#F5B841" stroke-width="5" stroke-linecap="round"></path></svg><h2>How it works</h2><p class="muted" style="margin: 0">Every chapter teaches one small idea, in five short steps. Take them in order:</p><ol class="how">';
  [['\uD83D\uDCA1', 'Explain', 'Read one short idea.'],
   ['\uD83C\uDFB5', 'Listen', 'Hear it in songs you know.'],
   ['\uD83E\uDD14', 'Choose', 'Test your ear with quick questions.'],
   ['\uD83C\uDFB9', 'Play', 'Try it yourself at the piano.'],
   ['\uD83D\uDCCC', 'Recap', 'See what to remember.']].forEach(function (s) {
    h += '<li><span class="ico" aria-hidden="true">' + s[0] + '</span><span><b>' + s[1] + '</b><span class="muted"> · ' + s[2] + '</span></span></li>';
  });
  h += '</ol></div>';
  h += '<div class="stack" style="gap: 10px"><button type="button" class="btn primary" id="start" data-act="start">Start</button>' +
    '<div class="small muted" style="text-align: center; text-wrap: balance">No account needed. Turn your sound on: your first chord is one minute away.</div></div>';
  return h;
}

/* Listen step: the filled yellow button is always the one thing to do next. It moves from the first
   unplayed song to the next one, and lands on "Next" once every groove has been played. */
function listenLook(ch) {
  var seen = state.maxStep > 1;
  var first = -1;
  ch.songs.forEach(function (s, i) { if (first < 0 && !state.songsPlayed[i]) { first = i; } });
  return {
    songs: ch.songs.map(function (s, i) { return !seen && i === first ? 'primary' : 'ready'; }),
    next: seen || first < 0
  };
}
function refreshListen(ch) {
  if (state.view !== 'chapter' || state.step !== 1) { return; }
  var look = listenLook(ch);
  ch.songs.forEach(function (s, i) {
    var b = document.getElementById('song-' + i);
    if (!b) { return; }
    b.classList.toggle('primary', look.songs[i] === 'primary');
    b.classList.toggle('ready', look.songs[i] === 'ready');
    var l = b.querySelector('.lbl'); if (l) { l.textContent = state.songsPlayed[i] ? 'Play again' : 'Play the groove'; }
  });
  var nx = document.getElementById('next'); if (nx) { nx.classList.toggle('primary', look.next); }
}

/* The speech bubble drawn into a scene: play triangle, moving bars while speaking, replay arrow when done. */
function bubbleSvg(v) {
  var x = v.cx, y = v.cy, bars = '';
  [[-18, 14], [-8, 28], [2, 18], [12, 24]].forEach(function (b, i) {
    bars += '<rect class="bar b' + i + '" x="' + (x + b[0]) + '" y="' + (y - b[1] / 2) + '" width="6" height="' + b[1] + '" rx="3" fill="#0F1724"></rect>';
  });
  return '<g class="bubble"><ellipse cx="' + x + '" cy="' + y + '" rx="36" ry="27" fill="#F4F1EA"></ellipse><path d="' + v.tail + '" fill="#F4F1EA"></path>' +
    '<path class="i-play" d="M' + (x - 8) + ' ' + (y - 13) + ' L' + (x - 8) + ' ' + (y + 13) + ' L' + (x + 14) + ' ' + y + ' Z" fill="#0F1724"></path>' +
    '<g class="i-dots"><circle class="d0" cx="' + (x - 12) + '" cy="' + y + '" r="4.5" fill="#0F1724"></circle><circle class="d1" cx="' + x + '" cy="' + y + '" r="4.5" fill="#0F1724"></circle><circle class="d2" cx="' + (x + 12) + '" cy="' + y + '" r="4.5" fill="#0F1724"></circle></g>' +
    '<g class="i-bars">' + bars + '</g>' +
    '<g class="i-replay"><path d="M' + (x + 12) + ' ' + y + ' A12 12 0 1 1 ' + (x + 6) + ' ' + (y - 10.4) + '" fill="none" stroke="#0F1724" stroke-width="3.5" stroke-linecap="round"></path>' +
    '<path d="M' + (x + 3) + ' ' + (y - 17) + ' L' + (x + 12) + ' ' + (y - 10) + ' L' + (x + 2) + ' ' + (y - 5) + ' Z" fill="#0F1724"></path></g></g>';
}

/* The small guide: the character's head with its speech bubble, for steps that have no scene picture. */
function guideSvg() {
  return '<svg aria-hidden="true" width="90" height="60" viewBox="0 0 150 100">' +
    '<line x1="128" y1="70" x2="128" y2="10" stroke="#F5B841" stroke-width="5" stroke-linecap="round"></line>' +
    '<path d="M128 10 C130 26 148 30 143 50 C143 38 135 33 128 31 Z" fill="#F5B841" stroke="#F5B841" stroke-width="2" stroke-linejoin="round"></path>' +
    '<ellipse cx="108" cy="76" rx="24" ry="19" transform="rotate(-18 108 76)" fill="#F5B841"></ellipse>' +
    '<circle cx="100" cy="72" r="2.6" fill="#1A1300"></circle><circle cx="113" cy="68" r="2.6" fill="#1A1300"></circle>' +
    '<path class="smile" d="M101 82 Q109 88 118 79" fill="none" stroke="#1A1300" stroke-width="2.4" stroke-linecap="round"></path>' +
    '<ellipse class="mouth" cx="109" cy="82" rx="5" ry="4" fill="#1A1300" transform="rotate(-18 109 82)"></ellipse>' +
    bubbleSvg({ cx: 42, cy: 34, tail: 'M66 52 L92 66 L56 56 Z' }) + '</svg>';
}

/* Choose step: first "Listening..." while the question plays, then the answers light up as the next action. */
var listenTimer = null;
function syncListening() {
  var l = document.getElementById('listening'), c = document.getElementById('choices');
  if (l) { l.classList.toggle('on', !!state.listening && state.picked === null); }
  if (c) { c.classList.toggle('go', !state.listening && state.picked === null && state.asked); }
}
function hasGuide(part) { return !!(part && part.voice && part.intro && (part.voice.audio || Voice.supported)); }
// Round 1: with a voice guide the chords wait for the user; without one they play right away.
function firstQuestion(ch) {
  if (hasGuide(ch.choose)) { clearTimeout(listenTimer); state.asked = false; state.listening = false; }
  else { state.asked = true; askQuestion(ch); }
}
function askQuestion(ch) {
  clearTimeout(listenTimer);
  state.listening = true;
  ch.choose.play(state.cur);
  syncListening();
  var secs = state.cur.beats ? state.cur.beats.length * 0.8 + 0.4 : 1.8;
  listenTimer = setTimeout(function () { state.listening = false; syncListening(); }, secs * 1000);
}

function render(focusId) {
  // The voice state belongs to one step: a new step starts with a fresh bubble.
  var voiceKey = state.view + ':' + state.chapter + ':' + state.step;
  if (state.voiceFor !== voiceKey) { state.voiceFor = voiceKey; if (state.voice !== 'idle') { Voice.stop(); state.voice = 'idle'; } }
  view.innerHTML = state.view === 'welcome' ? welcomeHtml() : state.view === 'path' ? pathHtml() : chapterHtml();
  if (focusId) { var el = document.getElementById(focusId); if (el) { el.focus({ preventScroll: true }); } }
}
function go(viewName) {
  stopAll();
  state.view = viewName;
  try { history.replaceState(null, '', viewName === 'chapter' ? '#' + state.chapter : '#' + viewName); } catch (e) {}
  window.scrollTo(0, 0);
}
function startChapter(id) {
  state.chapter = id;
  go('chapter');
  state.step = 0; state.demoPlayed = false; state.nextReady = false; state.voice = 'idle'; state.demoCount = 0; state.swapped = false; state.songsPlayed = {}; clearTimeout(nextTimer); clearTimeout(swapTimer); state.maxStep = Progress.isDone(id) ? 4 : 0; state.round = 1; state.score = 0; state.cur = null; state.picked = null; state.lit = []; state.caption = '';
  render();
}

view.addEventListener('click', function (e) {
  var key = e.target.closest('[data-note]');
  if (key) { hushVoice(); Sound.note(Number(key.getAttribute('data-note'))); return; }
  var el = e.target.closest('[data-act]');
  if (!el) { return; }
  var act = el.getAttribute('data-act');
  var ch = CONTENT.chapters[state.chapter];

  if (act === 'speak') {
    if (state.voice === 'speaking' || state.voice === 'loading') { hushVoice(); return; }
    stopAll();
    clearTimeout(listenTimer); state.listening = false; syncListening();
    // The device can take a moment to start speaking: show "getting ready" dots until the voice is heard.
    setVoice('loading');
    var begin = function () { if (state.voice === 'loading') { setVoice('speaking'); } };
    timers.push(setTimeout(begin, 4000)); // some browsers never report the start
    var clipUrl = state.step === 2 ? ch.choose.voice.audio : state.step === 1 ? ch.listenVoice.audio : ch.voice.audio;
    var words = state.step === 2 ? ch.choose.intro : state.step === 1 ? ch.listenIntro : [ch.headline].concat(ch.explain).join(' ');
    var finish = function () { if (state.voice === 'speaking' || state.voice === 'loading') { setVoice('done'); } };
    if (clipUrl) { Voice.play(clipUrl, words, begin, finish); } else { Voice.speak(words, begin, finish); }
  }
  else if (act === 'how') { go('welcome'); render(); }
  else if (act === 'start') { setWelcomed(true); go('path'); render(); }
  else if (act === 'open') { startChapter(el.getAttribute('data-id')); }
  else if (act === 'again') { startChapter(state.chapter); }
  else if (act === 'back') { go('path'); state.askReset = false; render(); }
  else if (act === 'reset-ask') { state.askReset = true; render('reset-no'); }
  else if (act === 'reset-no') { state.askReset = false; render('reset-ask'); }
  else if (act === 'reset-yes') { Progress.reset(); setWelcomed(false); state.askReset = false; go('welcome'); render(); }
  else if (act === 'demo') {
    stopAll(); lastPlayLen = 2; ch.demo();
    if (!state.demoPlayed) {
      state.demoPlayed = true;
      el.innerHTML = '<span aria-hidden="true">\uD83D\uDD0A </span>Hear it again';
      var forChapter = state.chapter;
      clearTimeout(nextTimer);
      nextTimer = setTimeout(function () {
        if (state.chapter !== forChapter || state.view !== 'chapter' || state.swapped) { return; }
        state.nextReady = true;
        var nx = document.getElementById('next');
        if (nx && state.step === 0) { nx.classList.add('ready'); }
      }, (lastPlayLen + NEXT_PAUSE) * 1000);
    }
    state.demoCount += 1;
    if (state.demoCount === 3 && !state.swapped) {
      var swapFor = state.chapter;
      clearTimeout(swapTimer);
      swapTimer = setTimeout(function () {
        if (state.chapter !== swapFor || state.view !== 'chapter') { return; }
        state.swapped = true;
        if (state.step !== 0) { return; }
        var nx = document.getElementById('next'), dm = document.getElementById('demo');
        if (nx) { nx.classList.remove('ready'); nx.classList.add('primary'); }
        if (dm) { dm.classList.remove('primary'); dm.classList.add('ready'); }
      }, (lastPlayLen + 1) * 1000);
    }
  }
  else if (act === 'song') {
    var si = Number(el.getAttribute('data-i'));
    var s = ch.songs[si];
    playBeats(s.beats, s.beatDur, s.style || 'groove');
    // Counts as played only if the groove runs to its end; stopAll() cancels this along with the sound.
    timers.push(setTimeout(function () { state.songsPlayed[si] = true; refreshListen(ch); }, (lastPlayLen + 1) * 1000));
  }
  else if (act === 'next') {
    stopAll();
    state.step += 1; state.maxStep = Math.max(state.maxStep, state.step); state.lit = []; state.caption = '';
    if (state.step === 2 && !state.cur) { state.round = 1; state.score = 0; state.picked = null; state.cur = ch.choose.make(null); firstQuestion(ch); }
    render();
    if (state.step === 3) { ch.play.ready(); }
  }
  else if (act === 'goto') {
    var n = Number(el.getAttribute('data-step'));
    if (n > state.maxStep) { return; }
    stopAll();
    state.step = n; state.lit = []; state.caption = '';
    if (n === 2 && !state.cur) { state.round = 1; state.score = 0; state.picked = null; state.cur = ch.choose.make(null); firstQuestion(ch); }
    render();
    if (n === 3) { ch.play.ready(); }
    window.scrollTo(0, 0);
  }
  else if (act === 'hear') { if (state.cur) { if (!state.asked) { state.asked = true; render(); } if (state.picked === null) { askQuestion(ch); } else { ch.choose.play(state.cur); } } }
  else if (act === 'pick') {
    if (state.picked !== null || !state.cur || !state.asked) { return; }
    clearTimeout(listenTimer); state.listening = false;
    state.picked = el.getAttribute('data-q');
    if (state.picked === state.cur.q) { state.score += 1; }
    render('next');
    ch.choose.reveal(state.cur);
  }
  else if (act === 'next-round') {
    stopAll();
    if (state.round >= ch.rounds) {
      state.step = 3; state.maxStep = Math.max(state.maxStep, 3); state.lit = []; state.caption = '';
      render();
      ch.play.ready();
    } else {
      state.round += 1; state.picked = null; state.lit = []; state.caption = '';
      state.cur = ch.choose.make(state.cur);
      state.asked = true;
      render();
      askQuestion(ch);
    }
  }
  else if (act === 'groove') { ch.play.start(); }
  else if (act === 'played') { stopAll(); Progress.complete(state.chapter); state.step = 4; state.maxStep = 4; state.lit = []; state.caption = ''; render(); }
});

document.getElementById('home').addEventListener('click', function () {
  setWelcomed(true); go('path'); state.askReset = false; render();
});

if (!hasBeenWelcomed() && Progress.count() === 0) { state.view = 'welcome'; }
render();
