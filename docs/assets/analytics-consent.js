(function () {
  'use strict';
  // Embedded viewers never load Analytics or show a second consent prompt.
  if (window.top !== window.self) return;
  const id = 'G-82757TJGTE';
  const root = new URL('../', document.currentScript.src).pathname;
  const key = 'neoarc-consent-v1:' + root;
  const lifetime = 180 * 24 * 60 * 60 * 1000;
  let started = false;
  let expiryTimer;
  function discardSavedChoice() {
    try { localStorage.removeItem(key); } catch (_) {}
  }
  function read() {
    try {
      const value = JSON.parse(localStorage.getItem(key));
      if (value && value.version === 1 && ['accepted', 'rejected'].includes(value.choice) &&
          Number.isFinite(value.time) && value.time <= Date.now() && Date.now() - value.time < lifetime) {
        // Do not activate saved acceptance when storage cannot save withdrawal.
        if (value.choice === 'accepted') localStorage.setItem(key, JSON.stringify(value));
        return value;
      }
    } catch (_) { /* Unavailable storage means no remembered consent. */ }
    discardSavedChoice();
    return null;
  }
  function clearCookies() {
    // Only cookies belonging to this implementation; leave other projects alone.
    document.cookie.split(';').forEach(function (entry) {
      const name = entry.trim().split('=')[0];
      if (name.startsWith('_neoarc_ga')) {
        document.cookie = name + '=; Max-Age=0; path=' + root + '; SameSite=Lax';
      }
    });
  }
  function stop() {
    window['ga-disable-' + id] = true;
    clearCookies();
    // Unload the library and its automatic listeners after withdrawal.
    if (started) window.location.reload();
  }
  function start() {
    if (started) return;
    started = true;
    window['ga-disable-' + id] = false;
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag('consent', 'default', {
      analytics_storage: 'granted', ad_storage: 'denied',
      ad_user_data: 'denied', ad_personalization: 'denied'
    });
    window.gtag('js', new Date());
    window.gtag('config', id, {
      cookie_prefix: '_neoarc', cookie_domain: 'none', cookie_path: root,
      cookie_expires: lifetime / 1000, cookie_update: false,
      allow_google_signals: false, allow_ad_personalization_signals: false,
      page_location: location.origin + location.pathname, page_referrer: ''
    });
    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://www.googletagmanager.com/gtag/js?id=' + id;
    document.head.appendChild(script);
  }
  const wrapper = document.createElement('div');
  wrapper.id = 'analytics-consent';
  wrapper.innerHTML = '<section class="ac-panel" aria-labelledby="ac-title" aria-label="Analytics cookie preferences">' +
    '<h2 id="ac-title">Optional analytics cookies</h2>' +
    '<p>With your permission, this case library uses Google Analytics to count page visits, report when visits happen, and estimate visitors’ country, region, or city from their internet connection. Google receives usage and device information and uses cookies to distinguish browsers. Analytics stays off unless you accept. You can use every report if you reject.</p>' +
    '<div class="ac-actions"><button type="button" data-choice="accepted">Accept analytics</button><button type="button" data-choice="rejected">Reject analytics</button></div>' +
    '<details><summary>Cookie details</summary><p>Your choice is stored in this browser for 180 days. Analytics cookies beginning with _neoarc_ga last up to 180 days. Advertising signals are disabled. Google may process information outside your country. Withdrawal stops future collection; it does not erase information already sent.</p>' +
    '<p><a href="https://cancercare.siemens-healthineers.com/about-us/legal-information/privacy-notice" target="_blank" rel="noopener noreferrer">Siemens Healthineers Cancer Care Privacy Notice</a>. Privacy questions or requests: <a href="mailto:dataprivacy.func@siemens-healthineers.com">dataprivacy.func@siemens-healthineers.com</a>.</p>' +
    '<p>Use Cookie settings at any time to change your choice. <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">Google privacy policy</a> · <a href="https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement" target="_blank" rel="noopener noreferrer">GitHub hosting privacy</a></p></details>' +
    '<button type="button" class="ac-close" hidden>Close settings</button></section>' +
    '<button type="button" class="ac-settings">Cookie settings</button>';
  document.body.appendChild(wrapper);
  const panel = wrapper.querySelector('.ac-panel');
  const settings = wrapper.querySelector('.ac-settings');
  const close = wrapper.querySelector('.ac-close');
  function apply(value) {
    clearTimeout(expiryTimer);
    panel.hidden = !!value;
    close.hidden = !value;
    if (value && value.choice === 'accepted') start();
    else stop();
    if (value) expiryTimer = setTimeout(refresh, Math.min(2147483647, value.time + lifetime - Date.now()));
  }
  // Re-check periodically because browser timeouts cannot span 180 days.
  function refresh() { apply(read()); }
  wrapper.querySelectorAll('[data-choice]').forEach(function (button) {
    button.addEventListener('click', function () {
      const value = { version: 1, choice: button.dataset.choice, time: Date.now() };
      try { localStorage.setItem(key, JSON.stringify(value)); }
      catch (_) { discardSavedChoice(); }
      apply(value);
      settings.focus();
    });
  });
  settings.addEventListener('click', function () {
    panel.hidden = false;
    wrapper.querySelector('[data-choice]').focus();
  });
  close.addEventListener('click', function () { panel.hidden = true; settings.focus(); });
  window.addEventListener('storage', function (event) { if (event.key === key || event.key === null) refresh(); });
  window.addEventListener('pageshow', refresh);
  document.addEventListener('visibilitychange', function () { if (!document.hidden) refresh(); });
  refresh();
}());
