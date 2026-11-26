/* ---------- Intro: meet Cady (backlog #19) ----------
   A one-minute stop before 1a: five short screens in the same one-action design as the lessons.
   1 hello (tap Cady), 2 sound check (tap a key), 3 how a chapter works, 4 piano nearby?, 5 off we go.
   Cady's lines are ElevenLabs recordings in this folder. Screen 1 waits for a tap on Cady; screens 2 to 5
   are reached by a tap on Continue, so their line starts by itself. Designs: "HomeKey lesson screens",
   row "Meet Cady · intro before 1a". Loaded after lesson.js and reuses its CSS and Cady drawing. */
var Intro = (function () {
  var DONE_KEY = 'homekey.introDone', PIANO_KEY = 'homekey.hasPiano';
  var SCREENS = [
    { id: 'hello', title: 'Meet Cady', voice: 'voice-intro-1-hello.mp3',
      words: 'Hi! I\'m Cady, your music guide. Whenever you see me with my little dots, tap me and I\'ll tell you something.' },
    { id: 'sound', title: 'Can you hear me?', voice: 'voice-intro-2-sound.mp3',
      words: 'First, let\'s make sure you can hear me. Tap any key on the piano.',
      after: { voice: 'voice-intro-2-sound-ok.mp3', words: 'Lovely! Your sound works.' } },
    { id: 'how', title: 'One small idea per chapter', voice: 'voice-intro-3-how.mp3',
      words: 'Every chapter teaches one small idea, in five short steps. I explain it, you hear it in real songs, you train your ear, then you play it yourself. And we wrap up together.',
      shown: 'Every chapter teaches one small idea, in five short steps.',
      // When each step's phrase starts in voice-intro-3-how.mp3, in seconds ("I explain it", "you hear it in real songs", ...).
      // Measured from the pauses in this recording: measure again if the line is re-recorded.
      cues: [4.6, 5.75, 7.7, 8.95, 10.75], cuesEnd: 12.4 },
    { id: 'piano', title: 'Do you have a piano nearby?', voice: 'voice-intro-4-piano.mp3',
      words: 'Do you have a real piano nearby? A digital one counts too!',
      after: { voice: 'voice-intro-4-piano-ok.mp3', words: 'No problem either way. You can always play on the keys in the app.' } },
    { id: 'ready', title: 'Ready?', voice: 'voice-intro-5-ready.mp3',
      words: 'Ready? Let\'s start with your first chapter: One chord, home.' }
  ];
  var STEPS = [['💡', 'Idea', 'I explain one small idea.'], ['🎵', 'Songs', 'You hear it in real songs.'],
    ['👂', 'Ear training', 'You train your ear.'], ['🎹', 'Play', 'You play it yourself.'], ['📌', 'Recap', 'We wrap up together.']];
  var s = null, timers = [], ticker = null;

  function isDone() { try { return localStorage.getItem(DONE_KEY) === '1'; } catch (e) { return false; } }
  function setDone(on) { try { if (on) { localStorage.setItem(DONE_KEY, '1'); } else { localStorage.removeItem(DONE_KEY); localStorage.removeItem(PIANO_KEY); } } catch (e) {} }
  function cur() { return SCREENS[s.i]; }
  function clearTimers() { timers.forEach(clearTimeout); timers = []; clearInterval(ticker); ticker = null; if (s) { s.lit = -1; } }
  /* Screen 3: the step box Cady is talking about lights up, following the clip's own clock (so a slow start
     or a pause doesn't throw it off). Only with the recording; the built-in voice fallback lights nothing. */
  function followCues() {
    var sc = cur();
    ticker = setInterval(function () {
      if (!s || cur() !== sc) { clearInterval(ticker); return; }
      var t = s.voice === 'speaking' ? Voice.clipTime() : -1, k = -1;
      if (t >= 0 && t < sc.cuesEnd) { sc.cues.forEach(function (c, j) { if (t >= c) { k = j; } }); }
      if (k !== s.lit) {
        s.lit = k;
        document.querySelectorAll('.istep').forEach(function (el, j) { el.classList.toggle('on', j === k); });
      }
    }, 100);
  }

  /* ---------- Cady's voice: 'idle' | 'loading' | 'speaking'; heard once it ends or is stopped ---------- */
  function say(line, key) {
    Voice.stop(); clearTimers(); // not stopAll: a piano note may still be ringing
    var i = s.i;
    s.voice = 'loading'; s.saying = key; refresh();
    var begin = function () { if (s && s.i === i && s.voice === 'loading') { s.voice = 'speaking'; refresh(); } };
    var finish = function () { if (s && s.i === i && s.voice !== 'idle') { ended(); } };
    timers.push(setTimeout(begin, 4000)); // some browsers never report the start
    Voice.play(line.voice, line.words, begin, finish);
    if (line.cues) { followCues(); }
  }
  function ended() { s.voice = 'idle'; s.heard[s.saying] = true; s.saying = null; refresh(); }
  function tapCady() {
    if (s.voice !== 'idle') { Voice.stop(); ended(); return; }
    var sc = cur();
    // After the answer on screens 2 and 4, Cady repeats her reply; before it, her question.
    say(sc.after && s.answered[sc.id] ? sc.after : sc, sc.after && s.answered[sc.id] ? sc.id + '-ok' : sc.id);
  }
  // Called by app.js when a piano key or another sound hushes the voice.
  function onHush() {
    if (s && state.view === 'intro' && s.voice !== 'idle') { ended(); }
  }

  /* ---------- Moving through the screens ---------- */
  function start() {
    s = { lit: -1, i: 0, voice: 'idle', saying: null, heard: {}, read: false, answered: {}, piano: null };
    state.lit = []; state.caption = '';
    go('intro');
    render();
  }
  function goTo(i, back) {
    stopAll(); clearTimers();
    s.i = i; s.voice = 'idle'; s.saying = null;
    state.lit = []; state.caption = '';
    render();
    window.scrollTo(0, 0);
    if (i > 0 && !back) { say(cur(), cur().id); } // reached by a tap on Continue, so the browser lets her speak right away
    if (back && cur().id === 'sound' && s.answered.sound) { light(s.soundNote ? [s.soundNote] : [], ''); }
  }
  function canContinue() {
    var id = cur().id;
    if (id === 'hello') { return !!s.heard.hello || s.read; }
    if (id === 'sound' || id === 'piano') { return !!s.answered[id]; }
    return !!s.heard[id]; // 'how' and 'ready': once Cady has finished (or been stopped with a tap)
  }
  // A piano key on the sound-check screen: the note plays (app.js), then Cady confirms.
  function onKey(note) {
    if (!s || state.view !== 'intro' || cur().id !== 'sound') { return; }
    if (!s.answered.sound) {
      s.answered.sound = true; s.soundNote = note;
      light([note], '');
      refresh();
      var i = s.i;
      timers.push(setTimeout(function () { if (s && s.i === i) { say(cur().after, 'sound-ok'); } }, 700));
    }
  }

  /* ---------- Drawing ---------- */
  function cadyState(key) {
    return s.voice === 'speaking' ? 'speaking' : s.voice === 'loading' ? 'loading' : s.heard[key] ? 'heard' : 'idle';
  }
  function bigCady() {
    var st = cadyState('hello'), label = st === 'idle' ? 'Tap Cady to listen' : st === 'heard' ? 'Hear Cady again' : 'Stop Cady';
    return '<div class="lstage"><button type="button" class="lnote" data-act="i-speak" data-state="' + st + '" aria-label="' + label + '">' +
      '<svg aria-hidden="true" viewBox="30 10 260 190">' + L.scene + '</svg></button>' +
      '<div class="lhint">' + (st === 'idle' ? 'Tap Cady' : '') + '</div></div>';
  }
  function smallCady(text) {
    var sc = cur(), key = sc.after && s.answered[sc.id] ? sc.id + '-ok' : sc.id;
    var st = s.voice !== 'idle' ? cadyState(key) : (s.heard[key] || s.heard[sc.id] ? 'heard' : 'idle');
    var label = st === 'speaking' || st === 'loading' ? 'Stop Cady' : 'Hear Cady again';
    return '<div class="irow"><button type="button" class="lnote ismall" data-act="i-speak" data-state="' + st + '" aria-label="' + label + '">' +
      '<svg aria-hidden="true" viewBox="80 20 140 140">' + L.cady + '</svg></button><p class="lp">' + text + '</p></div>';
  }
  function topHtml() {
    var pct = [4, 25, 50, 75, 100][s.i];
    return '<div class="ltop"><button type="button" class="lx" data-act="i-close" aria-label="Close the intro"><svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M6 6 L18 18 M18 6 L6 18"></path></svg></button>' +
      (s.i > 0 ? '<button type="button" class="lx lback" data-act="i-back" aria-label="Back to the previous screen">' + '<svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12 H5 M11 6 L5 12 L11 18"></path></svg>' + '</button>' : '<span class="lx lback" aria-hidden="true"></span>')  // keeps the bar in place on screen 1 +
      '<div class="lbar" role="progressbar" aria-label="Intro progress" aria-valuemin="0" aria-valuemax="100" aria-valuenow="' + pct + '"><div style="width: ' + pct + '%"></div></div></div>';
  }
  function bottomHtml(label, on, act) {
    var skip = '<div class="lskipslot">' + (on ? '' : '<button type="button" class="llink lskip" data-act="i-skip">Skip</button>') + '</div>';
    return '<div class="lbottom"><button type="button" class="lgo' + (on ? ' on' : '') + '" data-act="' + (act || 'i-next') + '"' + (on ? '' : ' aria-disabled="true"') + '>' + label + '</button>' + skip + '</div>';
  }
  function body() {
    var sc = cur(), h = '<h1 class="lh">' + esc(sc.title) + '</h1>';
    if (sc.id === 'hello') {
      var shown = s.voice !== 'idle' || s.heard.hello || s.read;
      h += bigCady();
      h += '<div class="lsubs" aria-live="polite">' + (shown ? '<p>' + esc(sc.words) + '</p>' : '') + '</div>';
      h += '<div class="llinkslot">' + (shown ? '' : '<button type="button" class="llink" data-act="i-read">Can’t play sound? Read it instead</button>') + '</div>';
      return h + bottomHtml('Continue', canContinue());
    }
    if (sc.id === 'sound') {
      h += smallCady(esc(sc.words));
      h += '<div class="grow"></div><div class="icheck" aria-live="polite">' + (s.answered.sound ? '<span>✓ ' + esc(sc.after.words) + '</span>' : '') + '</div>';
      h += keyboardHtml();
      h += '<p class="lsmall">No sound? Check that your phone isn’t on silent.</p><div class="grow"></div>';
      return h + bottomHtml('Continue', canContinue());
    }
    if (sc.id === 'how') {
      h += smallCady(esc(sc.shown));
      h += '<div class="isteps">' + STEPS.map(function (x, j) {
        return '<div class="istep' + (j === s.lit ? ' on' : '') + '"><span class="ico" aria-hidden="true">' + x[0] + '</span><div><b>' + x[1] + '</b><span>' + x[2] + '</span></div></div>';
      }).join('') + '</div><div class="grow"></div>';
      return h + bottomHtml('Continue', canContinue());
    }
    if (sc.id === 'piano') {
      var a = s.piano;
      h += smallCady('A real piano or a digital one, at home?');
      h += '<div class="grow"></div><div class="choices">' +
        '<button type="button" class="choice' + (a === 'yes' ? ' right' : a ? ' dim' : '') + '" data-act="i-piano" data-a="yes"><span class="emo" aria-hidden="true">🎹</span><b>Yes, I do</b><span>real or digital</span></button>' +
        '<button type="button" class="choice' + (a === 'no' ? ' right' : a ? ' dim' : '') + '" data-act="i-piano" data-a="no"><span class="emo" aria-hidden="true">📱</span><b>Not right now</b><span>I’ll use the app</span></button></div>';
      h += '<p class="lsmall">' + (a ? esc(sc.after.words) : '') + '</p><div class="grow"></div>';
      return h + bottomHtml('Continue', canContinue());
    }
    h += '<div class="lstage"><button type="button" class="lnote" data-act="i-speak" data-state="' + cadyState('ready') + '" aria-label="Hear Cady again">' +
      '<svg aria-hidden="true" viewBox="30 10 260 190">' + L.scene + '</svg></button></div>';
    h += '<div class="lsubs"><p>Let’s start with your first chapter: <b class="iaccent">One chord, home</b>.</p></div>';
    return h + bottomHtml('Start chapter 1a', canContinue(), 'i-finish');
  }
  function html() { return '<div class="lesson intro">' + topHtml() + body() + '</div>'; }
  function refresh() {
    if (!s || state.view !== 'intro') { return; }
    var y = window.scrollY; render(); window.scrollTo(0, y);
  }

  /* ---------- Taps ---------- */
  function click(act, el) {
    if (act === 'i-close') { stopAll(); clearTimers(); s = null; go('path'); render(); }
    else if (act === 'i-speak') { tapCady(); }
    else if (act === 'i-skip') {
      if (s.i < SCREENS.length - 1) { goTo(s.i + 1); } else { stopAll(); clearTimers(); setDone(true); s = null; startChapter('1a'); }
    }
    else if (act === 'i-back') { if (s.i > 0) { goTo(s.i - 1, true); } } // no auto-voice: tap Cady to hear her again
    else if (act === 'i-read') { s.read = true; refresh(); }
    else if (act === 'i-next') { if (canContinue() && s.i < SCREENS.length - 1) { goTo(s.i + 1); } }
    else if (act === 'i-piano') {
      var first = !s.answered.piano;
      s.piano = el.getAttribute('data-a'); s.answered.piano = true;
      try { localStorage.setItem(PIANO_KEY, s.piano); } catch (e) {}
      if (first) { say(cur().after, 'piano-ok'); } else { refresh(); }
    }
    else if (act === 'i-finish' && canContinue()) { stopAll(); clearTimers(); setDone(true); s = null; startChapter('1a'); }
  }

  // True while Cady says "Lovely! Your sound works.": more key taps play their notes but don't cut her off.
  function keepsVoice() { return !!s && state.view === 'intro' && s.saying === 'sound-ok' && s.voice !== 'idle'; }

  return { keepsVoice: keepsVoice, start: start, html: html, click: click, onHush: onHush, onKey: onKey, isDone: isDone, setDone: setDone, debug: function () { return s; } };
})();
