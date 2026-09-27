(() => {
  function initialize() {
    for (const viewer of document.querySelectorAll('.dvh-unified')) {
      const structures = [...viewer.querySelectorAll('[data-dvh-structure-toggle]')];
      const labels = [...viewer.querySelectorAll('[data-dvh-label-toggle]')];
      if (!structures.length) continue;
      function setAll(checked) {
        for (const input of [...structures, ...labels]) input.checked = checked && !input.disabled;
        delete viewer.dataset.dvhObjectiveFocus;
        structures[0].dispatchEvent(new Event('change', { bubbles: true }));
      }
      viewer.querySelector('[data-dvh-all-off]')?.addEventListener('click', () => setAll(false));
      viewer.addEventListener('dblclick', event => {
        const target = event.target;
        if (!(target instanceof Element)) return;
        const row = target.closest('.dvh-structure-toggles label');
        if (!row || target.matches('[data-dvh-label-toggle]') || target.closest('b')) return;
        event.preventDefault();
        event.stopImmediatePropagation();
        setAll(true);
      }, true);
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initialize, { once: true });
  else initialize();
})();
