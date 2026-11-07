// OSH Entertainment: shared site script, loaded on every page before the page's own script.
// Renders the header (logo, network name, Online status), the bottom tab bar and the footer;
// handles the theme and sign-in state; and provides the API client and helpers (window.OSH)
// used by the page scripts in /osh/pages/.
(function () {
  'use strict';

  var API = '/api/v1';
  var KEYS = { token: 'osh_token', me: 'osh_me', theme: 'osh_theme', options: 'osh_options_v1' };

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
  // Left over from the ticketing version of the site.
  write('osh_tickets', null); write('osh_saved', null); write('osh_seen_updates', null);

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
    x: '<path d="M18 6 6 18M6 6l12 12"/>',
    calendar: '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
    calendarCheck: '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18M9 16l2 2 4-4"/>',
    clock: '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
    pin: '<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>',
    share: '<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="m8.59 13.51 6.83 3.98M15.41 6.51l-6.82 3.98"/>',
    arrowRight: '<path d="M5 12h14M12 5l7 7-7 7"/>',
    arrowLeft: '<path d="M19 12H5M12 19l-7-7 7-7"/>',
    users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>',
    user: '<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
    userPlus: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M19 8v6M22 11h-6"/>',
    home: '<path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="M9 22V12h6v10"/>',
    building: '<rect x="4" y="2" width="16" height="20" rx="2"/><path d="M9 22v-4h6v4M8 6h.01M16 6h.01M12 6h.01M12 10h.01M12 14h.01M16 10h.01M16 14h.01M8 10h.01M8 14h.01"/>',
    store: '<path d="M3 9l1.5-5h15L21 9"/><path d="M3 9h18v1.5a3 3 0 0 1-6 0 3 3 0 0 1-6 0 3 3 0 0 1-6 0Z"/><path d="M5 13.5V21h14v-7.5M10 21v-5h4v5"/>',
    grid: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/>',
    graduation: '<path d="M22 10 12 5 2 10l10 5 10-5Z"/><path d="M6 12v5c3 3 9 3 12 0v-5M22 10v6"/>',
    info: '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>',
    award: '<circle cx="12" cy="8" r="6"/><path d="M15.48 12.89 17 22l-5-3-5 3 1.52-9.11"/>',
    network: '<rect x="16" y="16" width="6" height="6" rx="1"/><rect x="2" y="16" width="6" height="6" rx="1"/><rect x="9" y="2" width="6" height="6" rx="1"/><path d="M5 16v-3a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v3M12 12V8"/>',
    trendingUp: '<path d="m22 7-8.5 8.5-5-5L2 17"/><path d="M16 7h6v6"/>',
    star: '<path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>',
    monitor: '<rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/>',
    mic: '<path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v3"/>',
    music: '<path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>',
    utensils: '<path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2M7 2v20M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/>',
    trophy: '<path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6M18 9h1.5a2.5 2.5 0 0 0 0-5H18M4 22h16M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/>',
    bag: '<path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18M16 10a4 4 0 0 1-8 0"/>',
    sparkles: '<path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z"/>',
    check: '<path d="M20 6 9 17l-5-5"/>',
    checkCircle: '<circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/>',
    shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>',
    mail: '<rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-10 5L2 7"/>',
    phone: '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/>',
    logOut: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>',
    message: '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/><path d="M8 8h8M8 12h5"/>',
    megaphone: '<path d="m3 11 18-5v12L3 14v-3z"/><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6"/>',
    camera: '<path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/>',
    target: '<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>',
    activity: '<path d="M22 12h-4l-3 9L9 3l-3 9H2"/>',
    clipboard: '<rect x="8" y="2" width="8" height="4" rx="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>',
    barChart: '<path d="M3 3v18h18"/><path d="M8 17v-5M13 17V8M18 17v-9"/>',
    lock: '<rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    heartHand: '<path d="M11 14h2a2 2 0 1 0 0-4h-3c-.6 0-1.1.2-1.4.6L3 16"/><path d="m7 20 1.6-1.4c.3-.4.8-.6 1.4-.6h4c1.1 0 2.1-.4 2.8-1.2l4.6-4.4a2 2 0 0 0-2.75-2.91l-4.2 3.9M2 15l6 6"/><path d="M19.5 8.5c.7-.7 1.5-1.6 1.5-2.7A2.73 2.73 0 0 0 16 4a2.78 2.78 0 0 0-5 1.8c0 1.2.8 2 1.5 2.8L16 12Z"/>',
  };
  function icon(name, size, cls) {
    var s = size || 20;
    return '<svg class="icon' + (cls ? ' ' + cls : '') + '" width="' + s + '" height="' + s + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (ICONS[name] || ICONS.star) + '</svg>';
  }

  // Picks an icon for an event highlight such as "Laser Show" or "Food Court".
  var HIGHLIGHT_ICONS = [
    [/talk|speaker|keynote|panel|mic/i, 'mic'], [/launch|reveal|demo|expo|booth/i, 'monitor'], [/network|lounge|guest/i, 'users'],
    [/music|band|dj|dhol|headline|act|artist|stage|concert|tour/i, 'music'], [/food|meal|dinner|lunch|court|stall|village/i, 'utensils'],
    [/award|ceremony|contest|battle|trophy|debate/i, 'trophy'], [/merch|market|flea/i, 'bag'], [/press|carpet/i, 'camera'],
    [/game|zone/i, 'target'], [/dance|fireworks|light|laser|show|sangeet|countdown|folk|night/i, 'sparkles'],
  ];
  function highlightIcon(label) {
    for (var i = 0; i < HIGHLIGHT_ICONS.length; i++) if (HIGHLIGHT_ICONS[i][0].test(label)) return HIGHLIGHT_ICONS[i][1];
    return 'star';
  }

  // Categories from the OSH brief, with the colour, icon and one-line description the site uses.
  var CATEGORIES = {
    'Music & Concerts': { key: 'music', tag: 'Music Concert', blurb: 'Concerts, DJ nights & tours', icon: 'mic', color: 'red' },
    'Corporate Events': { key: 'corporate', tag: 'Corporate', blurb: 'Conferences & award nights', icon: 'building', color: 'green' },
    'College Festivals': { key: 'college', tag: 'College Fest', blurb: 'Campus fests & youth events', icon: 'graduation', color: 'gold' },
    'Private Events': { key: 'private', tag: 'Private Event', blurb: 'Weddings & celebrations', icon: 'sparkles', color: 'violet' },
  };
  function categoryMeta(name) {
    return CATEGORIES[name] || { key: 'other', tag: name || 'Event', blurb: '', icon: 'calendar', color: 'blue' };
  }

  // ---- API client -------------------------------------------------------------------
  function api(path, options) {
    options = options || {};
    var headers = {};
    if (options.body) headers['Content-Type'] = 'application/json';
    if (options.token) headers.Authorization = 'Bearer ' + options.token;
    return fetch(API + path, { method: options.method || 'GET', headers: headers, body: options.body ? JSON.stringify(options.body) : undefined })
      .catch(function () {
        setOnline(false);
        var e = new Error("Can't reach the server. Check your connection and try again.");
        e.code = 'network';
        throw e;
      })
      .then(function (res) {
        setOnline(true);
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

  // Choice lists for the forms (categories, departments, cities ...), cached for the visit.
  var optionsPromise;
  function options() {
    if (!optionsPromise) {
      var cached = readJson(KEYS.options, null, sessionStorage);
      optionsPromise = cached ? Promise.resolve(cached) : api('/options').then(function (res) {
        write(KEYS.options, JSON.stringify(res), sessionStorage);
        return res;
      });
      optionsPromise.catch(function () { optionsPromise = null; });
    }
    return optionsPromise;
  }

  // ---- dates and text ------------------------------------------------------------
  function localDate(iso) { var p = String(iso).split('-').map(Number); return new Date(p[0], p[1] - 1, p[2]); }
  function isoOf(d) { return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }
  function todayIso() { return isoOf(new Date()); }
  function prettyDate(iso, opts) { return localDate(iso).toLocaleDateString('en-GB', opts || { day: '2-digit', month: 'short', year: 'numeric' }); }
  function prettyTime(t) {
    if (!t) return '';
    var p = t.split(':'); var h = Number(p[0]); var suffix = h >= 12 ? 'PM' : 'AM';
    h = h % 12 || 12;
    return h + ':' + p[1] + ' ' + suffix;
  }
  function timeRange(e) { return e.startTime ? prettyTime(e.startTime) + (e.endTime ? ' – ' + prettyTime(e.endTime) : '') : ''; }
  function whenText(iso) {
    var days = Math.round((localDate(iso) - localDate(todayIso())) / 86400000);
    return days <= 0 ? 'Today' : days === 1 ? 'Tomorrow' : 'In ' + days + ' days';
  }
  // "Lucknow · Phoenix Palassio, Lucknow"; just "Jaipur" when the venue is the city itself.
  function placeText(e) {
    if (!e.venue || e.venue.toLowerCase() === String(e.city).toLowerCase()) return e.city;
    return e.city + ' · ' + e.venue;
  }
  function firstSentence(text) {
    var t = String(text || '');
    var i = t.indexOf('. ');
    return i === -1 ? t : t.slice(0, i + 1);
  }
  function plural(n, one, many) { return n + ' ' + (n === 1 ? one : many || one + 's'); }

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
    toast.t = setTimeout(function () { toastEl.classList.remove('on'); }, 3200);
  }

  // ---- session --------------------------------------------------------------------
  var auth = {
    token: function () { return read(KEYS.token); },
    me: function () { return readJson(KEYS.me, null); },
    signIn: function (token, volunteer) { write(KEYS.token, token); if (volunteer) auth.remember(volunteer); },
    remember: function (volunteer) { write(KEYS.me, JSON.stringify({ id: volunteer.id, name: volunteer.name, phone: volunteer.phone, city: volunteer.city, cityKey: volunteer.cityKey, demo: Boolean(volunteer.demo) })); },
    signOut: function () { write(KEYS.token, null); write(KEYS.me, null); },
  };

  // ---- event (crew opportunity) card ------------------------------------------------
  // opts.status: badge HTML over the photo; opts.extra: HTML before the footer;
  // opts.hideFoot: leave out "Open for interest / I'm Interested".
  function eventCard(e, opts) {
    opts = opts || {};
    var c = categoryMeta(e.category);
    var href = '/events/' + encodeURIComponent(e.id);
    var d = localDate(e.date);
    var full = e.slotsLeft === 0;
    var positions = plural(e.volunteersNeeded, 'volunteer position') + (e.slotsLeft != null && e.slotsLeft < e.volunteersNeeded && !full ? ' · ' + e.slotsLeft + ' open' : '');
    return '<article class="ev-card" data-event="' + esc(e.id) + '">' +
      '<a class="ev-media" href="' + href + '" tabindex="-1" aria-hidden="true">' +
      (e.image ? '<img src="' + esc(e.image) + '" alt="" loading="lazy">' : '') +
      '<span class="ev-date"><b>' + d.getDate() + '</b><span>' + esc(d.toLocaleDateString('en-GB', { month: 'short' })) + '</span></span></a>' +
      (opts.status || '') +
      '<div class="ev-body">' +
      '<span class="ev-tag k-' + c.key + '">' + esc(c.tag) + '</span>' +
      '<h3><a href="' + href + '">' + esc(e.title) + '</a></h3>' +
      '<p class="ev-meta">' + icon('pin', 16, 'i-pin') + '<span>' + esc(placeText(e)) + '</span></p>' +
      '<p class="ev-meta">' + icon('calendar', 16, 'i-cal') + '<span>' + esc(prettyDate(e.date)) + (e.startTime ? ' · ' + esc(prettyTime(e.startTime)) : '') + '</span></p>' +
      '<p class="ev-meta">' + icon('users', 16, 'i-crew') + '<span>' + esc(positions) + '</span></p>' +
      (e.description ? '<p class="ev-desc">' + esc(firstSentence(e.description)) + '</p>' : '') +
      (opts.extra || '') +
      (opts.hideFoot ? '' : '<div class="ev-foot">' +
        (full ? '<span class="open-dot full">Positions filled</span><a class="ev-cta" href="' + href + '">View event</a>'
              : '<span class="open-dot">Open for interest</span><a class="ev-cta" href="' + href + '#interest">I’m Interested</a>') + '</div>') +
      '</div></article>';
  }

  // ---- theme ----------------------------------------------------------------------
  function isDark() { return document.documentElement.classList.contains('dark'); }
  function paintThemeButtons() {
    document.querySelectorAll('[data-theme-toggle]').forEach(function (b) {
      var label = isDark() ? 'Light mode' : 'Dark mode';
      b.setAttribute('aria-label', 'Switch to ' + label.toLowerCase());
      b.innerHTML = b.classList.contains('icon-btn') ? icon(isDark() ? 'sun' : 'moon') : label;
    });
  }
  function setTheme(dark) {
    document.documentElement.classList.toggle('dark', dark);
    write(KEYS.theme, dark ? 'dark' : 'light');
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', dark ? '#0B1220' : '#0277C8');
    paintThemeButtons();
  }

  // ---- online status ----------------------------------------------------------------
  function setOnline(on) {
    document.querySelectorAll('[data-online]').forEach(function (el) {
      el.classList.toggle('off', !on);
      el.textContent = on ? 'Online' : 'Offline';
      el.title = on ? 'Connected to the OSH network' : "You're offline";
    });
  }

  // ---- header, tab bar, footer ------------------------------------------------------
  var NAV = [['/', 'Home'], ['/events', 'Events'], ['/volunteer', 'Volunteer'], ['/vendors', 'Vendors'], ['/feedback', 'Feedback']];
  var path = location.pathname.replace(/\/+$/, '') || '/';
  function section() {
    if (path === '/') return '/';
    if (/^\/events/.test(path)) return '/events';
    if (/^\/volunteer\/login/.test(path)) return '/profile';
    if (/^\/volunteer/.test(path)) return '/volunteer';
    if (/^\/profile/.test(path)) return '/profile';
    var m = /^\/[^/]+/.exec(path);
    return m ? m[0] : '/';
  }
  var current = section();
  function profileHref() { return auth.token() ? '/profile' : '/volunteer/login?next=%2Fprofile'; }
  var LOGO = '<span class="brand-tile"><img src="/osh/img/osh-logo.png" alt="" width="44" height="25"></span>';

  function renderHeader() {
    var slot = document.getElementById('site-header');
    if (!slot) return;
    var me = auth.me();
    var signedIn = Boolean(auth.token());
    slot.outerHTML =
      '<a class="sr-only" href="#main">Skip to content</a>' +
      '<header class="hdr"><div class="container hdr-in">' +
      '<a class="brand" href="/" aria-label="OSH Entertainment, Pan India Event Network: home">' + LOGO +
      '<span class="brand-text"><b>OSH ENTERTAINMENT</b><small>PAN INDIA EVENT NETWORK</small></span></a>' +
      '<nav class="hdr-nav" aria-label="Main">' + NAV.map(function (n) {
        return '<a href="' + n[0] + '"' + (current === n[0] ? ' class="active" aria-current="page"' : '') + '>' + n[1] + '</a>';
      }).join('') + '</nav>' +
      '<div class="hdr-actions">' +
      '<span class="online" data-online role="status">Online</span>' +
      '<button class="icon-btn hdr-desktop" type="button" data-theme-toggle></button>' +
      (signedIn
        ? '<a class="avatar hdr-desktop" href="/profile" title="' + esc(me ? me.name : 'My profile') + '" aria-label="My profile">' + esc(me && me.name ? me.name.charAt(0).toUpperCase() : '•') + '</a>'
        : '<a class="btn btn-sm hdr-desktop" href="/volunteer/login">Sign In</a>') +
      '</div></div></header>';
  }

  function renderTabbar() {
    var tabs = [['/', 'Home', 'home'], ['/events', 'Events', 'calendar'], ['/volunteer', 'Join', 'userPlus'], ['/vendors', 'Vendors', 'store'], [profileHref(), auth.token() ? 'Profile' : 'Sign in', 'user', '/profile']];
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
      '<div><a class="ftr-brand" href="/" style="text-decoration:none" aria-label="OSH Entertainment home">' + LOGO +
      '<span><b>OSH ENTERTAINMENT</b><span>One Nation. One Crew. Unlimited Events.</span></span></a>' +
      '<p>Pan India Event Network: volunteers, crew members and trusted event vendors for concerts, festivals, corporate and private events.</p></div>' +
      '<div><h4>Explore</h4><ul><li><a href="/events">Upcoming events</a></li><li><a href="/#network">Events by city</a></li><li><a href="/#categories">Event categories</a></li><li><a href="/about">About OSH</a></li></ul></div>' +
      '<div><h4>Join the crew</h4><ul><li><a href="/volunteer">Volunteer registration</a></li><li><a href="/vendors">Vendor registration</a></li><li><a href="' + profileHref() + '">' + (auth.token() ? 'My profile' : 'Volunteer sign in') + '</a></li><li><a href="/feedback">Feedback &amp; support</a></li></ul></div>' +
      '<div><h4>OSH</h4><ul><li><a href="/admin">Admin dashboard</a></li><li><a href="/terms">Terms &amp; Conditions</a></li><li><a href="/privacy">Privacy Policy</a></li><li><a href="/credits">Photo credits</a></li><li><button type="button" data-theme-toggle></button></li></ul></div>' +
      '</div><div class="container ftr-bottom"><span>© ' + new Date().getFullYear() + ' OSH Entertainment. All rights reserved.</span><span>Pan India Event Network</span></div></footer>';
  }

  function initChrome() {
    renderHeader();
    renderFooter();
    renderTabbar();
    paintThemeButtons();
    setOnline(navigator.onLine !== false);
    window.addEventListener('online', function () { setOnline(true); });
    window.addEventListener('offline', function () { setOnline(false); });
    document.addEventListener('click', function (ev) {
      if (ev.target.closest('[data-theme-toggle]')) setTheme(!isDark());
    });
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta && isDark()) meta.setAttribute('content', '#0B1220');
  }

  function qs(name) { return new URLSearchParams(location.search).get(name); }
  // The id in /events/<id>.
  function pathId(index) { return decodeURIComponent(location.pathname.split('/').filter(Boolean)[index || 1] || ''); }
  function busy(btn, text) { var t = btn.innerHTML; btn.disabled = true; btn.textContent = text; return function () { btn.disabled = false; btn.innerHTML = t; }; }
  function tenDigits(value) {
    var d = String(value).replace(/\D/g, '');
    if (d.length === 12 && d.indexOf('91') === 0) d = d.slice(2);
    if (d.length === 11 && d[0] === '0') d = d.slice(1);
    return /^[6-9]\d{9}$/.test(d) ? d : null;
  }
  function prettyPhone(p) { var m = /^\+91(\d{5})(\d{5})$/.exec(p || ''); return m ? '+91 ' + m[1] + ' ' + m[2] : p; }
  function starText(rating) {
    var r = Math.round(Number(rating) || 0);
    return '★★★★★'.slice(0, r) + '☆☆☆☆☆'.slice(0, 5 - r);
  }
  function selectOptions(list, placeholder, selected) {
    return (placeholder ? '<option value="">' + esc(placeholder) + '</option>' : '') + list.map(function (v) {
      return '<option' + (v === selected ? ' selected' : '') + '>' + esc(v) + '</option>';
    }).join('');
  }

  window.OSH = {
    api: api, options: options, esc: esc, icon: icon, highlightIcon: highlightIcon, categoryMeta: categoryMeta, CATEGORIES: CATEGORIES,
    toast: toast, auth: auth, eventCard: eventCard, localDate: localDate, isoOf: isoOf, todayIso: todayIso, prettyDate: prettyDate,
    prettyTime: prettyTime, timeRange: timeRange, whenText: whenText, placeText: placeText, firstSentence: firstSentence, plural: plural,
    qs: qs, pathId: pathId, read: read, write: write, readJson: readJson, busy: busy, tenDigits: tenDigits, prettyPhone: prettyPhone,
    starText: starText, selectOptions: selectOptions,
  };

  initChrome();
})();
