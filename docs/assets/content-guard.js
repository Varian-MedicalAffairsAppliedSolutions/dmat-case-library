// Presentation deterrents only. These do not prevent screenshots or data extraction.
(() => {
  const prevent = event => event.preventDefault();
  for (const type of ['contextmenu', 'copy', 'cut', 'selectstart', 'dragstart']) {
    document.addEventListener(type, prevent);
  }
  document.addEventListener('keydown', event => {
    if ((event.ctrlKey || event.metaKey) && ['a', 'c', 'x', 'p', 's'].includes(event.key.toLowerCase())) {
      event.preventDefault();
    }
  });
})();
