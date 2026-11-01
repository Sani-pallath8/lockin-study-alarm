import { AlarmSoundType, AmbientSoundType } from '../types';

class AudioService {
  private ctx: AudioContext | null = null;
  private ambientSource: AudioNode | null = null;
  private ambientGain: GainNode | null = null;
  private currentAmbientType: AmbientSoundType = 'none';

  private getContext(): AudioContext {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  // Play a crack sound when tapping the loot box / egg
  playCrackSound(step: number = 1) {
    try {
      const ctx = this.getContext();
      const now = ctx.currentTime;

      // Noise burst for crunchy physical snap
      const bufferSize = ctx.sampleRate * (0.05 + step * 0.03);
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.25));
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      // Bandpass filter to make it sound like wood/eggshell/hard gift box cracking
      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(600 + step * 400, now);
      filter.Q.setValueAtTime(3 + step * 2, now);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.5 + step * 0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + bufferSize / ctx.sampleRate);

      // Pitch pop
      const osc = ctx.createOscillator();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(220 + step * 90, now);
      osc.frequency.exponentialRampToValueAtTime(70, now + 0.08);

      const oscGain = ctx.createGain();
      oscGain.gain.setValueAtTime(0.4, now);
      oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.connect(oscGain);
      oscGain.connect(ctx.destination);

