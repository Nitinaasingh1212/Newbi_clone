// OSH Entertainment: shared site script, loaded on every page before the page's own script.
// Renders the header, mobile drawer, bottom tab bar and footer; handles the theme, search,
// notifications, saved events and sign-in state; and provides the API client and helpers
// (window.OSH) used by the page scripts in /osh/pages/.
(function () {
  'use strict';

  var API = '/api/v1';
  var KEYS = { token: 'osh_token', me: 'osh_me', theme: 'osh_theme', saved: 'osh_saved', tickets: 'osh_tickets', seen: 'osh_seen_updates' };

  // ---- storage ------------------------------------------------------------------
  function read(key, area) { try { return (area || localStorage).getItem(key); } catch (e) { return null; } }
  function write(key, value, area) {
    try { if (value == null) (area || localStorage).removeItem(key); else (area || localStorage).setItem(key, value); } catch (e) {}
  }
  function readJson(key, fallback, area) {
    try { var v = JSON.parse(read(key, area)); return v == null ? fallback : v; } catch (e) { return fallback; }
  }
  // Sessions from the earlier volunteer portal keep working.
  if (!read(KEYS.token) && read('nbv_token')) { write(KEYS.token, read('nbv_token')); write('nbv_token', null); }

  function esc(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  // ---- icons (stroke icons on a 24px grid) -----------------------------------------
  var ICONS = {
    search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
    moon: '<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>',
    bell: '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>',
    menu: '<path d="M4 6h16M4 12h16M4 18h16"/>',
    x: '<path d="M18 6 6 18M6 6l12 12"/>',
    calendar: '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
    calendarCheck: '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18M9 16l2 2 4-4"/>',
    clock: '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
    pin: '<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>',
    heart: '<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>',
    share: '<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="m8.59 13.51 6.83 3.98M15.41 6.51l-6.82 3.98"/>',
    arrowRight: '<path d="M5 12h14M12 5l7 7-7 7"/>',
    arrowLeft: '<path d="M19 12H5M12 19l-7-7 7-7"/>',
    filter: '<path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6"/>',
    users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>',
    user: '<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
    home: '<path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="M9 22V12h6v10"/>',
    building: '<rect x="4" y="2" width="16" height="20" rx="2"/><path d="M9 22v-4h6v4M8 6h.01M16 6h.01M12 6h.01M12 10h.01M12 14h.01M16 10h.01M16 14h.01M8 10h.01M8 14h.01"/>',
    info: '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>',
    handshake: '<path d="m11 17 2 2a1 1 0 1 0 3-3"/><path d="m14 14 2.5 2.5a1 1 0 1 0 3-3l-3.88-3.88a3 3 0 0 0-4.24 0l-.88.88a1 1 0 1 1-3-3l2.81-2.81a5.79 5.79 0 0 1 7.06-.87l.47.28a2 2 0 0 0 1.42.25L21 4"/><path d="m21 3 1 11h-2M3 3 2 14l6.5 6.5a1 1 0 1 0 3-3M3 4h8"/>',
    ticket: '<path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/><path d="M13 5v2M13 17v2M13 11v2"/>',
    award: '<circle cx="12" cy="8" r="6"/><path d="M15.48 12.89 17 22l-5-3-5 3 1.52-9.11"/>',
    network: '<rect x="16" y="16" width="6" height="6" rx="1"/><rect x="2" y="16" width="6" height="6" rx="1"/><rect x="9" y="2" width="6" height="6" rx="1"/><path d="M5 16v-3a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v3M12 12V8"/>',
    trendingUp: '<path d="m22 7-8.5 8.5-5-5L2 17"/><path d="M16 7h6v6"/>',
    star: '<path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>',
    monitor: '<rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/>',
    mic: '<path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v3"/>',
    rocket: '<path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/>',
    music: '<path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>',
    utensils: '<path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2M7 2v20M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/>',
    trophy: '<path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6M18 9h1.5a2.5 2.5 0 0 0 0-5H18M4 22h16M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/>',
    code: '<path d="m16 18 6-6-6-6M8 6l-6 6 6 6"/>',
    bag: '<path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18M16 10a4 4 0 0 1-8 0"/>',
    sparkles: '<path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z"/>',
    check: '<path d="M20 6 9 17l-5-5"/>',
    checkCircle: '<circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/>',
    shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>',
    mail: '<rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-10 5L2 7"/>',
    phone: '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/>',
    logOut: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>',
    megaphone: '<path d="m3 11 18-5v12L3 14v-3z"/><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6"/>',
    camera: '<path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/>',
    truck: '<path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2M15 18H9M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.62l-3.48-4.35A1 1 0 0 0 17.52 8H14"/><circle cx="17" cy="18" r="2"/><circle cx="7" cy="18" r="2"/>',
    target: '<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>',
    download: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/>',
    activity: '<path d="M22 12h-4l-3 9L9 3l-3 9H2"/>',
    clipboard: '<rect x="8" y="2" width="8" height="4" rx="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>',
    heartHand: '<path d="M11 14h2a2 2 0 1 0 0-4h-3c-.6 0-1.1.2-1.4.6L3 16"/><path d="m7 20 1.6-1.4c.3-.4.8-.6 1.4-.6h4c1.1 0 2.1-.4 2.8-1.2l4.6-4.4a2 2 0 0 0-2.75-2.91l-4.2 3.9M2 15l6 6"/><path d="M19.5 8.5c.7-.7 1.5-1.6 1.5-2.7A2.73 2.73 0 0 0 16 4a2.78 2.78 0 0 0-5 1.8c0 1.2.8 2 1.5 2.8L16 12Z"/>',
  };
  function icon(name, size) {
    var s = size || 20;
    return '<svg class="icon" width="' + s + '" height="' + s + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (ICONS[name] || ICONS.star) + '</svg>';
  }

  // Picks an icon for an event highlight such as "Live Demos" or "Food Court".
  var HIGHLIGHT_ICONS = [
    [/demo|screen|exhibit|expo/i, 'monitor'], [/talk|speaker|comic|mic|stand-up/i, 'mic'], [/startup|launch|rocket/i, 'rocket'],
    [/network|meet|greet/i, 'network'], [/music|band|dj|dhol|headliner|acts|concert/i, 'music'], [/food|meal|court|stall|snack/i, 'utensils'],
    [/trophy|prize|ceremony|cup|knockout|teams|tournament/i, 'trophy'], [/code|hack|mentor/i, 'code'], [/craft|bazaar|merch|giveaway|raffle|custom/i, 'bag'],
    [/certificate|award/i, 'award'], [/safety|first aid|drill|secure/i, 'shield'], [/route|run|medal|5k|fitness/i, 'activity'],
    [/guest|handling|crowd/i, 'users'], [/dance|garba|dressed|fashion|light|laser|lantern|show/i, 'sparkles'], [/game|zone/i, 'target'],
  ];
  function highlightIcon(label) {
    for (var i = 0; i < HIGHLIGHT_ICONS.length; i++) if (HIGHLIGHT_ICONS[i][0].test(label)) return HIGHLIGHT_ICONS[i][1];
    return 'star';
  }

  // ---- API client -------------------------------------------------------------------
  function api(path, options) {
    options = options || {};
    var headers = {};
    if (options.body) headers['Content-Type'] = 'application/json';
    var t = options.token === undefined ? null : options.token;
    if (t) headers.Authorization = 'Bearer ' + t;
    return fetch(API + path, { method: options.method || 'GET', headers: headers, body: options.body ? JSON.stringify(options.body) : undefined })
      .catch(function () {
        var e = new Error("Can't reach the server. Check your connection and try again.");
        e.code = 'network';
        throw e;
      })
      .then(function (res) {
        return res.json().catch(function () { return null; }).then(function (data) {
          if (data && data.success) return data;
          var info = (data && data.error) || {};
          var err = new Error(info.message || 'Something went wrong. Please try again.');
          err.code = info.code || 'http_' + res.status;
          err.status = res.status;
          err.details = info.details || {};
          throw err;
        });
      });
  }

  // ---- dates and money ------------------------------------------------------------
  function localDate(iso) { var p = String(iso).split('-').map(Number); return new Date(p[0], p[1] - 1, p[2]); }
  function isoOf(d) { return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }
  function todayIso() { return isoOf(new Date()); }
  function prettyDate(iso, opts) { return localDate(iso).toLocaleDateString('en-IN', opts || { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }); }
  function prettyTime(t) {
    if (!t) return '';
    var p = t.split(':'); var h = Number(p[0]); var suffix = h >= 12 ? 'PM' : 'AM';
    h = h % 12 || 12;
    return h + ':' + p[1] + ' ' + suffix;
  }
  function timeRange(e) { return e.startTime ? prettyTime(e.startTime) + (e.endTime ? ' – ' + prettyTime(e.endTime) : '') : ''; }
  function money(n) { return '₹' + Number(n).toLocaleString('en-IN'); }
  function whenText(iso) {
    var days = Math.round((localDate(iso) - localDate(todayIso())) / 86400000);
    return days <= 0 ? 'Today' : days === 1 ? 'Tomorrow' : 'In ' + days + ' days';
  }
  function priceInfo(e) {
    var prices = (e.tickets || []).map(function (t) { return t.price; });
    if (!prices.length) return { text: 'Free entry', cta: 'View details', free: true };
    var min = Math.min.apply(null, prices), max = Math.max.apply(null, prices);
    if (max === 0) return { text: 'Free', cta: 'Register', free: true };
    if (min === max) return { text: money(min), cta: 'Book Now', free: false };
    return { text: min === 0 ? 'Free – ' + money(max) : 'From ' + money(min), cta: 'Book Now', free: false };
  }

  // ---- toast ----------------------------------------------------------------------
  var toastEl;
  function toast(message) {
    if (!toastEl) {
      toastEl = document.createElement('div');
      toastEl.className = 'toast'; toastEl.setAttribute('role', 'status'); toastEl.setAttribute('aria-live', 'polite');
      document.body.appendChild(toastEl);
    }
    toastEl.textContent = message;
    toastEl.classList.add('on');
    clearTimeout(toast.t);
    toast.t = setTimeout(function () { toastEl.classList.remove('on'); }, 3000);
  }

  // ---- session --------------------------------------------------------------------
  var auth = {
    token: function () { return read(KEYS.token); },
    me: function () { return readJson(KEYS.me, null); },
    signIn: function (token, volunteer) { write(KEYS.token, token); if (volunteer) auth.remember(volunteer); },
    remember: function (volunteer) { write(KEYS.me, JSON.stringify({ id: volunteer.id, name: volunteer.name, email: volunteer.email || null, phone: volunteer.phone, city: volunteer.city, demo: Boolean(volunteer.demo) })); },
    signOut: function () { write(KEYS.token, null); write(KEYS.me, null); },
  };

  // Events saved with the heart button (this browser only).
  var saved = {
    list: function () { return readJson(KEYS.saved, []); },
    has: function (id) { return saved.list().indexOf(id) !== -1; },
    toggle: function (id) {
      var list = saved.list(); var i = list.indexOf(id);
      if (i === -1) list.push(id); else list.splice(i, 1);
      write(KEYS.saved, JSON.stringify(list));
      return i === -1;
    },
  };

  // Tickets booked in this browser, so they show up in the profile even when signed out.
  var tickets = {
    list: function () { return readJson(KEYS.tickets, []); },
    add: function (booking, event) {
      var list = tickets.list().filter(function (x) { return x.booking.id !== booking.id; });
      list.unshift({ booking: booking, event: event });
      write(KEYS.tickets, JSON.stringify(list.slice(0, 30)));
    },
    get: function (id) { return tickets.list().filter(function (x) { return x.booking.id === id; })[0] || null; },
  };

  // ---- event card -----------------------------------------------------------------
  function eventCard(e, opts) {
    opts = opts || {};
    var p = priceInfo(e);
    var href = '/events/' + encodeURIComponent(e.id);
    var when = prettyDate(e.date, { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }) + (e.startTime ? ' · ' + prettyTime(e.startTime) : '');
    return '<article class="ev-card" data-event="' + esc(e.id) + '">' +
      '<div style="position:relative">' +
      '<a class="ev-media" href="' + href + '" tabindex="-1" aria-hidden="true">' +
      (e.image ? '<img src="' + esc(e.image) + '" alt="" loading="lazy">' : '') +
      (e.category ? '<span class="ev-cat">' + esc(e.category) + '</span>' : '') + '</a>' +
      '</div>' +
      '<button class="ev-heart" type="button" data-save="' + esc(e.id) + '" aria-pressed="' + saved.has(e.id) + '" aria-label="Save ' + esc(e.title) + '">' + icon('heart', 18) + '</button>' +
      (opts.status || '') +
      '<div class="ev-body">' +
      '<h3><a href="' + href + '">' + esc(e.title) + '</a></h3>' +
      '<p class="ev-meta">' + icon('calendar', 15) + esc(when) + '</p>' +
      '<p class="ev-meta">' + icon('pin', 15) + esc(e.venue + (e.city ? ', ' + e.city : '')) + '</p>' +
      (opts.extra || '') +
      (opts.hideFoot ? '' : '<div class="ev-foot"><span class="ev-price">' + esc(p.text) + '</span>' +
        (e.bookable === false ? '<span class="badge">Bookings closed</span>' : '<a class="ev-cta" href="' + href + '/book">' + esc(p.cta) + ' ' + icon('arrowRight', 14) + '</a>') + '</div>') +
      '</div></article>';
  }

  // Heart buttons anywhere on the page.
  document.addEventListener('click', function (ev) {
    var btn = ev.target.closest && ev.target.closest('[data-save]');
    if (!btn) return;
    ev.preventDefault();
    var on = saved.toggle(btn.getAttribute('data-save'));
    document.querySelectorAll('[data-save="' + btn.getAttribute('data-save') + '"]').forEach(function (b) { b.setAttribute('aria-pressed', String(on)); });
    toast(on ? 'Saved to your events' : 'Removed from saved');
    document.dispatchEvent(new CustomEvent('osh:saved'));
  });

  // ---- theme ----------------------------------------------------------------------
  function isDark() { return document.documentElement.classList.contains('dark'); }
  function setTheme(dark) {
    document.documentElement.classList.toggle('dark', dark);
    write(KEYS.theme, dark ? 'dark' : 'light');
    document.querySelectorAll('[data-theme-toggle]').forEach(function (b) {
      b.innerHTML = icon(dark ? 'sun' : 'moon', 20) + (b.classList.contains('btn') ? ' ' + (dark ? 'Light mode' : 'Dark mode') : '');
    });
  }

  // ---- header, drawer, tab bar, footer ----------------------------------------------
  var NAV = [['/', 'Home', 'home'], ['/events', 'Events', 'calendar'], ['/volunteer', 'Volunteer', 'users'], ['/organize', 'Organize', 'building'], ['/about', 'About', 'info']];
  var path = location.pathname.replace(/\/+$/, '') || '/';
  function section() {
    if (path === '/') return '/';
    if (/^\/(events|bookings)/.test(path)) return '/events';
    if (/^\/volunteer/.test(path)) return '/volunteer';
    if (/^\/profile/.test(path)) return '/profile';
    var m = /^\/[^/]+/.exec(path);
    return m ? m[0] : '/';
  }
  var current = section();
  function profileHref() { return auth.token() ? '/profile' : '/volunteer/login?next=%2Fprofile'; }

  function renderHeader() {
    var slot = document.getElementById('site-header');
    if (!slot) return;
    var me = auth.me();
    var signedIn = Boolean(auth.token());
    slot.outerHTML =
      '<a class="sr-only" href="#main">Skip to content</a>' +
      '<header class="hdr"><div class="container hdr-in">' +
      '<a class="brand" href="/" aria-label="OSH Entertainment home"><img class="logo-light" src="/osh/img/osh-logo.png" alt="OSH Entertainment" width="80" height="46"><img class="logo-dark" src="/osh/img/osh-logo-dark.png" alt="OSH Entertainment" width="80" height="46"></a>' +
      '<nav class="hdr-nav" aria-label="Main">' + NAV.map(function (n) {
        return '<a href="' + n[0] + '"' + (current === n[0] ? ' class="active" aria-current="page"' : '') + '>' + n[1] + '</a>';
      }).join('') + '</nav>' +
      '<div class="hdr-actions">' +
      '<button class="icon-btn" type="button" data-open-search aria-label="Search events">' + icon('search') + '</button>' +
      '<button class="icon-btn theme-btn" type="button" data-theme-toggle aria-label="Switch light or dark mode">' + icon(isDark() ? 'sun' : 'moon') + '</button>' +
      '<div class="notif"><button class="icon-btn" type="button" id="notif-btn" aria-label="Notifications" aria-expanded="false" aria-controls="notif-panel">' + icon('bell') + '<span class="dot" hidden></span></button>' +
      '<div class="card notif-panel" id="notif-panel" hidden></div></div>' +
      (signedIn
        ? '<a class="avatar" href="/profile" title="' + esc(me ? me.name : 'My profile') + '" aria-label="My profile">' + esc(me && me.name ? me.name.charAt(0).toUpperCase() : '•') + '</a>'
        : '<a class="btn btn-sm hdr-signin" href="/volunteer/login">Sign In</a>') +
      '<button class="icon-btn hdr-menu" type="button" id="menu-btn" aria-label="Open menu" aria-expanded="false" aria-controls="drawer">' + icon('menu') + '</button>' +
      '</div></div>' +
      '<div class="drawer" id="drawer" hidden><nav aria-label="Menu">' + NAV.map(function (n) {
        return '<a class="nav-link' + (current === n[0] ? ' active' : '') + '" href="' + n[0] + '">' + icon(n[2], 22) + n[1] + '</a>';
      }).join('') +
      '<a class="nav-link' + (current === '/profile' ? ' active' : '') + '" href="' + profileHref() + '">' + icon('user', 22) + 'My profile</a></nav>' +
      '<div class="drawer-actions">' +
      (signedIn ? '<a class="btn btn-block" href="/profile">Go to my profile</a>' : '<a class="btn btn-block" href="/volunteer/login">Sign In</a><a class="btn btn-outline btn-block" href="/volunteer">Join as Volunteer</a>') +
      '<button class="btn btn-ghost btn-block" type="button" data-theme-toggle>' + icon(isDark() ? 'sun' : 'moon') + ' ' + (isDark() ? 'Light mode' : 'Dark mode') + '</button>' +
      '</div></div></header>';
  }

  function renderTabbar() {
    var tabs = [['/', 'Home', 'home'], ['/events', 'Events', 'calendar'], ['/volunteer', 'Volunteer', 'users'], [profileHref(), 'Profile', 'user', '/profile']];
    var nav = document.createElement('nav');
    nav.className = 'tabbar';
    nav.setAttribute('aria-label', 'Quick links');
    nav.innerHTML = tabs.map(function (t) {
      var on = current === (t[3] || t[0]);
      return '<a href="' + t[0] + '"' + (on ? ' class="active" aria-current="page"' : '') + '>' + icon(t[2], 22) + '<span>' + t[1] + '</span></a>';
    }).join('');
    document.body.appendChild(nav);
  }

  function renderFooter() {
    var slot = document.getElementById('site-footer');
    if (!slot) return;
    slot.outerHTML =
      '<footer class="ftr"><div class="container ftr-grid">' +
      '<div><a href="/" aria-label="OSH Entertainment home"><img src="/osh/img/osh-logo.png" alt="OSH Entertainment" class="logo-light-f"></a>' +
      '<p>Discover, organise and experience events across India, and help run them as an OSH volunteer.</p></div>' +
      '<div><h4>Explore</h4><ul><li><a href="/events">Events</a></li><li><a href="/volunteer">Volunteer</a></li><li><a href="/organize">Organize an event</a></li><li><a href="/about">About OSH</a></li></ul></div>' +
      '<div><h4>Your account</h4><ul><li><a href="/volunteer/login">Sign in</a></li><li><a href="/volunteer">Join as volunteer</a></li><li><a href="' + profileHref() + '">My profile &amp; tickets</a></li></ul></div>' +
      '<div><h4>Legal</h4><ul><li><a href="/terms">Terms &amp; Conditions</a></li><li><a href="/privacy">Privacy Policy</a></li><li><a href="/credits">Photo credits</a></li></ul></div>' +
      '</div><div class="container ftr-bottom"><span>© ' + new Date().getFullYear() + ' OSH Entertainment. All rights reserved.</span><span>Prototype build</span></div></footer>';
    // The dark-mode logo in the footer.
    var img = document.querySelector('.ftr img');
    if (img && isDark()) img.src = '/osh/img/osh-logo-dark.png';
  }

  function renderSearch() {
    var wrap = document.createElement('div');
    wrap.className = 'search-overlay';
    wrap.hidden = true;
    wrap.setAttribute('role', 'dialog');
    wrap.setAttribute('aria-modal', 'true');
    wrap.setAttribute('aria-label', 'Search events');
    wrap.innerHTML =
      '<div class="card search-box"><form action="/events" method="get" role="search">' + icon('search', 22) +
      '<label class="sr-only" for="site-search">Search events</label>' +
      '<input class="input" id="site-search" name="q" placeholder="Search events, categories, or locations…" autocomplete="off">' +
      '<button class="x" type="button" data-close-search aria-label="Close search">' + icon('x') + '</button></form>' +
      '<div class="search-suggest"><p>Popular searches</p><div class="chips" style="flex-wrap:wrap">' +
      ['Cultural', 'Technical', 'Workshop', 'Sports', 'Fest', 'Concert'].map(function (c) { return '<a class="chip" href="/events?category=' + c + '">' + c + '</a>'; }).join('') +
      ['Delhi', 'Mumbai', 'Bengaluru'].map(function (c) { return '<a class="chip" href="/events?city=' + c + '">' + icon('pin', 14) + c + '</a>'; }).join('') +
      '</div></div></div>';
    document.body.appendChild(wrap);
    function open() { wrap.hidden = false; setTimeout(function () { wrap.querySelector('input').focus(); }, 0); }
    function close() { wrap.hidden = true; }
    document.addEventListener('click', function (ev) {
      if (ev.target.closest('[data-open-search]')) open();
      else if (ev.target.closest('[data-close-search]') || ev.target === wrap) close();
    });
    document.addEventListener('keydown', function (ev) {
      if (ev.key === 'Escape' && !wrap.hidden) close();
      var typing = /input|textarea|select/i.test((document.activeElement || {}).tagName || '');
      if (!typing && (ev.key === '/' || ((ev.ctrlKey || ev.metaKey) && ev.key.toLowerCase() === 'k'))) { ev.preventDefault(); open(); }
    });
  }

  // ---- notifications ----------------------------------------------------------------
  var STATUS_TEXT = {
    applied: ['clock', 'Application sent', 'Waiting for the team to approve you for'],
    approved: ['checkCircle', "You're on the team", 'Approved to volunteer at'],
    rejected: ['info', 'Not selected this time', 'Your application was not selected for'],
    completed: ['star', 'Shift completed', 'You were rated for'],
    no_show: ['info', 'Marked as no-show', 'You were marked absent at'],
  };
  function updatesFrom(applications) {
    return applications.filter(function (a) { return a.status !== 'withdrawn' && STATUS_TEXT[a.status] && a.event; }).slice(0, 6).map(function (a) {
      var s = STATUS_TEXT[a.status];
      var extra = a.status === 'completed' && a.review && a.review.rating ? ' ' + '★'.repeat(a.review.rating) : '';
      return { key: a.id + ':' + a.status, icon: s[0], title: s[1], text: s[2] + ' ' + a.event.title + extra };
    });
  }
  function initNotifications() {
    var btn = document.getElementById('notif-btn');
    var panel = document.getElementById('notif-panel');
    if (!btn) return;
    var dot = btn.querySelector('.dot');
    var updates = null;
    function seen() { return readJson(KEYS.seen, []); }
    function load() {
      if (!auth.token()) return Promise.resolve([]);
      return api('/volunteer/applications', { token: auth.token() })
        .then(function (res) { updates = updatesFrom(res.applications); return updates; })
        .catch(function (err) { if (err.status === 401) auth.signOut(); updates = []; return updates; });
    }
    function paint() {
      if (!auth.token()) {
        panel.innerHTML = '<h3>Notifications</h3><p class="notif-empty">Sign in to see updates on your volunteer applications and shifts.</p>' +
          '<div style="padding:4px 12px 12px"><a class="btn btn-sm btn-block" href="/volunteer/login">Sign In</a></div>';
        return;
      }
      if (!updates) { panel.innerHTML = '<h3>Notifications</h3><p class="notif-empty">Loading…</p>'; return; }
      panel.innerHTML = '<h3>Notifications</h3>' + (updates.length
        ? updates.map(function (u) {
            return '<a class="notif-item" href="/profile"><span class="ico">' + icon(u.icon, 18) + '</span><span><b>' + esc(u.title) + '</b><span>' + esc(u.text) + '</span></span></a>';
          }).join('')
        : '<p class="notif-empty">No updates yet. Apply to an event and you\'ll see its status here.</p>');
    }
    btn.addEventListener('click', function (ev) {
      ev.stopPropagation();
      var open = panel.hidden;
      panel.hidden = !open;
      btn.setAttribute('aria-expanded', String(open));
      if (open) {
        paint();
        (updates ? Promise.resolve(updates) : load()).then(function () {
          paint();
          write(KEYS.seen, JSON.stringify((updates || []).map(function (u) { return u.key; })));
          dot.hidden = true;
        });
      }
    });
    document.addEventListener('click', function (ev) {
      if (!panel.hidden && !ev.target.closest('.notif')) { panel.hidden = true; btn.setAttribute('aria-expanded', 'false'); }
    });
    // Show the dot when something changed since the panel was last opened.
    if (auth.token()) setTimeout(function () {
      load().then(function (list) {
        var s = seen();
        dot.hidden = !list.some(function (u) { return s.indexOf(u.key) === -1; });
      });
    }, 400);
  }

  function initChrome() {
    renderHeader();
    renderFooter();
    renderTabbar();
    renderSearch();
    initNotifications();
    document.addEventListener('click', function (ev) {
      if (ev.target.closest('[data-theme-toggle]')) {
        setTheme(!isDark());
        var img = document.querySelector('.ftr img');
        if (img) img.src = isDark() ? '/osh/img/osh-logo-dark.png' : '/osh/img/osh-logo.png';
      }
    });
    var menuBtn = document.getElementById('menu-btn');
    var drawer = document.getElementById('drawer');
    if (menuBtn) menuBtn.addEventListener('click', function () {
      var open = drawer.hidden;
      drawer.hidden = !open;
      menuBtn.setAttribute('aria-expanded', String(open));
      menuBtn.innerHTML = icon(open ? 'x' : 'menu');
      document.body.style.overflow = open ? 'hidden' : '';
    });
  }

  function qs(name) { return new URLSearchParams(location.search).get(name); }
  // The id in /events/<id>, /events/<id>/book or /bookings/<id>.
  function pathId(index) { return decodeURIComponent(location.pathname.split('/').filter(Boolean)[index || 1] || ''); }

  window.OSH = {
    api: api, esc: esc, icon: icon, highlightIcon: highlightIcon, toast: toast, auth: auth, saved: saved, tickets: tickets,
    eventCard: eventCard, priceInfo: priceInfo, money: money, localDate: localDate, isoOf: isoOf, todayIso: todayIso,
    prettyDate: prettyDate, prettyTime: prettyTime, timeRange: timeRange, whenText: whenText, qs: qs, pathId: pathId,
    read: read, write: write, readJson: readJson,
  };

  initChrome();
})();
