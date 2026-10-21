import { useCallback, useEffect, useRef } from 'react';

/** A quiet mechanical tick, created only after a terminal interaction. */
export function useTerminalClick() {
  const context = useRef<AudioContext | null>(null);
  useEffect(() => () => { void context.current?.close().catch(() => {}); }, []);
  return useCallback(() => {
    try {
      const Audio = window.AudioContext || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!Audio) return;
      const audio = context.current ?? (context.current = new Audio());
      if (audio.state === 'suspended') void audio.resume().catch(() => {});
      const duration = .035, now = audio.currentTime;
      const buffer = audio.createBuffer(1, Math.ceil(audio.sampleRate * duration), audio.sampleRate);
      const samples = buffer.getChannelData(0);
      for (let i = 0; i < samples.length; i++) samples[i] = Math.random() * 2 - 1;
      const source = audio.createBufferSource(), filter = audio.createBiquadFilter(), gain = audio.createGain();
      source.buffer = buffer;
      filter.type = 'bandpass'; filter.frequency.value = 1600; filter.Q.value = .8;
      gain.gain.setValueAtTime(.18, now);
      gain.gain.exponentialRampToValueAtTime(.001, now + duration);
      source.connect(filter); filter.connect(gain); gain.connect(audio.destination);
      source.onended = () => { source.disconnect(); filter.disconnect(); gain.disconnect(); };
      source.start(now); source.stop(now + duration);
    } catch { /* Audio availability must never block the archive controls. */ }
  }, []);
}
