/* Reversible image obfuscation; this is not encryption or access control. */
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


const controls=[...document.querySelectorAll('[data-filter]')],groups=[...document.querySelectorAll('.report-group')];
function selectRegion(key){for(const control of controls){const active=control.dataset.filter===key;control.setAttribute('aria-pressed',String(active));control.classList.toggle('selected',active)}let count=0;for(const group of groups){group.hidden=key!=='all'&&group.dataset.region!==key;if(!group.hidden)count+=group.querySelectorAll('.report').length}document.getElementById('results-title').textContent=key==='all'?'All reports':document.querySelector(`.report-group[data-region="${key}"] h3`).textContent;document.getElementById('result-count').textContent=`${count} report${count===1?'':'s'}`;}
for(const control of controls){control.addEventListener('click',()=>selectRegion(control.dataset.filter));if(control.matches('svg .region'))control.addEventListener('keydown',event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();selectRegion(control.dataset.filter)}})}