      noise.start(now);
      osc.start(now);
      osc.stop(now + 0.09);
    } catch {
      // AudioContext unavailable
    }
  }

  // Fanfare when cracking open the reward
  playFanfare() {
    try {
      const ctx = this.getContext();
      const now = ctx.currentTime;
      // Ascending major pentatonic notes: C5, E5, G5, A5, C6
      const notes = [523.25, 659.25, 783.99, 880.0, 1046.5];

      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = idx === notes.length - 1 ? 'triangle' : 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.09);

        const startTime = now + idx * 0.09;
        const dur = idx === notes.length - 1 ? 0.8 : 0.25;

        gain.gain.setValueAtTime(0.0001, startTime);
        gain.gain.linearRampToValueAtTime(0.3, startTime + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, startTime + dur);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(startTime);
        osc.stop(startTime + dur);
      });
    } catch {
      // Ignore
    }
  }

  // Play task checkbox tick sound
  playCheckSound() {
    try {
      const ctx = this.getContext();
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.08);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.09);
    } catch {
      // Ignore
    }
  }

  // Play chosen alarm
  playAlarm(sound: AlarmSoundType, volume = 0.8) {
    try {
      const ctx = this.getContext();
      const now = ctx.currentTime;

      switch (sound) {
        case 'radar': {
          // Double sonar radar ping
          [0, 0.28].forEach((delay) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(1046.5, now + delay); // C6
            gain.gain.setValueAtTime(volume * 0.4, now + delay);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + delay + 0.25);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(now + delay);
            osc.stop(now + delay + 0.26);
          });
          break;
        }

        case 'gentle': {
          // Soft warm chime
          const notes = [587.33, 739.99, 880.0]; // D5, F#5, A5
          notes.forEach((freq, idx) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, now + idx * 0.12);
            gain.gain.setValueAtTime(volume * 0.35, now + idx * 0.12);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.12 + 0.6);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(now + idx * 0.12);
            osc.stop(now + idx * 0.12 + 0.65);
          });
          break;
        }

        case 'urgent': {
          // Rapid alternating beeps
          for (let i = 0; i < 4; i++) {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'square';
            const freq = i % 2 === 0 ? 880 : 1174.66;
            osc.frequency.setValueAtTime(freq, now + i * 0.11);
            gain.gain.setValueAtTime(volume * 0.25, now + i * 0.11);
            gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.11 + 0.08);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(now + i * 0.11);
            osc.stop(now + i * 0.11 + 0.09);
          }
          break;
        }

        case 'bell': {
          // Deep resonant singing bowl / bell
          const osc = ctx.createOscillator();
          const osc2 = ctx.createOscillator();
          const gain = ctx.createGain();

          osc.type = 'sine';
          osc.frequency.setValueAtTime(432, now);
          osc2.type = 'sine';
          osc2.frequency.setValueAtTime(436, now); // beats

          gain.gain.setValueAtTime(volume * 0.5, now);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.6);

          osc.connect(gain);
          osc2.connect(gain);
          gain.connect(ctx.destination);

          osc.start(now);
          osc2.start(now);
          osc.stop(now + 1.7);
          osc2.stop(now + 1.7);
          break;
        }

        case 'retro': {
          // 8-bit arpeggio
          [440, 554.37, 659.25, 880].forEach((freq, idx) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(freq, now + idx * 0.07);
            gain.gain.setValueAtTime(volume * 0.2, now + idx * 0.07);
            gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.07 + 0.06);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(now + idx * 0.07);
            osc.stop(now + idx * 0.07 + 0.07);
          });
          break;
        }
      }
    } catch {
      // AudioContext unavailable
    }
  }

  // Voice speech synthesis
  speakMotivation(customPhrase?: string) {
    if (!('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel(); // cancel any pending speech
      const text = customPhrase || "Are you studying right now? Put your phone down and lock in!";
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.05;
      utterance.pitch = 1.0;
      utterance.volume = 0.9;
      window.speechSynthesis.speak(utterance);
    } catch {
      // Speech synthesis failed or blocked
    }
  }

  // Start procedural ambient focus sounds
  setAmbientSound(type: AmbientSoundType, volume = 0.4) {
    this.stopAmbient();
    if (type === 'none') {
      this.currentAmbientType = 'none';
      return;
    }

    try {
      const ctx = this.getContext();
      this.currentAmbientType = type;

      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(volume, ctx.currentTime);
      masterGain.connect(ctx.destination);
      this.ambientGain = masterGain;

      if (type === 'brown' || type === 'pink' || type === 'rain') {
        // Generate 5-second seamless noise buffer
        const bufferSize = ctx.sampleRate * 5;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);

        let lastOut = 0.0;
        let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;

        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;

          if (type === 'brown') {
            // Brown noise (ADHD study favorite)
            lastOut = (lastOut + 0.02 * white) / 1.02;
            data[i] = lastOut * 3.5;
          } else if (type === 'pink') {
            // Pink noise (1/f)
            b0 = 0.99886 * b0 + white * 0.0555179;
            b1 = 0.99332 * b1 + white * 0.0750759;
            b2 = 0.96900 * b2 + white * 0.1538520;
            b3 = 0.86650 * b3 + white * 0.3104856;
            b4 = 0.55000 * b4 + white * 0.5329522;
            b5 = -0.7616 * b5 - white * 0.0168980;
            data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
            b6 = white * 0.115926;
          } else {
            // Rain: blend of filtered noise with dynamic drops
            lastOut = (lastOut + 0.05 * white) / 1.05;
            const drop = Math.random() > 0.997 ? (Math.random() * 0.3) : 0;
            data[i] = (lastOut * 2.2 + drop) * 0.35;
          }
        }

        const noise = ctx.createBufferSource();
        noise.buffer = buffer;
        noise.loop = true;

        if (type === 'rain') {
          const filter = ctx.createBiquadFilter();
          filter.type = 'lowpass';
          filter.frequency.setValueAtTime(1400, ctx.currentTime);
          noise.connect(filter);
          filter.connect(masterGain);
        } else {
          noise.connect(masterGain);
        }

        noise.start(0);
        this.ambientSource = noise;
      } else if (type === 'binaural') {
        // 40Hz Gamma focus binaural tone (200Hz left, 240Hz right)
        const merger = ctx.createChannelMerger(2);

        const oscL = ctx.createOscillator();
        oscL.type = 'sine';
        oscL.frequency.setValueAtTime(200, ctx.currentTime);

        const oscR = ctx.createOscillator();
        oscR.type = 'sine';
        oscR.frequency.setValueAtTime(240, ctx.currentTime);

        const gainL = ctx.createGain();
        gainL.gain.setValueAtTime(0.18, ctx.currentTime);
        const gainR = ctx.createGain();
        gainR.gain.setValueAtTime(0.18, ctx.currentTime);

        oscL.connect(gainL);
        gainL.connect(merger, 0, 0); // left channel

        oscR.connect(gainR);
        gainR.connect(merger, 0, 1); // right channel

        merger.connect(masterGain);

        oscL.start();
        oscR.start();

        this.ambientSource = merger;
      }
    } catch {
      // AudioContext unavailable
    }
  }

  setAmbientVolume(vol: number) {
    if (this.ambientGain && this.ctx) {
      try {
        this.ambientGain.gain.setValueAtTime(vol, this.ctx.currentTime);
      } catch {
        // Ignore
      }
    }
  }

  stopAmbient() {
    if (this.ambientSource) {
      try {
        if ('stop' in this.ambientSource && typeof (this.ambientSource as AudioScheduledSourceNode).stop === 'function') {
          (this.ambientSource as AudioScheduledSourceNode).stop();
        }
        this.ambientSource.disconnect();
      } catch {
        // Ignore
      }
      this.ambientSource = null;
    }
    if (this.ambientGain) {
      try {
        this.ambientGain.disconnect();
      } catch {
        // Ignore
      }
      this.ambientGain = null;
    }
    this.currentAmbientType = 'none';
  }

  getCurrentAmbientType(): AmbientSoundType {
    return this.currentAmbientType;
  }
}

export const audioService = new AudioService();
