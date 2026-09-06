import { useState, useCallback, useRef } from 'react';

export function useAudio() {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [statusText, setStatusText] = useState<string>('');
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const stripMarkdown = (text: string) => {
    if (!text) return '';
    return text
      .replace(/#+\s/g, '')
      .replace(/[*_~`]/g, '')
      .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1')
      .replace(/[-*•]\s/g, '. ')
      .replace(/\n+/g, '. ')
      .trim();
  };

  const stop = useCallback(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setIsPlaying(false);
    setIsPaused(false);
    setStatusText('');
  }, []);

  const speak = useCallback(
    (text: string, title: string = 'Playing Audio Briefing...') => {
      if (typeof window === 'undefined' || !window.speechSynthesis) {
        alert('Text-to-speech is not supported in this browser.');
        return;
      }

      stop();
      const clean = stripMarkdown(text);
      if (!clean) return;

      const utterance = new SpeechSynthesisUtterance(clean);
      utterance.rate = 1.02;
      utterance.pitch = 1.0;

      const voices = window.speechSynthesis.getVoices();
      const natural = voices.find(
        (v) =>
          v.lang.startsWith('en') &&
          (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Premium'))
      );
      if (natural) {
        utterance.voice = natural;
      }

      utterance.onstart = () => {
        setIsPlaying(true);
        setIsPaused(false);
        setStatusText(title);
      };

      utterance.onend = () => {
        stop();
      };

      utterance.onerror = (e) => {
        console.warn('SpeechSynthesis error:', e);
        stop();
      };

      utteranceRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    },
    [stop]
  );

  const togglePause = useCallback(() => {
    if (typeof window === 'undefined' || !window.speechSynthesis || !isPlaying) return;

    if (isPaused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
    } else {
      window.speechSynthesis.pause();
      setIsPaused(true);
    }
  }, [isPlaying, isPaused]);

  return {
    isPlaying,
    isPaused,
    statusText,
    speak,
    togglePause,
    stop,
  };
}
