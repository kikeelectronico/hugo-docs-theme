// Theme toggle, mobile menu and tabs
(function () {
  var root = document.documentElement;

  // Light / dark mode
  var themeBtn = document.querySelector('.theme-toggle');
  if (themeBtn) {
    themeBtn.addEventListener('click', function () {
      var next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', next);
      try { localStorage.setItem('theme', next); } catch (e) {}
    });
  }

  // Mobile menu (labels are rendered by Hugo in data-* attributes)
  var sideBtn = document.querySelector('.sidebar-toggle');
  if (sideBtn) {
    sideBtn.addEventListener('click', function () {
      var open = root.classList.toggle('sidebar-open');
      sideBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
      sideBtn.setAttribute('aria-label', open ? sideBtn.dataset.labelClose : sideBtn.dataset.labelOpen);
    });
  }

  // Tabs: built from the panels rendered by the shortcode
  document.querySelectorAll('.tabs').forEach(function (tabs, n) {
    var panels = Array.prototype.slice.call(tabs.querySelectorAll(':scope > .tab-panel'));
    if (!panels.length) return;

    var list = document.createElement('div');
    list.className = 'tab-list';
    list.setAttribute('role', 'tablist');

    var buttons = panels.map(function (panel, i) {
      var id = 'tab-' + n + '-' + i;
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.id = id;
      btn.setAttribute('role', 'tab');
      btn.setAttribute('aria-controls', id + '-panel');
      btn.textContent = panel.getAttribute('data-label');
      panel.id = id + '-panel';
      panel.setAttribute('role', 'tabpanel');
      panel.setAttribute('aria-labelledby', id);
      btn.addEventListener('click', function () { select(i); });
      btn.addEventListener('keydown', function (e) {
        if (e.key === 'ArrowRight') { select((i + 1) % panels.length, true); e.preventDefault(); }
        if (e.key === 'ArrowLeft') { select((i - 1 + panels.length) % panels.length, true); e.preventDefault(); }
      });
      list.appendChild(btn);
      return btn;
    });

    function select(index, focus) {
      panels.forEach(function (p, i) {
        p.hidden = i !== index;
        buttons[i].setAttribute('aria-selected', i === index ? 'true' : 'false');
        buttons[i].tabIndex = i === index ? 0 : -1;
      });
      if (focus) buttons[index].focus();
    }

    tabs.insertBefore(list, tabs.firstChild);
    var start = panels.findIndex(function (p) { return p.hasAttribute('data-default'); });
    select(start < 0 ? 0 : start);
  });
})();

// "On this page" index: highlight the section being read
(function () {
  var links = Array.prototype.slice.call(document.querySelectorAll('.content-toc nav a[href^="#"]'));
  if (!links.length) return;

  var items = links.map(function (a) {
    var el = document.getElementById(decodeURIComponent(a.getAttribute('href').slice(1)));
    return el ? { a: a, el: el } : null;
  }).filter(Boolean);
  if (!items.length) return;

  // A bit more than the height of the top bar
  var navbarHeight = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--navbar-h')) || 60;
  var offset = navbarHeight + 30;
  var ticking = false;

  function update() {
    ticking = false;
    var current = null;
    for (var i = 0; i < items.length; i++) {
      if (items[i].el.getBoundingClientRect().top <= offset) current = items[i];
      else break;
    }
    if (!current) current = items[0]; // top of the page: first section
    var doc = document.documentElement;
    var scrollable = doc.scrollHeight > window.innerHeight + 10;
    if (scrollable && window.innerHeight + window.scrollY >= doc.scrollHeight - 2) {
      current = items[items.length - 1];
    }
    items.forEach(function (it) {
      var on = it === current;
      it.a.classList.toggle('active', on);
      if (on) it.a.setAttribute('aria-current', 'location');
      else it.a.removeAttribute('aria-current');
    });
  }

  function onScroll() {
    if (!ticking) { ticking = true; requestAnimationFrame(update); }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  update();
})();

// "On this page" index: smooth scrolling when a section is clicked
(function () {
  var toc = document.querySelector('.content-toc nav');
  if (!toc) return;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  toc.addEventListener('click', function (e) {
    var a = e.target.closest('a[href^="#"]');
    if (!a) return;
    var el = document.getElementById(decodeURIComponent(a.getAttribute('href').slice(1)));
    if (!el) return;
    e.preventDefault();
    el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
    history.pushState(null, '', a.getAttribute('href'));
  });
})();

// Lightbox: clicking a documentation image opens it full screen
// (labels are rendered by Hugo in data-* attributes of <body>)
(function () {
  var imgs = Array.prototype.slice.call(document.querySelectorAll('.markdown img'));
  if (!imgs.length || typeof HTMLDialogElement === 'undefined') return;

  var dialog = document.createElement('dialog');
  dialog.className = 'lightbox';
  dialog.setAttribute('aria-label', document.body.dataset.lightboxLabel || '');
  dialog.innerHTML =
    '<button type="button" class="lightbox-close">×</button>' +
    '<figure class="lightbox-figure"><img alt=""><figcaption></figcaption></figure>';
  dialog.querySelector('.lightbox-close').setAttribute('aria-label', document.body.dataset.lightboxClose || '');
  document.body.appendChild(dialog);

  var big = dialog.querySelector('img');
  var caption = dialog.querySelector('figcaption');
  var lastFocus = null;

  function open(img) {
    lastFocus = img;
    big.src = img.getAttribute('data-full') || img.currentSrc || img.src;
    big.alt = img.alt;
    caption.textContent = img.alt;
    document.documentElement.classList.add('lightbox-open');
    dialog.showModal();
  }

  function close() { dialog.close(); }

  dialog.addEventListener('click', close); // clicking anywhere closes it
  dialog.addEventListener('close', function () {
    document.documentElement.classList.remove('lightbox-open');
    big.removeAttribute('src');
    if (lastFocus) lastFocus.focus({ preventScroll: true });
  });

  imgs.forEach(function (img) {
    if (img.closest('a') || img.classList.contains('no-zoom')) return; // leave links and .no-zoom images alone
    img.classList.add('zoomable');
    img.tabIndex = 0;
    img.setAttribute('role', 'button');
    img.addEventListener('click', function () { open(img); });
    img.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(img); }
    });
  });
})();

