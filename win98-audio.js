/**
 * win98-audio.js
 * Audio utilities for the Win98 desktop environment.
 */

let _audioCtx2 = null;
export function playTypingClick() {
  try {
    if (!_audioCtx2) _audioCtx2 = new (window.AudioContext||window.webkitAudioContext)();
    const ctx = _audioCtx2;
    const buf = ctx.createBuffer(1, ctx.sampleRate*0.03, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i=0; i<data.length; i++) data[i]=(Math.random()*2-1)*Math.exp(-i/(data.length*0.15));
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const gain = ctx.createGain(); gain.gain.value = 0.08;
    src.connect(gain); gain.connect(ctx.destination);
    src.start();
  } catch(e) {}
}

let _audioCtx = null;
export function getAudioCtx() {
  if (!_audioCtx) try { _audioCtx = new (window.AudioContext||window.webkitAudioContext)(); } catch(e) {}
  return _audioCtx;
}

export function playDialup() {
  try {
    const ctx = getAudioCtx(); if (!ctx) return;
    const tones = [1000,2200,1600,800,2400,1100,1800,900,2600];
    let t = ctx.currentTime;
    tones.forEach(freq => {
      const osc=ctx.createOscillator(), gain=ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      osc.frequency.value=freq;
      gain.gain.setValueAtTime(0.06,t); gain.gain.exponentialRampToValueAtTime(0.001,t+0.18);
      osc.start(t); osc.stop(t+0.18); t+=0.14;
    });
  } catch(e) {}
}
