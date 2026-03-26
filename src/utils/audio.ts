/**
 * Buildicy Apex Audio Utility
 * Synthetic sound generation using Web Audio API
 */

class BuildicyAudio {
    private ctx: AudioContext | null = null;

    private init() {
        if (!this.ctx) {
            this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
        }
        if (this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    playTone(freq: number, type: OscillatorType = 'sine', duration: number = 0.1, volume: number = 0.1) {
        try {
            this.init();
            if (!this.ctx) return;

            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = type;
            osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

            gain.gain.setValueAtTime(volume, this.ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.00001, this.ctx.currentTime + duration);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start();
            osc.stop(this.ctx.currentTime + duration);
        } catch (e) {
            console.warn("Audio play failed:", e);
        }
    }

    // Preset Sounds
    playHover() {
        this.playTone(880, 'sine', 0.05, 0.05); // High tink
    }

    playClick() {
        this.playTone(440, 'triangle', 0.1, 0.1); // Solid click
    }

    playBoot() {
        this.playTone(220, 'sawtooth', 0.5, 0.05); // Low pulse
        setTimeout(() => this.playTone(440, 'sine', 0.2, 0.05), 100);
    }

    playSuccess() {
        this.playTone(523.25, 'sine', 0.2, 0.1); // C5
        setTimeout(() => this.playTone(659.25, 'sine', 0.2, 0.1), 100); // E5
        setTimeout(() => this.playTone(783.99, 'sine', 0.3, 0.1), 200); // G5
    }
}

export const audio = new BuildicyAudio();
