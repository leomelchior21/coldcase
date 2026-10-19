import { useLayoutEffect } from 'react';

/** Fit browser controls while keeping the software keyboard over the desk. */
export function useAppViewport(inCase: boolean) {
  useLayoutEffect(() => {
    const root = document.documentElement;
    const viewport = window.visualViewport;
    root.classList.toggle('case-open', inCase);
    let fittedHeight = 0, layoutWidth = 0, layoutHeight = 0, controlsHeight = 0;
    let keyboardOpen = false, focusFrame = 0;

    const resize = () => {
      if (viewport && Math.abs(viewport.scale - 1) > .01) return;
      const width = root.clientWidth;
      const height = root.clientHeight || window.innerHeight;
      const visibleHeight = Math.min(height, viewport?.height || window.innerHeight);
      const layoutChanged = width !== layoutWidth || height !== layoutHeight;
      const editing = document.activeElement?.matches('input, textarea, [contenteditable="true"]');

      if (fittedHeight && !layoutChanged) {
        if (editing) {
          keyboardOpen ||= visibleHeight < fittedHeight - 100;
          return;
        }
        // A blur can arrive before the keyboard's closing animation finishes.
        if (keyboardOpen && visibleHeight < fittedHeight - 100) return;
      }

      const nextHeight = editing && fittedHeight ? height - controlsHeight : visibleHeight;
      fittedHeight = Math.max(1, Math.floor(nextHeight));
      layoutWidth = width; layoutHeight = height;
      if (!editing) { controlsHeight = height - fittedHeight; keyboardOpen = false; }
      root.style.setProperty('--app-height', `${fittedHeight}px`);
    };
    const afterFocus = () => { cancelAnimationFrame(focusFrame); focusFrame = requestAnimationFrame(resize); };
    resize();
    window.addEventListener('resize', resize);
    viewport?.addEventListener('resize', resize);
    document.addEventListener('focusout', afterFocus);
    return () => {
      cancelAnimationFrame(focusFrame);
      window.removeEventListener('resize', resize);
      viewport?.removeEventListener('resize', resize);
      document.removeEventListener('focusout', afterFocus);
      root.classList.remove('case-open');
    };
  }, [inCase]);
}
