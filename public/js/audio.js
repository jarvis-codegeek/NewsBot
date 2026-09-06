/**
 * Audio / Speech Synthesis Controller
 * Provides Text-To-Speech audio briefings using Web Speech API
 */
class AudioManager {
  constructor() {
    this.synth = window.speechSynthesis;
    this.utterance = null;
    this.isPlaying = false;
    this.isPaused = false;
    this.bar = document.getElementById('audio-player-bar');
    this.statusText = document.getElementById('audio-status-text');
    this.pauseBtn = document.getElementById('audio-pause-btn');
    this.pauseIcon = document.getElementById('audio-pause-icon');
    this.stopBtn = document.getElementById('audio-stop-btn');

    this.initEventListeners();
  }

  initEventListeners() {
    if (this.pauseBtn) {
      this.pauseBtn.addEventListener('click', () => this.togglePause());
    }
    if (this.stopBtn) {
      this.stopBtn.addEventListener('click', () => this.stop());
    }
  }

  stripMarkdown(text) {
    if (!text) return '';
    return text
      .replace(/#+\s/g, '')
      .replace(/[*_~`]/g, '')
      .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1')
      .replace(/[-*•]\s/g, '. ')
      .replace(/\n+/g, '. ')
      .trim();
  }

  speak(text, label = 'Playing Audio Briefing...') {
    if (!this.synth) {
      alert('Text-to-speech is not supported in your browser.');
      return;
    }

    this.stop();

    const cleanText = this.stripMarkdown(text);
    if (!cleanText) return;

    this.utterance = new SpeechSynthesisUtterance(cleanText);
    this.utterance.rate = 1.02;
    this.utterance.pitch = 1.0;

    // Pick best English voice if available
    const voices = this.synth.getVoices();
    const naturalVoice = voices.find(v => v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Premium')));
    if (naturalVoice) {
      this.utterance.voice = naturalVoice;
    }

    this.utterance.onstart = () => {
      this.isPlaying = true;
      this.isPaused = false;
      this.showBar(label);
    };

    this.utterance.onend = () => {
      this.stop();
    };

    this.utterance.onerror = (e) => {
      console.warn('SpeechSynthesis error:', e);
      this.stop();
    };

    this.synth.speak(this.utterance);
  }

  togglePause() {
    if (!this.isPlaying) return;

    if (this.isPaused) {
      this.synth.resume();
      this.isPaused = false;
      if (this.pauseIcon) this.pauseIcon.className = 'ph-fill ph-pause';
    } else {
      this.synth.pause();
      this.isPaused = true;
      if (this.pauseIcon) this.pauseIcon.className = 'ph-fill ph-play';
    }
  }

  stop() {
    if (this.synth) {
      this.synth.cancel();
    }
    this.isPlaying = false;
    this.isPaused = false;
    this.hideBar();
    if (this.pauseIcon) this.pauseIcon.className = 'ph-fill ph-pause';
  }

  showBar(label) {
    if (this.bar) {
      this.bar.style.display = 'flex';
      if (this.statusText) this.statusText.textContent = label;
    }
  }

  hideBar() {
    if (this.bar) {
      this.bar.style.display = 'none';
    }
  }
}

window.audioManager = new AudioManager();
