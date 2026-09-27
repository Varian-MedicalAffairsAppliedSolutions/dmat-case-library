/* Shared report viewer controls, including an iPhone-friendly fullscreen fallback. */
(() => {
  const stage = document.getElementById('stage');
  if (!stage) return;
  const tabs = stage.querySelector('.view-tabs');
  stage.after(tabs);
  const disclaimer = document.querySelector('.viewer-disclaimer');
  const readouts = document.querySelector('.readouts');
  if (disclaimer && readouts) readouts.after(disclaimer);
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'delivery-fullscreen-toggle';
  button.innerHTML = '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path class="fullscreen-expand" d="M8 3H3v5m13-5h5v5M3 16v5h5m13-5v5h-5"/><path class="fullscreen-collapse" d="M3 8h5V3m8 0v5h5M8 21v-5H3m18 0h-5v5"/></svg>';
  button.setAttribute('aria-label', 'Full screen');
  button.title = 'Full screen';
  button.setAttribute('aria-pressed', 'false');
  stage.append(button);
  const host = window.frameElement?.closest('.delivery-stage-shell') || document.documentElement;
  const hostDocument = host.ownerDocument;
  let active = false;
  let scrollY = 0;
  const setActive = value => {
    if (active === value) return;
    active = value;
    if (active) scrollY = hostDocument.defaultView.scrollY;
    host.classList.toggle('delivery-fullscreen', active);
    hostDocument.documentElement.classList.toggle('delivery-fullscreen-open', active);
    document.documentElement.classList.toggle('delivery-view-expanded', active);
    const label = active ? 'Exit full screen' : 'Full screen';
    button.setAttribute('aria-label', label);
    button.title = label;
    button.setAttribute('aria-pressed', String(active));
    if (!active) {
      hostDocument.defaultView.scrollTo(0, scrollY);
      button.focus({preventScroll:true});
    }
  };
  button.addEventListener('click', async () => {
    if (active) {
      if (hostDocument.fullscreenElement === host) await hostDocument.exitFullscreen().catch(() => {});
      setActive(false);
    } else {
      setActive(true);
      // Keep the viewport-filling fallback if native fullscreen is unavailable or denied.
      if (host.requestFullscreen) await host.requestFullscreen().catch(() => {});
    }
  });
  hostDocument.addEventListener('fullscreenchange', () => {
    if (!hostDocument.fullscreenElement) setActive(false);
  });
  const escape = event => { if (event.key === 'Escape' && active) {
    if (hostDocument.fullscreenElement === host) hostDocument.exitFullscreen().catch(() => {});
    setActive(false);
  } };
  document.addEventListener('keydown', escape);
  if (hostDocument !== document) hostDocument.addEventListener('keydown', escape);
})();
