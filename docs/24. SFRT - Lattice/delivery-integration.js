/* Images bundled for easier loading. */
(() => {
  if (window.DmatBinaryImages) return;
  const pending = new Map();
  // Share bundle downloads across slices; keep at most 16 MB of settled data.
  const bundles = new Map();
  let cachedBytes = 0;
  function fetchBundle(url, priority) {
    if (bundles.has(url)) {
      const hit = bundles.get(url); bundles.delete(url); bundles.set(url, hit); return hit.promise;
    }
    const entry = {size: 0};
    entry.promise = (async () => {
      const response = await fetch(url, {priority});
      if (!response.ok) throw new Error('Image asset request failed: ' + response.status);
      const bytes = new Uint8Array(await response.arrayBuffer());
      entry.size = bytes.byteLength; cachedBytes += entry.size;
      for (const [key, value] of bundles) {
        if (cachedBytes <= 16_000_000) break;
        if (!value.size) continue;
        bundles.delete(key); cachedBytes -= value.size;
      }
      return bytes;
    })();
    bundles.set(url, entry);
    entry.promise.catch(() => { if (bundles.get(url) === entry) bundles.delete(url); });
    return entry.promise;
  }
  async function decodeURL(src, {priority = 'high'} = {}) {
    const url = new URL(src, document.baseURI).href;
    if (!/\.bin(?:[?#]|$)/i.test(url)) return url;
    if (pending.has(url)) { const hit = pending.get(url); pending.delete(url); pending.set(url, hit); return hit; }
    const request = (async () => {
      const asset = new URL(url), fragment = asset.hash;
      asset.hash = '';
      const allBytes = await fetchBundle(asset.href, priority);
      let bytes;
      if (fragment) {
        const match = /^#(\d+):(\d+)$/.exec(fragment);
        if (!match) throw new Error('Invalid binary image range');
        const offset = Number(match[1]), length = Number(match[2]);
        if (!Number.isSafeInteger(offset) || !Number.isSafeInteger(length) || length < 16 || offset + length > allBytes.length) throw new Error('Invalid binary image range');
        bytes = allBytes.slice(offset, offset + length);
      } else bytes = allBytes.slice();
      if (bytes.length < 16 || String.fromCharCode(...bytes.subarray(0, 8)) !== 'DMATIMG1') throw new Error('Invalid binary image');
      const mime = ['image/png', 'image/jpeg', 'image/webp', 'image/gif'][bytes[12]];
      if (!mime) throw new Error('Unsupported binary image type');
      let state = new DataView(bytes.buffer).getUint32(8, true);
      for (let i = 16; i < bytes.length; i++) { state ^= state << 13; state ^= state >>> 17; state ^= state << 5; bytes[i] ^= state & 255; }
      return URL.createObjectURL(new Blob([bytes.subarray(16)], {type: mime}));
    })();
    pending.set(url, request);
    request.catch(() => { if (pending.get(url) === request) pending.delete(url); });
    // The dose viewer retains at most 128 decoded images. Keep a larger URL
    // neighborhood, but do not retain an entire collection of volumes.
    while (pending.size > 512) {
      const oldest = pending.keys().next().value, old = pending.get(oldest); pending.delete(oldest);
      old.then(value => URL.revokeObjectURL(value), () => {});
    }
    return request;
  }
  const generations = new WeakMap();
  function setImage(image, src) {
    const token = {}; generations.set(image, token);
    decodeURL(src).then(url => { if (generations.get(image) === token) { image.src = url; image.removeAttribute('data-binary-error'); } }, () => { if (generations.get(image) === token) image.dataset.binaryError = 'true'; });
  }
  window.DmatBinaryImages = {decodeURL, setImage};
  function start() {
    for (const image of document.querySelectorAll('img[data-binary-src]')) {
      if (image.matches('.dose-volume-image,.dose-sync-image')) continue;
      const load = () => decodeURL(image.dataset.binarySrc).then(url => { image.src = url; image.removeAttribute('data-binary-error'); }).catch(() => { image.dataset.binaryError = 'true'; image.alt ||= 'Image could not be loaded. Reload to retry.'; });
      if ('IntersectionObserver' in window) { const observer = new IntersectionObserver(entries => { if (entries.some(e => e.isIntersecting)) { observer.disconnect(); load(); } }, {rootMargin: '300px'}); observer.observe(image); }
      else load();
    }
    for (const link of document.querySelectorAll('a[data-binary-href]')) {
      link.addEventListener('click', async event => {
        event.preventDefault();
        try { const url = await decodeURL(link.dataset.binaryHref); const a = document.createElement('a'); a.href = url; a.target = link.target || '_blank'; a.rel = 'noopener'; if (link.hasAttribute('download')) a.download = link.getAttribute('download'); a.click(); }
        catch { link.title = 'Image could not be loaded. Click to retry.'; }
      });
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();

(() => {
  const frame = document.getElementById('delivery-frame');
  if (!frame) return;
  const fold = document.getElementById('delivery-simulation');
  const shell = document.getElementById('delivery-loading');
  const message = shell.querySelector('[role="status"]');
  const retry = shell.querySelector('button');
  const doses = [...document.querySelectorAll('[data-dose-manifest]')];
  const origin = location.origin === 'null' ? '*' : location.origin;
  let phase = 'report', timer;
  const pause = () => frame.contentWindow?.postMessage({type:'report-delivery-pause'}, origin);
  const fail = text => {
    clearTimeout(timer);
    shell.hidden = false;
    shell.classList.add('has-error');
    message.textContent = text;
    retry.hidden = false;
    frame.style.visibility = 'hidden';
    frame.setAttribute('aria-busy', 'false');
  };
  const loading = text => {
    shell.hidden = false;
    shell.classList.remove('has-error');
    message.textContent = text;
    retry.hidden = true;
    frame.setAttribute('aria-busy', 'true');
    clearTimeout(timer);
    timer = setTimeout(() => {
      if (phase === 'colorwash') { observer.disconnect(); startSimulation(); }
      else fail('Loading is taking longer than expected. You can retry.');
    }, phase === 'colorwash' ? 30000 : 90000);
  };
  const startSimulation = () => {
    phase = 'simulation';
    loading('Loading delivery simulation…');
    frame.style.visibility = 'hidden';
    frame.loading = 'eager';
    frame.src = frame.dataset.src;
  };
  const doseReady = () => doses.every(viewer => viewer.doseNavigation?.displayed != null);
  const checkDose = () => {
    if (phase !== 'colorwash') return;
    if (doseReady()) { observer.disconnect(); startSimulation(); return; }
    if (doses.some(viewer => /could not/i.test(viewer.querySelector('.dose-load-status span')?.textContent || ''))) {
      observer.disconnect();
      startSimulation();
    }
  };
  const observer = new MutationObserver(checkDose);
  const startColorwash = () => {
    phase = 'colorwash';
    loading('Loading dose colorwash first…');
    for (const viewer of doses) {
      observer.observe(viewer, {subtree:true, childList:true, attributes:true, characterData:true});
      if (viewer.doseNavigation?.displayed == null) viewer.querySelector('.dose-load-status button')?.click();
    }
    checkDose();
  };
  retry.addEventListener('click', () => phase === 'simulation' ? startSimulation() : startColorwash());
  frame.addEventListener('error', () => fail('The delivery simulation could not load. Please retry.'));
  window.addEventListener('message', event => {
    if (event.source !== frame.contentWindow || (origin !== '*' && event.origin !== origin)) return;
    if (event.data?.type === 'report-delivery-height' && Number.isFinite(event.data.height)) {
      frame.style.height = `${Math.max(400, Math.min(5000, event.data.height))}px`;
    }
    if (phase !== 'simulation') return;
    if (event.data?.type === 'report-delivery-ready') {
      clearTimeout(timer);
      shell.hidden = true;
      frame.style.visibility = 'visible';
      frame.setAttribute('aria-busy','false');
      phase = 'ready';
    } else if (event.data?.type === 'report-delivery-error') fail('The delivery simulation could not initialize. Please retry.');
  });
  fold.addEventListener('toggle', () => { if (!fold.open) pause(); });
  new IntersectionObserver(entries => { if (!entries[0].isIntersecting) pause(); }).observe(frame);
  document.addEventListener('visibilitychange', () => { if (document.hidden) pause(); });
  // Two frames let the report paint before starting the heavier colorwash work.
  const start = () => requestAnimationFrame(() => requestAnimationFrame(startColorwash));
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, {once:true});
  else start();
})();
