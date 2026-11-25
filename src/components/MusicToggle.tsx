import { useCallback, useEffect, useImperativeHandle, useRef, useState, type Ref } from 'react';
import { useApp } from '../lib/app';
import { store } from '../lib/storage';

const SRC = '/audio/wedding-theme.mp3';
const LEVEL = 0.6;
const OFF_KEY = 'music-off'; // set when the guest explicitly turns music off

let shared: HTMLAudioElement | null = null; // the one welcome-music element, so the app shell can always silence it

/** Hard stop, used by the app shell: music belongs to the welcome page only and must never play elsewhere. */
export function silenceMusic() { if (shared && !shared.paused) shared.pause(); }

export interface MusicHandle {
  /** Fade out and stop (used when the guest leaves the welcome page). Safe if never started. */
  fadeOutAndStop: (ms?: number) => void;
}

/** Frosted music pill for the welcome page. Starts only on tap (browsers block autoplay with sound). */
export function MusicToggle({ ref }: { ref?: Ref<MusicHandle> }) {
  const { t } = useApp();
  const [on, setOn] = useState(false);
  const audio = useRef<HTMLAudioElement | null>(null);
  const raf = useRef(0);
  const want = useRef(false); // guest wants music (survives a tab being hidden)

  const fade = useCallback((to: number, ms: number, done?: () => void) => {
    clearInterval(raf.current);
    const a = audio.current;
    if (!a) { done?.(); return; }
    // setInterval, not rAF: rAF stalls in background/unfocused tabs, which left volume stuck at 0.
    const from = a.volume, t0 = performance.now();
    raf.current = window.setInterval(() => {
      const k = Math.min(1, (performance.now() - t0) / ms);
      a.volume = Math.max(0, Math.min(1, from + (to - from) * k)); // iOS ignores volume; harmless
      if (k >= 1) { clearInterval(raf.current); done?.(); }
    }, 50);
  }, []);

  const fail = useCallback((why: unknown) => {
    console.warn('Welcome music unavailable', why);
    want.current = false;
    clearInterval(raf.current);
    audio.current?.pause();
    setOn(false);
  }, []);

  const start = useCallback((auto = false) => {
    if (!audio.current) {
      const a = new Audio();
      a.preload = 'none';
      a.loop = true;
      a.addEventListener('error', () => fail(a.error));
      a.src = SRC;
      audio.current = a;
      shared = a;
    }
    const a = audio.current;
    a.volume = 0;
    want.current = true;
    setOn(true);
    return a.play().then(() => { if (want.current) fade(LEVEL, 2000); else a.pause(); return true; }).catch((e) => {
      if (auto) { want.current = false; setOn(false); return false; } // autoplay blocked: wait for a gesture
      fail(e); return false;
    });
  }, [fade, fail]);

  const stop = useCallback((ms: number, explicit = false) => {
    if (explicit) store.set(OFF_KEY, '1');
    want.current = false;
    setOn(false);
    fade(0, ms, () => audio.current?.pause());
  }, [fade]);

  useImperativeHandle(ref, () => ({ fadeOutAndStop: (ms = 800) => { if (want.current) stop(ms); } }), [stop]);

  // Play on arrival if the browser allows it; otherwise start on the guest's first tap/scroll/key anywhere.
  useEffect(() => {
    if (store.get(OFF_KEY) === '1') return;
    let done = false;
    const evs = ['pointerdown', 'keydown', 'touchend', 'wheel'] as const;
    const off = () => evs.forEach((e) => window.removeEventListener(e, onGesture, true));
    function onGesture(e: Event) {
      if (done) return;
      // Let a tap on the music button itself go through its own onClick.
      if ((e.target as Element | null)?.closest?.('[data-music-toggle]')) { done = true; off(); return; }
      done = true; off();
      if (!want.current) void start();
    }
    evs.forEach((e) => window.addEventListener(e, onGesture, { capture: true, passive: true }));
    void start(true).then((ok) => { if (ok) { done = true; off(); } });
    return () => { done = true; off(); };
  }, [start]);

  useEffect(() => {
    const vis = () => {
      const a = audio.current;
      if (!a) return;
      if (document.hidden) { clearInterval(raf.current); a.pause(); }
      else if (want.current) { a.volume = 0; a.play().then(() => fade(LEVEL, 1200)).catch(fail); }
    };
    document.addEventListener('visibilitychange', vis);
    return () => {
      document.removeEventListener('visibilitychange', vis);
      // Leaving the page: let any running fade-out finish; otherwise fade out now. Detached from React.
      if (want.current) { want.current = false; fade(0, 800, () => audio.current?.pause()); }
    };
  }, [fade, fail]);

  return (
    <button type="button" data-music-toggle aria-pressed={on} aria-label={t('music.toggle')} title={t(on ? 'music.on' : 'music.off')}
      onClick={() => { if (on) stop(600, true); else { store.set(OFF_KEY, ''); start(); } }}
      className={`tap inline-flex items-center justify-center gap-1 rounded-full border px-3 transition-colors ${on ? 'border-white bg-white text-oxblood' : 'border-white/25 bg-white/12 text-white backdrop-blur-md'}`}>
      <svg aria-hidden="true" viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M12 3v10.55A4 4 0 1 0 14 17V7h4V3h-6z" /></svg>
      {on && (
        <span aria-hidden="true" className="flex h-3.5 items-end gap-[2px]">
          {[0, 0.25, 0.5].map((d) => <span key={d} className="eq-bar block h-full w-[2.5px] rounded-full bg-current" style={{ animationDelay: `${d}s` }} />)}
        </span>
      )}
    </button>
  );
}
