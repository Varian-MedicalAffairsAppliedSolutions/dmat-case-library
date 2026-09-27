// Images are cached by URL; failed requests can be retried.
export function createImageLoader(ImageType = Image) {
  const cache = new Map();
  return function load(src, { priority = 'high' } = {}) {
    if (cache.has(src)) {
      const hit = cache.get(src);
      if (priority === 'high') hit.image.fetchPriority = 'high';
      cache.delete(src); cache.set(src, hit);
      return hit.request;
    }
    const image = new ImageType();
    image.fetchPriority = priority;
    const request = new Promise((resolve, reject) => {
      image.onload = async () => {
        try { if (image.decode) await image.decode(); resolve(image); }
        catch (error) { reject(error); }
      };
      image.onerror = () => reject(new Error('Image could not be loaded.'));
      if (globalThis.DmatBinaryImages && /\.bin(?:[?#]|$)/i.test(src)) globalThis.DmatBinaryImages.decodeURL(src, {priority}).then(url => { image.src = url; }, reject); else image.src = src;
    });
    cache.set(src, { request, image });
    // Keep the working neighborhood decoded without retaining an entire volume.
    while (cache.size > 128) cache.delete(cache.keys().next().value);
    request.catch(() => { if (cache.get(src)?.request === request) cache.delete(src); });
    return request;
  };
}

// Current slices have priority. Warm both sides as each plan's first image is
// ready, while still committing only complete, synchronized sets to the screen.
export function createSliceCoordinator({ plans, load, commit, status }) {
  let generation = 0, backgroundActive = 0, queue = [];
  const count = plans[0].length;
  const radius = Math.min(4, Math.max(0, Math.floor((128 / plans.length - 1) / 2)));
  const backgroundLimit = 4;
  function pump() {
    while (backgroundActive < backgroundLimit && queue.length) {
      const job = queue.shift();
      if (job.token !== generation) continue;
      backgroundActive++;
      // Failures are retried normally if that slice is selected later.
      Promise.resolve().then(() => {
        if (job.token === generation) return load(job.src, { priority: 'low' });
      }).catch(() => {}).finally(() => { backgroundActive--; pump(); });
    }
  }
  return async function requestSlice(rawIndex) {
    const index = Math.max(0, Math.min(count - 1, Math.round(Number(rawIndex) || 0)));
    const token = ++generation, readyPlans = new Set(), scheduled = new Set();
    let failed = false;
    queue = [];
    function warmNeighbors(planIndex) {
      if (token !== generation || failed) return;
      readyPlans.add(planIndex);
      // Reorder queued work around the newest selection, nearest slices first.
      // Running work is bounded; it cannot hold up a foreground request.
      const waiting = queue.filter(job => job.token === token);
      for (let distance = 1; distance <= radius; distance++) {
        for (const offset of [-distance, distance]) {
          const neighbor = index + offset;
          if (neighbor < 0 || neighbor >= count) continue;
          for (const position of readyPlans) {
            const src = plans[position][neighbor].src;
            if (!scheduled.has(src)) { scheduled.add(src); waiting.push({ src, token, distance }); }
          }
        }
      }
      queue = waiting.sort((a, b) => a.distance - b.distance);
      pump();
    }
    status('loading', index);
    try {
      const images = await Promise.all(plans.map(async (plan, position) => {
        const image = await load(plan[index].src, { priority: 'high' });
        warmNeighbors(position);
        return image;
      }));
      if (token !== generation) return false;
      commit(index, images);
      status('ready', index);
      return true;
    } catch (error) {
      failed = true;
      if (token === generation) { queue = []; status('error', index); }
      return false;
    }
  };
}


// Shared wheel navigation: retain browser pinch/zoom, consume ordinary vertical
// scrolling only inside the dose viewport, and coalesce high-rate trackpads.
export function createDoseWheelHandler({ getIndex, request, now = () => performance.now() }) {
  let accumulated = 0, last = -Infinity;
  return event => {
    if (event.ctrlKey || event.metaKey || !event.deltaY) return;
    event.preventDefault();
    const delta = event.deltaY * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? 400 : 1);
    if (Math.sign(delta) !== Math.sign(accumulated)) accumulated = 0;
    accumulated += delta;
    if (Math.abs(accumulated) < 40 || now() - last < 70) return;
    const step = Math.sign(accumulated); accumulated = 0; last = now();
    void request(getIndex() + step);
  };
}

export function createLatestSliceCoordinator({ count, load, commit, status }) {
  let requested = 0, pending = null, running = false;
  async function pump() {
    running = true;
    while (pending) {
      const job = pending; pending = null; status('loading', job.index);
      try {
        const frames = await load(job.index);
        if (pending) { job.resolve(false); continue; }
        commit(job.index, frames); status('ready', job.index); job.resolve(true);
      } catch (error) {
        if (!pending) status('error', job.index);
        job.resolve(false);
      }
    }
    running = false;
  }
  const request = raw => {
    requested = Math.max(0, Math.min(count - 1, Math.round(Number(raw) || 0)));
    pending?.resolve(false);
    const promise = new Promise(resolve => { pending = { index: requested, resolve }; });
    if (!running) void pump();
    return promise;
  };
  return { request, get requested() { return requested; }, get busy() { return running; } };
}

// Equal fingerprints are accepted for visually identical frames. Selection order
// is retained in the manifest even when a series repeats the same image.
export function matchesDoseFingerprint(sample, fingerprints, index) {
  let smallest = Infinity, selected = Infinity;
  fingerprints.forEach((reference, position) => {
    let error = 0;
    for (let i = 0; i < sample.length; i++) error += (sample[i] - reference[i]) ** 2;
    if (position === index) selected = error;
    smallest = Math.min(smallest, error);
  });
  return selected <= smallest + 0.000001;
}

function createDoseVideoSource(series, fps, decoderHost) {
  const video = document.createElement('video');
  video.muted = true; video.playsInline = true; video.preload = 'auto';
  video.className = 'dose-video-decoder'; video.tabIndex = -1;
  video.setAttribute('aria-hidden', 'true'); decoderHost.append(video);
  const url = new URL(series.src, document.baseURI).href;
  const fingerprints = series.fingerprints.map(value => Uint8Array.from(atob(value), ch => ch.charCodeAt(0)));
  let ready, reloadNeeded = false, last = null;
  function reload() {
    reloadNeeded = false;
    ready = new Promise((resolve, reject) => {
      const timer = setTimeout(() => finish(new Error('Video metadata timed out')), 45000);
      function finish(error) { clearTimeout(timer); video.removeEventListener('loadedmetadata', loaded); video.removeEventListener('error', failed); error ? reject(error) : resolve(); }
      function loaded() { finish(); } function failed() { finish(new Error('Video could not be loaded')); }
      video.addEventListener('loadedmetadata', loaded); video.addEventListener('error', failed);
    });
    ready.catch(() => { reloadNeeded = true; }); video.src = url; video.load();
  }
  reload();
  return { video, async frame(index) {
    if (reloadNeeded || video.error) reload();
    await ready;
    if (last?.index === index) return last;
    last = await new Promise((resolve, reject) => {
      let done = false, raf = null, retries = 0;
      const timer = setTimeout(() => { reloadNeeded = true; finish(new Error('Video slice timed out')); }, 45000);
      function finish(error, result) {
        if (done) return; done = true; clearTimeout(timer); cancelAnimationFrame(raf);
        video.removeEventListener('seeked', seeked); video.removeEventListener('error', failed);
        error ? reject(error) : resolve(result);
      }
      function inspect() {
        if (done || video.seeking) return;
        const canvas = document.createElement('canvas'); canvas.width = series.width; canvas.height = series.height;
        const context = canvas.getContext('2d', { willReadFrequently: true });
        context.drawImage(video, 0, 0, series.width, series.height, 0, 0, series.width, series.height);
        const pixels = context.getImageData(0, 0, series.width, series.height).data, sample = [], grid = series.sampleGrid;
        for (let y = 0; y < grid; y++) for (let x = 0; x < grid; x++) {
          const ix = Math.floor(3 + x * (series.width - 7) / (grid - 1));
          const iy = Math.floor(3 + y * (series.height - 7) / (grid - 1));
          const at = (iy * series.width + ix) * 4;
          sample.push((77 * pixels[at] + 150 * pixels[at + 1] + 29 * pixels[at + 2]) >> 8);
        }
        if (matchesDoseFingerprint(sample, fingerprints, index)) { finish(null, { index, canvas }); return; }
        // WebKit can signal seeked while exposing the prior frame. Wait for
        // painting, then repeat the seek if needed, before any group is committed.
        retries++;
        if (retries % 12 === 0) video.currentTime = (index + (retries % 24 === 0 ? .5 : .25)) / fps;
        else raf = requestAnimationFrame(inspect);
      }
      function seeked() { raf = requestAnimationFrame(inspect); }
      function failed() { reloadNeeded = true; finish(new Error('Video decode failed')); }
      video.addEventListener('seeked', seeked); video.addEventListener('error', failed);
      video.currentTime = (index + .5) / fps;
    });
    return last;
  } };
}

async function initializeVideoDose(viewer, data) {
  const cards = Array.from(viewer.querySelectorAll('.dose-volume-card'), card => ({
    viewport: card.querySelector('.dose-volume-viewport'), stage: card.querySelector('.dose-volume-stage'),
    canvas: card.querySelector('.dose-volume-image'), slider: card.querySelector('.dose-slice-slider'),
    overlay: card.querySelector('.dose-slice-overlay'), zoomLabel: card.querySelector('.dose-zoom-label'),
  }));
  if (!Array.isArray(data.offsets) || !data.offsets.length || data.series?.length !== cards.length || data.fps !== 10 ||
      data.series.some(series => typeof series.src !== 'string' || ![8,12,16,24,32,48,64].includes(series.sampleGrid) ||
        series.width < 8 || series.height < 8 || series.fingerprints?.length !== data.offsets.length ||
        series.fingerprints.some(value => typeof value !== 'string' || atob(value).length !== series.sampleGrid ** 2))) {
    throw new Error('Video manifest does not match this report');
  }
  const host = document.createElement('div'); host.className = 'dose-video-decoders'; host.setAttribute('aria-hidden', 'true'); viewer.append(host);
  const sources = data.series.map(series => createDoseVideoSource(series, data.fps, host));
  const box = viewer.querySelector('.dose-load-status'), message = box.querySelector('span'), retry = box.querySelector('button');
  let scale = 1, displayed = null;
  const transform = () => cards.forEach(card => { (card.stage || card.canvas).style.transform = `scale(${scale})`; if (card.zoomLabel) card.zoomLabel.textContent = `${Math.round(scale * 100)}%`; });
  const coordinator = createLatestSliceCoordinator({ count: data.offsets.length,
    load: async index => {
      // Finish every decoder before accepting another request, including on failure.
      const results = await Promise.allSettled(sources.map(source => source.frame(index)));
      const failed = results.find(result => result.status === 'rejected');
      if (failed) throw failed.reason;
      return results.map(result => result.value);
    },
    commit(index, frames) {
      cards.forEach((card, position) => {
        const series = data.series[position]; card.canvas.width = series.width; card.canvas.height = series.height;
        card.canvas.getContext('2d').drawImage(frames[position].canvas, 0, 0); card.canvas.hidden = false;
        card.canvas.setAttribute('aria-label', `Dose colorwash slice ${index + 1} of ${data.offsets.length}`);
        card.slider.value = String(index);
        if (card.overlay) card.overlay.textContent = `Slice ${index + 1}/${data.offsets.length}`;
      }); displayed = index; transform();
    },
    status(state, index) {
      viewer.setAttribute('aria-busy', String(state === 'loading')); retry.hidden = state !== 'error';
      // Keep navigation status out of normal flow: retaining the last frame
      // must not move the image under the user's mouse wheel.
      box.style.display = state === 'error' ? '' : 'none';
      message.textContent = state === 'error' ? 'Could not load this slice. The last complete view is retained. Check your connection and retry.' :
        '';
    },
  });
  retry.onclick = () => void coordinator.request(coordinator.requested);
  const wheel = createDoseWheelHandler({ getIndex: () => coordinator.requested, request: coordinator.request });
  for (const card of cards) {
    card.slider.disabled = false;
    const selectSlice = () => {
      const index = Number(card.slider.value);
      // Keep every thumb in sync immediately, without waiting for video decode.
      for (const other of cards) other.slider.value = String(index);
      if (coordinator.busy && coordinator.requested === index) return;
      if (!coordinator.busy && displayed === index) return;
      void coordinator.request(index);
    };
    card.slider.addEventListener('input', selectSlice);
    // Safari may deliver only a final change for some range interactions.
    card.slider.addEventListener('change', selectSlice);
    card.viewport.addEventListener('wheel', wheel, { passive: false });
    card.viewport.addEventListener('keydown', event => {
      if (event.ctrlKey || event.metaKey || event.altKey) return;
      const key = event.key;
      if (!['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Home','End'].includes(key)) return;
      event.preventDefault();
      void coordinator.request(key === 'Home' ? 0 : key === 'End' ? data.offsets.length - 1 : coordinator.requested + (['ArrowDown','ArrowRight'].includes(key) ? 1 : -1));
    });
    card.viewport.addEventListener('dblclick', () => { scale = 1; transform(); });
  }
  for (const button of viewer.querySelectorAll('[data-dose-action]')) button.addEventListener('click', () => {
    scale = button.dataset.doseAction === 'reset' ? 1 : Math.max(1, Math.min(6, scale * (button.dataset.doseAction === 'zoom-in' ? 1.25 : 1 / 1.25))); transform();
  });
  // Introspection used by the release browser checks; no clinical payload is retained.
  viewer.doseNavigation = { request: coordinator.request, get requested() { return coordinator.requested; }, get displayed() { return displayed; }, get busy() { return coordinator.busy; } };
  transform(); await coordinator.request(Number(viewer.dataset.initialIndex) || 0);
}

export async function initialize(viewer) {
  const response = await fetch(new URL(viewer.dataset.doseManifest, document.baseURI));
  if (!response.ok) throw new Error(`Manifest request failed (${response.status}).`);
  const data = await response.json();
  if (data.version === 2) return initializeVideoDose(viewer, data);
  const { plans, offsets } = data;
  const cards = Array.from(viewer.querySelectorAll('.dose-volume-card'), card => ({
    viewport: card.querySelector('.dose-volume-viewport'),
    stage: card.querySelector('.dose-volume-stage'),
    image: card.querySelector('.dose-volume-image'),
    slider: card.querySelector('.dose-slice-slider'),
    overlay: card.querySelector('.dose-slice-overlay'),
    zoomLabel: card.querySelector('.dose-zoom-label'),
  }));
  if (!Array.isArray(offsets) || !offsets.length || plans?.length !== cards.length ||
      plans.some(plan => plan.length !== offsets.length || plan.some(frame => typeof frame.src !== 'string'))) {
    throw new Error('Dose manifest does not match this report.');
  }
  const statusBox = viewer.querySelector('.dose-load-status');
  const message = statusBox.querySelector('span');
  const retry = statusBox.querySelector('button');
  let requestedIndex = Number(viewer.dataset.initialIndex) || 0, displayed = null, busy = false;
  let scale = 1;
  const applyTransform = () => cards.forEach(card => {
    (card.stage || card.image).style.transform = `scale(${scale})`;
    if (card.zoomLabel) card.zoomLabel.textContent = `${Math.round(scale * 100)}%`;
  });
  const reset = () => { scale = 1; applyTransform(); };
  const showFrame = createSliceCoordinator({
    plans, load: createImageLoader(),
    commit(index, images) {
      cards.forEach((card, position) => {
        card.image.src = images[position].src; card.image.hidden = false;
        card.image.alt = `Dose colorwash slice ${index + 1} of ${offsets.length}`;
        card.slider.value = String(index);
        if (card.overlay) card.overlay.textContent = `Slice ${index + 1}/${offsets.length}`;
      });
      displayed = index; applyTransform();
    },
    status(state, index) {
      requestedIndex = index; busy = state === 'loading';
      viewer.setAttribute('aria-busy', String(busy)); retry.hidden = state !== 'error';
      statusBox.style.display = state === 'error' ? '' : 'none';
      message.textContent = state === 'error' ? 'Could not load this slice. The last complete view is retained. Check your connection and retry.' : '';
    },
  });
  const request = index => {
    const target = Math.max(0, Math.min(offsets.length - 1, Math.round(Number(index) || 0)));
    for (const card of cards) card.slider.value = String(target);
    return showFrame(target);
  };
  retry.onclick = () => void request(requestedIndex);
  const wheel = createDoseWheelHandler({ getIndex: () => requestedIndex, request });
  for (const card of cards) {
    card.slider.disabled = false;
    const selectSlice = () => {
      const index = Number(card.slider.value);
      for (const other of cards) other.slider.value = String(index);
      if ((busy && requestedIndex === index) || (!busy && displayed === index)) return;
      void request(index);
    };
    card.slider.addEventListener('input', selectSlice);
    card.slider.addEventListener('change', selectSlice);
    card.viewport.addEventListener('wheel', wheel, { passive: false });
    card.viewport.addEventListener('keydown', event => {
      if (event.ctrlKey || event.metaKey || event.altKey) return;
      if (!['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Home','End'].includes(event.key)) return;
      event.preventDefault();
      void request(event.key === 'Home' ? 0 : event.key === 'End' ? offsets.length - 1 : requestedIndex + (['ArrowDown','ArrowRight'].includes(event.key) ? 1 : -1));
    });
    card.viewport.addEventListener('dblclick', reset);
  }
  for (const button of viewer.querySelectorAll('[data-dose-action]')) button.addEventListener('click', () => {
    if (button.dataset.doseAction === 'reset') return reset();
    scale = Math.max(1, Math.min(6, scale * (button.dataset.doseAction === 'zoom-in' ? 1.25 : 1 / 1.25))); applyTransform();
  });
  viewer.doseNavigation = { request, get requested() { return requestedIndex; }, get displayed() { return displayed; }, get busy() { return busy; } };
  await request(requestedIndex);
}
