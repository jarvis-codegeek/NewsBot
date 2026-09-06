import React from 'react';

interface AudioPlayerBarProps {
  isPlaying: boolean;
  isPaused: boolean;
  statusText: string;
  onTogglePause: () => void;
  onStop: () => void;
}

export const AudioPlayerBar: React.FC<AudioPlayerBarProps> = ({
  isPlaying,
  isPaused,
  statusText,
  onTogglePause,
  onStop,
}) => {
  if (!isPlaying) return null;

  return (
    <div className="audio-player-bar">
      <div className="audio-info">
        <i className="ph-fill ph-waveform audio-wave-icon"></i>
        <span className="audio-text">{statusText || 'Playing Audio Briefing...'}</span>
      </div>
      <div className="audio-controls">
        <button
          className="btn-icon-subtle"
          onClick={onTogglePause}
          title={isPaused ? 'Resume' : 'Pause'}
        >
          <i className={`ph-fill ${isPaused ? 'ph-play' : 'ph-pause'}`}></i>
        </button>
        <button
          className="btn-icon-subtle"
          onClick={onStop}
          title="Stop Audio"
        >
          <i className="ph-bold ph-x"></i>
        </button>
      </div>
    </div>
  );
};
