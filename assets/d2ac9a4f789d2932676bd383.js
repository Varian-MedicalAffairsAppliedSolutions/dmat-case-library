(() => {
  const script = document.currentScript;
  const moduleUrl = new URL(script.dataset.viewerModule, script.src).href;
  let modulePromise;
  const loadModule = () => modulePromise ||= import(moduleUrl).catch(error => { modulePromise = null; throw error; });
  for (const viewer of document.querySelectorAll('[data-dose-manifest]')) {
    const box = viewer.querySelector('.dose-load-status');
    const message = box.querySelector('span');
    const retry = box.querySelector('button');
    let loading = false, ready = false, attempted = false;
    async function start() {
      if (ready || loading) return;
      loading = true;
      attempted = true;
      viewer.setAttribute('aria-busy', 'true');
      message.textContent = 'Loading dose viewer…';
      retry.hidden = true;
      try {
        const module = await loadModule();
        await module.initialize(viewer);
        ready = true;
        observer?.disconnect();
      } catch (error) {
        viewer.setAttribute('aria-busy', 'false');
        message.textContent = 'Could not load the dose viewer. Check your connection and retry.';
        retry.hidden = false;
        retry.onclick = start;
      } finally { loading = false; }
    }
    const observer = 'IntersectionObserver' in window ? new IntersectionObserver(entries => {
      if (!attempted && !viewer.closest('details:not([open])') && entries.some(entry => entry.isIntersecting)) void start();
    }, { rootMargin: '300px' }) : null;
    retry.onclick = start;
    retry.hidden = false;
    if (observer) observer.observe(viewer);
    else void start();
  }
})();
