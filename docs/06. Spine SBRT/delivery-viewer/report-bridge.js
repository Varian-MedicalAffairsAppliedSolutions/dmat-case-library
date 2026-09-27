(() => {
  if (window.parent === window) return;
  const origin = location.origin === 'null' ? '*' : location.origin;
  const send = type => parent.postMessage({type}, origin);
  let lastHeight = 0, finished = false;
  const resize = () => {
    const height = Math.ceil(document.body.getBoundingClientRect().height);
    if (height !== lastHeight) { lastHeight = height; parent.postMessage({type:'report-delivery-height',height},origin); }
  };
  new ResizeObserver(resize).observe(document.body);
  window.addEventListener('message', event => {
    if (event.source !== parent || (origin !== '*' && event.origin !== origin)) return;
    if (event.data?.type === 'report-delivery-pause') {
      const play = document.getElementById('play');
      if (play?.getAttribute('aria-label') === 'Pause delivery') play.click();
    }
  });
  const finish = type => { if (!finished) { finished = true; clearInterval(poll); send(type); } };
  const poll = setInterval(() => {
    const error = document.getElementById('webglError');
    if (error && !error.hidden) return finish('report-delivery-error');
    const play = document.getElementById('play');
    if (document.querySelector('main.packaged') && play && !play.disabled && !document.getElementById('busyOverlay')?.open) {
      // Allow the first rendered scene to paint before uncovering the iframe.
      clearInterval(poll);
      requestAnimationFrame(() => requestAnimationFrame(() => finish('report-delivery-ready')));
    }
  }, 100);
  window.addEventListener('error', () => finish('report-delivery-error'));
  window.addEventListener('unhandledrejection', () => finish('report-delivery-error'));
  resize();
})();
