// 警报音效：基于 Web Audio API 合成的双音循环警报器，无需外部音频资源。
// 振荡器频率在 620Hz / 880Hz 间往复（近似防空警报双音），经低通滤波柔化。

export default class Siren {
  constructor() {
    this.ctx = null;
    this.osc = null;
    this.lfo = null;
    this.gain = null;
    this.playing = false;
  }

  async start() {
    if (this.playing) return;

    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return; // 浏览器不支持时静默降级

    if (!this.ctx) this.ctx = new AudioCtx();
    if (this.ctx.state === 'suspended') {
      try {
        await this.ctx.resume();
      } catch {
        return;
      }
    }

    const now = this.ctx.currentTime;

    // 主音调
    this.osc = this.ctx.createOscillator();
    this.osc.type = 'sawtooth';
    this.osc.frequency.setValueAtTime(620, now);

    // 用低频振荡器对主频率做双音调制：0.625Hz ≈ 1.6s 一个来回
    this.lfo = this.ctx.createOscillator();
    this.lfo.type = 'sine';
    this.lfo.frequency.value = 0.625;
    const lfoGain = this.ctx.createGain();
    lfoGain.gain.value = 260; // 620Hz ± 260 → 360~880Hz
    this.lfo.connect(lfoGain);
    lfoGain.connect(this.osc.frequency);

    // 音量 + 低通滤波，避免锯齿波过于刺耳
    this.gain = this.ctx.createGain();
    this.gain.gain.setValueAtTime(0.0001, now);
    this.gain.gain.exponentialRampToValueAtTime(0.14, now + 0.4);

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 1500;

    this.osc.connect(this.gain);
    this.gain.connect(filter);
    filter.connect(this.ctx.destination);

    this.osc.start();
    this.lfo.start();
    this.playing = true;
  }

  stop() {
    if (!this.playing || !this.ctx) return;
    const now = this.ctx.currentTime;
    this.gain.gain.cancelScheduledValues(now);
    this.gain.gain.setValueAtTime(Math.max(this.gain.gain.value, 0.0001), now);
    this.gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.25);

    const { osc, lfo } = this;
    window.setTimeout(() => {
      try {
        osc.stop();
        lfo.stop();
      } catch {
        // 节点可能已被回收
      }
    }, 300);
    this.playing = false;
  }
}