// YouTube: prior consent
// The consent placeholder (texts included) is rendered once by the `yt`
// shortcode. Here it is only wired up, replaced by the player when consent is
// given and put back when it is revoked.
(function () {
  var CONSENT_KEY = 'youtube-consent';
  var GRANTED_VALUE = 'granted';

  var videos = Array.prototype.slice.call(
    document.querySelectorAll('.video[data-youtube-id]')
  );
  var revokeButtons = document.querySelectorAll('.youtube-consent-revoke');
  var placeholders = new Map();

  function hasConsent() {
    try {
      return localStorage.getItem(CONSENT_KEY) === GRANTED_VALUE;
    } catch (e) {
      return false;
    }
  }

  function saveConsent() {
    try {
      localStorage.setItem(CONSENT_KEY, GRANTED_VALUE);
    } catch (e) {}
  }

  function updateRevokeButton() {
    var granted = hasConsent();
    revokeButtons.forEach(function (button) {
      button.hidden = !granted;
    });
  }

  function mountVideo(container) {
    var videoId = container.getAttribute('data-youtube-id');

    if (!/^[A-Za-z0-9_-]{11}$/.test(videoId || '')) {
      return;
    }

    // Do not create a second iframe if there is one already.
    if (container.querySelector('iframe')) {
      return;
    }

    var iframe = document.createElement('iframe');
    iframe.src =
      'https://www.youtube-nocookie.com/embed/' +
      encodeURIComponent(videoId) +
      '?rel=0&playsinline=1';
    iframe.title = container.getAttribute('data-video-title') || '';
    iframe.loading = 'lazy';
    iframe.referrerPolicy = 'strict-origin-when-cross-origin';
    iframe.allow =
      'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
    iframe.allowFullscreen = true;

    // Replace the placeholder with the player.
    container.replaceChildren(iframe);
  }

  function showPlaceholder(container) {
    var placeholder = placeholders.get(container);
    if (placeholder) container.replaceChildren(placeholder);
  }

  function grantConsent() {
    saveConsent();
    updateRevokeButton();
    // Load every video, without autoplay.
    videos.forEach(mountVideo);
  }

  function revokeConsent() {
    try {
      localStorage.removeItem(CONSENT_KEY);
    } catch (e) {}

    // Remove the players and show the placeholders again.
    videos.forEach(showPlaceholder);
    updateRevokeButton();
  }

  videos.forEach(function (video) {
    var placeholder = video.querySelector('.video-consent-placeholder');
    if (!placeholder) return;
    placeholders.set(video, placeholder);
    var button = placeholder.querySelector('.video-consent-button');
    if (button) button.addEventListener('click', grantConsent);
  });

  revokeButtons.forEach(function (button) {
    button.addEventListener('click', revokeConsent);
  });

  if (hasConsent()) {
    videos.forEach(mountVideo);
  }

  updateRevokeButton();
})();
