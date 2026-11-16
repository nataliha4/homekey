/* ---------- New lesson design (test copy at /next/, chapter 1a only) ----------
   One screen, one action. The action lives in the content (the voice pill, a play button, the answer cards);
   Continue waits at the bottom in gray and turns yellow once that action is done. Designs: "HomeKey lesson screens".
   Loaded after app.js and reuses its Sound, Voice, Spotify, Progress, keyboard and content. */
var AUDIO_BASE = '../'; // the recordings live in the main folder, one level up
var NEW_LESSON = { '1a': true };

// Play step text for the new design (the old recording, voice-1a-play.mp3, no longer matches it).
CONTENT.chapters['1a'].play2 = {
  title: 'Your turn to play',
  text: 'Time to make your own little tune! Here\'s how: start the groove, and play along! Any melody or sequence of notes, one note at a time, in any order and rhythm you like.',
  tips: ['Skip the black keys.', 'When the groove stops, end on <b>C</b>. Notice how it feels like landing home.'],
  caption: 'The groove plays C major: C, E, G',
  beats: repeat(C_MAJOR, 24), beatDur: 0.75 // about 18 seconds, enough time for a little tune
};

var L = (function () {
  var s = null;
  var ICON = {
    play: '<svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M6 4 L20 12 L6 20 Z"></path></svg>',
    stop: '<svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><rect x="5" y="5" width="14" height="14" rx="2"></rect></svg>',
    again: '<svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12 A8 8 0 1 0 7 5.8"></path><path d="M4 4 V9 H9"></path></svg>',
    bars: '<svg class="lbars" aria-hidden="true" width="30" height="22" viewBox="0 0 30 22"><rect x="1" y="8" width="4" height="6" rx="2"></rect><rect x="9" y="2" width="4" height="18" rx="2"></rect><rect x="17" y="5" width="4" height="12" rx="2"></rect><rect x="25" y="9" width="4" height="4" rx="2"></rect></svg>',
    close: '<svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M6 6 L18 18 M18 6 L6 18"></path></svg>',
    phones: '<svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 14 V12 A9 9 0 0 1 21 12 V14"></path><rect x="3" y="14" width="4" height="7" rx="1.5" fill="currentColor"></rect><rect x="17" y="14" width="4" height="7" rx="1.5" fill="currentColor"></rect></svg>',
    arrow: '<svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12 H19 M13 6 L19 12 L13 18"></path></svg>',
    check: '<svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12 L10 17 L19 7"></path></svg>',
    cross: '<svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><path d="M7 7 L17 17 M17 7 L7 17"></path></svg>',
    note: '<svg aria-hidden="true" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18 V5 L20 3 V16"></path><circle cx="6.5" cy="18" r="2.5"></circle><circle cx="17.5" cy="16" r="2.5"></circle></svg>',
    cheer: '<svg aria-hidden="true" width="64" height="76" viewBox="0 0 64 76"><line x1="46" y1="52" x2="46" y2="8" stroke="#F5B841" stroke-width="4.5" stroke-linecap="round"></line><path d="M46 8 C48 22 62 26 58 44 C58 32 51 28 46 26 Z" fill="#F5B841"></path><ellipse cx="27" cy="57" rx="22" ry="16" transform="rotate(-18 27 57)" fill="#F5B841"></ellipse><path d="M17 52 Q20 48 23 52" fill="none" stroke="#1A1300" stroke-width="2.2" stroke-linecap="round"></path><path d="M29 49 Q32 45 35 49" fill="none" stroke="#1A1300" stroke-width="2.2" stroke-linecap="round"></path><path d="M20 61 Q28 68 37 58" fill="none" stroke="#1A1300" stroke-width="2.4" stroke-linecap="round"></path><path d="M8 50 L2 40" stroke="#F5B841" stroke-width="4" stroke-linecap="round"></path></svg>'
  };

  function ch() { return CONTENT.chapters[s.id]; }
  function cur() { return s.list[s.i]; }
  function songIndex(name) { return name.indexOf('song') === 0 ? Number(name.slice(4)) : -1; }
  function stepOf(name) { return songIndex(name) >= 0 ? 1 : { idea: 0, demo: 0, ear: 2, play: 3, recap: 4 }[name]; }

  /* ---------- Voice: the note reads the screen's text aloud ---------- */
  function voiceFor(name) {
    var c = ch();
    var v = name === 'idea' ? c.voice && { url: c.voice.audio, words: (c.voice.skipHeadline ? c.explain : [c.headline].concat(c.explain)).join(' ') }
      : name === 'song0' ? c.listenVoice && { url: c.listenVoice.audio, words: c.listenIntro }
      : name === 'ear' ? (hasGuide(c.choose) && s.round === 1 && !s.picked) && { url: c.choose.voice.audio, words: c.choose.intro }
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
    if (v.url) { Voice.play(AUDIO_BASE + v.url, v.words, begin, finish); } else { Voice.speak(v.words, begin, finish); }
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
    if (id === 'play') { s.playGroove = true; ch().play.ready(); light(C_MAJOR.notes, ch().play2.caption); }
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
  function goTo(i) {
    stopAll();
    s.i = i; s.voice = 'idle'; s.spotOpen = null; s.groove = null;
    var name = cur();
    Progress.reach(s.id, stepOf(name));
    state.lit = []; state.caption = '';
    if (name === 'demo') { state.lit = C_MAJOR.notes; state.caption = 'Home: C major (C, E, G)'; }
    if (name === 'ear') { setupEar(); }
    if (name === 'play') { state.lit = C_MAJOR.notes; state.caption = ch().play2.caption; }
    render();
    window.scrollTo(0, 0);
    // Without a voice guide, the first chords play as soon as the ear training opens.
    if (name === 'ear' && !voiceFor('ear')) { ask(); }
  }
  function canContinue(name) {
    var si = songIndex(name);
    if (name === 'idea') { return !voiceFor('idea') || !!s.heard.idea || !!s.read.idea; }
    if (name === 'demo') { return s.demoPlayed; }
    if (si >= 0) { var sg = s.songs['song' + si] || {}; return !!sg.real || (!!sg.groove && !ch().songs[si].url); }
    if (name === 'play') { return s.playGroove; }
    return true;
  }

  /* ---------- Drawing ---------- */
  function topHtml() {
    var pct = Math.max(4, Math.round(s.i / (s.list.length - 1) * 100));
    return '<div class="ltop"><button type="button" class="lx" data-act="l-close" aria-label="Close lesson">' + ICON.close + '</button>' +
      '<div class="lbar" role="progressbar" aria-label="Lesson progress" aria-valuemin="0" aria-valuemax="100" aria-valuenow="' + pct + '"><div style="width: ' + pct + '%"></div></div></div>';
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
  function bottomHtml(label, on, act) {
    return '<div class="lbottom" id="lbottom"><button type="button" class="lgo' + (on ? ' on' : '') + '" data-act="' + (act || 'l-next') + '"' + (on ? '' : ' aria-disabled="true"') + '>' + label + '</button></div>';
  }
  /* The note on its couch, in the middle of the screen. The whole note is the button: before listening it bobs,
     its mouth moves as if about to speak and a "..." bubble shows; while speaking it talks and the bubble shows
     sound bars; once heard it smiles and the bubble offers a replay. No text label: a small hint shows until the first tap. */
  var NOTE_SCENE =
    '<line x1="20" y1="190" x2="300" y2="190" stroke="#2B3A52" stroke-width="3" stroke-linecap="round"></line>' +
    '<circle cx="262" cy="52" r="17" fill="none" stroke="#4A5E7E" stroke-width="3"></circle><path d="M262 42 V52 L270 57" fill="none" stroke="#4A5E7E" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"></path>' +
    '<rect x="66" y="84" width="188" height="76" rx="18" fill="#2B3A52"></rect><rect x="50" y="138" width="220" height="40" rx="14" fill="#3A4C69"></rect><rect x="40" y="114" width="34" height="66" rx="14" fill="#44587A"></rect><rect x="246" y="114" width="34" height="66" rx="14" fill="#44587A"></rect><rect x="62" y="178" width="10" height="12" rx="2" fill="#2B3A52"></rect><rect x="248" y="178" width="10" height="12" rx="2" fill="#2B3A52"></rect>' +
    '<g class="nbody"><line x1="182" y1="112" x2="182" y2="40" stroke="#F5B841" stroke-width="5" stroke-linecap="round"></line><path d="M182 40 C184 58 206 62 200 86 C200 72 190 66 182 64 Z" fill="#F5B841" stroke="#F5B841" stroke-width="2" stroke-linejoin="round"></path><ellipse cx="160" cy="120" rx="27" ry="21" transform="rotate(-18 160 120)" fill="#F5B841"></ellipse><circle cx="151" cy="116" r="2.8" fill="#1A1300"></circle><circle cx="166" cy="112" r="2.8" fill="#1A1300"></circle>' +
    '<path class="nsmile" d="M152 126 Q161 133 171 123" fill="none" stroke="#1A1300" stroke-width="2.4" stroke-linecap="round"></path><ellipse class="nmouth" cx="161" cy="127" rx="5.5" ry="4.5" fill="#1A1300" transform="rotate(-18 161 127)"></ellipse>' +
    '<path d="M150 139 L141 150 L133 150" fill="none" stroke="#F5B841" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"></path><path d="M168 139 L162 151 L154 151" fill="none" stroke="#F5B841" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"></path>' +
    '<path class="nbub" d="M96 28 H136 Q146 28 146 38 V52 Q146 62 136 62 H124 L138 78 L112 62 H96 Q86 62 86 52 V38 Q86 28 96 28 Z"></path>' +
    '<g class="ndots"><circle cx="102" cy="45" r="4.2"></circle><circle cx="116" cy="45" r="4.2"></circle><circle cx="130" cy="45" r="4.2"></circle></g>' +
    '<g class="nbars"><rect x="100" y="41" width="4" height="8" rx="2"></rect><rect x="108" y="35" width="4" height="20" rx="2"></rect><rect x="116" y="38" width="4" height="14" rx="2"></rect><rect x="124" y="42" width="4" height="6" rx="2"></rect></g>' +
    '<path class="nagain" d="M109 45 A7 7 0 1 0 111.5 39.6 M109 36 V40.5 H113.5" fill="none" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"></path></g>';
  var HINT_KEY = 'homekey.noteTapped';
  function noteTapped() { try { return localStorage.getItem(HINT_KEY) === '1'; } catch (e) { return true; } }
  function ideaHtml() {
    var c = ch(), shown = textShown('idea'), v = s.voice;
    var st = v === 'speaking' ? 'speaking' : v === 'loading' ? 'loading' : (s.heard.idea || s.read.idea) ? 'heard' : 'idle';
    var label = st === 'speaking' || st === 'loading' ? 'Stop the note' : st === 'heard' ? 'Hear the note again' : 'Tap the note to listen';
    var h = '<h1 class="lh">' + esc(c.headline) + '</h1>';
    h += '<div class="lstage"><button type="button" class="lnote" data-act="l-speak" data-state="' + st + '" aria-label="' + label + '">' +
      '<svg aria-hidden="true" viewBox="30 10 260 190">' + NOTE_SCENE + '</svg></button>' +
      '<div class="lhint">' + (st === 'idle' && !noteTapped() ? 'Tap the note' : '') + '</div></div>';
    h += '<div class="lsubs" aria-live="polite">' + (shown ? c.explain.map(function (p) { return '<p>' + esc(p) + '</p>'; }).join('') : '') + '</div>';
    h += '<div class="llinkslot">' + readLink('idea') + '</div>'; // a fixed slot, so nothing moves when the link goes away
    return h + bottomHtml('Continue', canContinue('idea'));
  }
  function demoHtml() {
    var h = '<h1 class="lh">Hear a home chord</h1><p class="lp">Tap play and notice how settled it sounds.</p>';
    h += '<div class="lcenter"><button type="button" class="lround' + (s.demoPlayed ? '' : ' primary') + '" data-act="l-demo" aria-label="' + (s.demoPlayed ? 'Play the home chord again' : 'Play the home chord') + '">' + (s.demoPlayed ? ICON.again : ICON.play) + '</button>' +
      '<div class="lroundlbl' + (s.demoPlayed ? '' : ' on') + '">' + (s.demoPlayed ? 'Play it again' : 'Play the home chord') + '</div></div>';
    h += keyboardHtml();
    return h + bottomHtml('Continue', canContinue('demo'));
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
    var h = '<h1 class="lh">' + (i === 0 ? 'Hear it in a song' : 'One more song') + '</h1>';
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
    var h = '<div class="spread"><div class="eyebrow">Ear training</div>' + dotsHtml(c.rounds, s.results, s.round) + '</div>';
    h += '<h1 class="lh">' + esc(c.choose.prompt) + '</h1>';
    if (voiceFor('ear')) {
      h += '<div class="lsub">' + (textShown('ear') ? '<p>' + esc(c.choose.intro) + '</p>' : '') + '</div><div class="lguide">' + pillHtml('ear') + '</div>';
    }
    if (picked) {
      h += keyboardHtml();
    } else {
      h += '<div class="lcenter">' + (s.listening
        ? '<div class="lround listen" role="status" aria-label="Listening">' + ICON.bars + '</div>'
        : !s.asked
          ? '<button type="button" class="lround' + (waitVoice ? '' : ' primary') + '" data-act="l-ask" aria-label="Play the chords">' + ICON.play + '</button><div class="lroundlbl' + (waitVoice ? '' : ' on') + '">Play the chords</div>'
          : '<button type="button" class="llink strong" data-act="l-ask">' + ICON.again + esc(c.choose.replay) + '</button>') + '</div>';
    }
    h += '<div class="choices' + (c.choose.options.length > 2 ? ' three' : '') + (s.asked && !s.listening && !picked ? ' go' : '') + '">';
    c.choose.options.forEach(function (o) {
      var cls = !picked ? '' : (s.q.q === o.q ? ' right' : (picked === o.q ? ' wrong' : ' dim'));
      h += '<button type="button" class="choice' + cls + '" data-act="l-pick" data-q="' + o.q + '">' + (o.icon ? '<span class="emo' + (o.iconWhite ? ' white' : '') + '" aria-hidden="true">' + o.icon + '</span>' : '') + '<b>' + esc(o.label) + '</b><span>' + esc(o.sub) + '</span></button>';
    });
    h += '</div>';
    if (!picked) {
      h += '<button type="button" class="llink" data-act="l-skip">Skip the ear training</button>';
      return h + bottomHtml('Continue', false);
    }
    var good = picked === s.q.q, last = s.round >= c.rounds;
    var words = c.choose.verdict(s.q, good).replace(/^(Correct|Not quite): /, '');
    words = words.charAt(0).toUpperCase() + words.slice(1);
    return h + '<div class="lfeed ' + (good ? 'good' : 'bad') + '" id="lbottom" role="status"><div class="lfrow"><div class="lfic">' + (good ? ICON.check : ICON.cross) + '</div><div><div class="lft">' + (good ? 'Correct!' : 'Not quite') + '</div><div class="lfs">' + esc(words) + '</div></div></div>' +
      '<button type="button" class="lgo on" data-act="l-round">' + (last ? 'Continue' : 'Next round' + ICON.arrow) + '</button></div>';
  }
  function playHtml() {
    var p = ch().play2;
    var h = '<h1 class="lh">' + esc(p.title) + '</h1><p class="lp">' + esc(p.text) + '</p>';
    h += '<div class="ltips"><div class="eyebrow">Tips for a pro sound</div>' + p.tips.map(function (t) { return '<div class="ltip"><span></span><div>' + t + '</div></div>'; }).join('') + '</div>';
    h += '<div class="grow"></div>' + keyboardHtml().replace('<div class="kb">', '<div class="lend" aria-hidden="true"><span>End here</span></div><div class="kb">');
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
  function recapHtml() {
    var c = ch(), n = nextChapter(), got = s.results.filter(Boolean).length;
    var h = '<div class="lwin">' + ICON.cheer + '<div><h1 class="lh">Chapter ' + esc(s.id) + ' done!</h1>' +
      (s.results.length ? '<div class="lgot">You got ' + got + ' of ' + s.results.length + ' by ear.</div>' : '') + '</div></div>';
    if (s.results.length) { h += dotsHtml(s.results.length, s.results, 0); }
    h += '<div class="lcard"><div class="spread"><div class="eyebrow">To remember</div>' + pillHtml('recap', true) + '</div>' +
      c.recap.map(function (r) { return '<div class="ltip"><span></span><div>' + esc(r) + '</div></div>'; }).join('') + '</div>';
    h += '<div class="grow"></div><button type="button" class="llink" data-act="l-again">Do this chapter again</button>';
    return h + (n ? bottomHtml('Next: ' + esc(n.id) + ', ' + esc(n.title), true, 'l-nextch') : bottomHtml('Back to your path', true, 'l-close'));
  }
  function html() {
    var name = cur(), si = songIndex(name);
    var body = name === 'idea' ? ideaHtml() : name === 'demo' ? demoHtml() : si >= 0 ? songHtml(si) : name === 'ear' ? earHtml() : name === 'play' ? playHtml() : recapHtml();
    return '<div class="lesson">' + topHtml() + body + '</div>';
  }
  // Redraws the screen, except where a Spotify player is open: then only its buttons and Continue change.
  function refresh() {
    if (!s || state.view !== 'lesson') { return; }
    var si = songIndex(cur());
    if (si >= 0 && s.spotOpen === si) {
      var ctl = document.getElementById('song-ctl'); if (ctl) { ctl.innerHTML = songCtlHtml(si); }
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
    else if (act === 'l-read') { s.read[name] = true; refresh(); }
    else if (act === 'l-next') { if (canContinue(name) && s.i < s.list.length - 1) { if (name === 'play') { Progress.complete(s.id); } goTo(s.i + 1); } }
    else if (act === 'l-demo') { stopAll(); c.demo(); s.demoPlayed = true; refresh(); }
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
      s.songs['song' + pi].real = true; s.spotOpen = pi;
      refresh();
      var box = document.getElementById('spot-' + pi);
      Spotify.open(box, sp.spotifyId, function () {
        box.innerHTML = '<a class="spotify" href="' + sp.url + '" target="_blank" rel="noopener">Open the real song on Spotify ↗</a>';
      });
    }
    else if (act === 'l-link') { var li = Number(el.getAttribute('data-i')); stopAll(); s.songs['song' + li].real = true; setTimeout(refresh, 300); return 'follow'; }
    else if (act === 'l-ask') { if (!s.picked) { ask(); } else { c.choose.play(s.q); } }
    else if (act === 'l-pick') {
      if (s.picked || !s.asked) { return; }
      s.picked = el.getAttribute('data-q'); s.listening = false;
      s.results.push(s.picked === s.q.q);
      render();
      c.choose.reveal(s.q);
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
    else if (act === 'l-nextch') { var nx = nextChapter(); s = null; if (nx) { startChapter(nx.id); } }
  }

  return { start: start, html: html, click: click, onStop: onStop, onHush: onHush, refresh: refresh, active: function () { return !!s; }, debug: function () { return s; } };
})();
