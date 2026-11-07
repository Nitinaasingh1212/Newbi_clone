// My Profile: the volunteer dashboard. Next shift, clickable stats with a points breakdown,
// the Elite Crew ladder, events in the volunteer's city (send interest / withdraw), interest
// responses with ratings, the city leaderboard, and editing city, skill and availability.
(function () {
  'use strict';
  var O = window.OSH;
  var root = document.getElementById('profile-root');
  var TAB_KEY = 'osh_profile_tab';
  var DISMISS_KEY = 'osh_dismissed';
  var reduceMotion = Boolean(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  var STATUS = {
    applied: ['Interest sent', 'warn'], approved: ["You're on the crew", 'ok'], rejected: ['Not selected this time', 'bad'],
    withdrawn: ['Withdrawn', ''], completed: ['Completed', 'ok'], no_show: ['Marked as no-show', 'bad'],
  };
  var state = { tab: O.read(TAB_KEY) || 'events', showBreakdown: false, animated: false, welcome: O.qs('welcome') === '1' };
  if (state.welcome) history.replaceState(null, '', '/profile');

  var token = O.auth.token();
  if (!token) { location.replace('/volunteer/login?next=%2Fprofile'); return; }

  function esc(s) { return O.esc(s); }
  function dismissed(key) { return O.readJson(DISMISS_KEY, []).indexOf(key) !== -1; }
  function dismiss(key) { var l = O.readJson(DISMISS_KEY, []); if (l.indexOf(key) === -1) l.push(key); O.write(DISMISS_KEY, JSON.stringify(l)); }
  function notice(tone, html, key) {
    if (key && dismissed(key)) return '';
    return '<div class="notice ' + tone + (key ? ' dismissible' : '') + '">' + html + (key ? '<button class="x" type="button" data-dismiss="' + esc(key) + '" aria-label="Dismiss">' + O.icon('x', 16) + '</button>' : '') + '</div>';
  }
  var busy = O.busy;

  function load() {
    return Promise.all([
      O.api('/volunteer/me', { token: token }),
      O.api('/volunteer/events', { token: token }),
      O.api('/volunteer/applications', { token: token }),
      O.api('/leaderboard', { token: token }),
      state.rules ? Promise.resolve({ rules: state.rules }) : O.api('/ranking/rules'),
      O.options().catch(function () { return { departments: [], experienceLevels: [], availability: [] }; }),
    ]).then(function (r) {
      state.opts = r[5];
      state.me = r[0].volunteer;
      state.readOnly = Boolean(r[0].demoReadOnly);
      state.events = r[1].events;
      state.applications = r[2].applications;
      state.board = r[3];
      state.rules = r[4].rules;
      O.auth.remember(state.me);
      render();
    }).catch(function (err) {
      if (err.status === 401 || err.code === 'account_suspended') {
        O.auth.signOut();
        if (err.code === 'account_suspended') {
          root.innerHTML = '<div class="empty" style="margin-top:32px"><b>Account suspended</b>' + esc(err.message) + '</div>';
          return;
        }
        location.replace('/volunteer/login?next=%2Fprofile&reason=' + (err.code === 'account_not_found' ? 'missing' : 'expired'));
        return;
      }
      root.innerHTML = '<div class="empty" style="margin-top:32px"><b>Something went wrong</b>' + esc(err.message) + '<p style="margin-top:16px"><button class="btn" type="button" id="retry">Try again</button></p></div>';
      document.getElementById('retry').addEventListener('click', load);
    });
  }

  // ---- pieces --------------------------------------------------------------------

  function nextShift() {
    var today = O.todayIso();
    var next = state.applications.filter(function (a) { return a.status === 'approved' && a.event && a.event.date >= today; })
      .sort(function (x, y) { return x.event.date.localeCompare(y.event.date); })[0];
    if (!next) return '';
    var e = next.event;
    return '<button class="next-shift" type="button" data-goto="' + esc(e.id) + '">' +
      (e.image ? '<img src="' + esc(e.image) + '" alt="">' : '<span></span>') +
      '<span><span class="when">Next shift · ' + esc(O.whenText(e.date)) + '</span><span class="t">' + esc(e.title) + '</span>' +
      '<span class="m">' + esc(O.prettyDate(e.date)) + (e.startTime ? ' · ' + esc(O.prettyTime(e.startTime)) : '') + ' · ' + esc(e.venue) + '</span>' +
      (next.decisionNote ? '<span class="n">' + esc(next.decisionNote) + '</span>' : '') + '</span>' +
      '<span class="arrow" aria-hidden="true">' + O.icon('arrowRight', 22) + '</span></button>';
  }

  function stat(o) {
    var count = o.count != null ? ' data-count="' + o.count + '" data-decimals="' + (o.decimals || 0) + '" data-prefix="' + (o.prefix || '') + '" data-suffix="' + (o.suffix || '') + '"' : '';
    return '<button class="pstat" type="button" data-stat="' + o.id + '"' + (o.toggle ? ' aria-controls="breakdown" aria-expanded="' + state.showBreakdown + '"' : '') + '>' +
      '<span class="ico">' + O.icon(o.icon, 22) + '</span><b' + count + '>' + esc(o.value) + '</b><span>' + o.label + '</span><span class="go">' + o.hint + ' →</span></button>';
  }

  function tiers() { return (state.rules.tiers || []).slice().sort(function (a, b) { return a.minPoints - b.minPoints; }); }

  function ladder(s) {
    var t = tiers();
    var idx = 0;
    t.forEach(function (x, i) { if (s.points >= x.minPoints) idx = i; });
    var seg = 100 / t.length;
    var nxt = t[idx + 1];
    var frac = nxt ? (s.points - t[idx].minPoints) / (nxt.minPoints - t[idx].minPoints) : Math.min(1, (s.points - t[idx].minPoints) / Math.max(1, t[idx].minPoints));
    var pos = Math.min(100, seg * idx + seg * frac).toFixed(1);
    return '<div class="card panel-card"><div class="ladder-top"><span><b>' + esc(s.tier) + '</b> · ' + s.points + ' points</span><span class="muted">' +
      (s.nextTier ? s.nextTier.pointsNeeded + ' points to ' + esc(s.nextTier.name) : 'Top tier reached') + '</span></div>' +
      '<div class="track" role="progressbar" aria-label="Progress through the tiers" aria-valuemin="0" aria-valuemax="100" aria-valuenow="' + Math.round(pos) + '"><span class="fill" data-to="' + pos + '"></span><span class="you" data-to="' + pos + '" title="You: ' + s.points + ' points"></span></div>' +
      '<div class="milestones">' + t.map(function (x, i) { return '<span class="' + (i <= idx ? 'reached' : '') + '"><b>' + esc(x.name) + '</b> ' + x.minPoints + '+</span>'; }).join('') + '</div></div>';
  }

  function breakdown(s) {
    var r = state.rules;
    var bonus = function (n) { return Number(r.ratingBonusByStars[n] || 0); };
    var signed = function (n) { return (n > 0 ? '+' : '') + n; };
    var rows = state.applications.filter(function (a) { return a.status === 'completed' || a.status === 'no_show'; }).map(function (a) {
      var e = a.event || {};
      if (a.status === 'no_show') return { e: e, result: 'No-show', detail: '', pts: r.noShowPenalty };
      var rating = a.review && a.review.rating;
      return { e: e, result: 'Completed' + (rating ? ' · ' + rating + '★' : ''), detail: '+' + r.pointsPerCompletedEvent + ' event' + (rating ? ', ' + signed(bonus(rating)) + ' rating bonus' : ''), pts: r.pointsPerCompletedEvent + (rating ? bonus(rating) : 0) };
    });
    var sum = rows.reduce(function (t, x) { return t + x.pts; }, 0);
    return '<section class="card panel-card breakdown" id="breakdown"' + (state.showBreakdown ? '' : ' hidden') + ' aria-label="Points breakdown">' +
      '<div class="panel-head"><h3>How you earned ' + s.points + ' points</h3><button class="x" type="button" data-close-breakdown aria-label="Close">' + O.icon('x', 18) + '</button></div>' +
      (rows.length
        ? '<table><thead><tr><th>Event</th><th>Result</th><th class="num">Points</th></tr></thead><tbody>' + rows.map(function (x) {
            return '<tr><td>' + esc(x.e.title || 'Event') + '<span class="sub">' + (x.e.date ? esc(O.prettyDate(x.e.date)) : '') + '</span></td><td>' + esc(x.result) +
              (x.detail ? '<span class="sub">' + esc(x.detail) + '</span>' : '') + '</td><td class="num ' + (x.pts < 0 ? 'neg' : 'pos') + '">' + signed(x.pts) + '</td></tr>';
          }).join('') + '</tbody><tfoot><tr><td colspan="2">Total' + (sum < 0 ? ' (points never go below 0)' : '') + '</td><td class="num">' + s.points + '</td></tr></tfoot></table>'
        : '<p class="muted" style="margin-top:8px">No reviewed events yet. Each completed event earns ' + r.pointsPerCompletedEvent + ' points, plus a bonus for a good rating.</p>') +
      '<p class="hint" style="margin-top:12px">Each event +' + r.pointsPerCompletedEvent + ' · Rating bonus ' + [5, 4, 3, 2, 1].map(function (n) { return n + '★ ' + signed(bonus(n)); }).join(', ') + ' · No-show ' + r.noShowPenalty + '</p>' +
      '<div class="tier-chips">' + tiers().map(function (t) { return '<span class="tag' + (t.name === s.tier ? ' on' : '') + '">' + esc(t.name) + ' ' + t.minPoints + '+</span>'; }).join('') + '</div></section>';
  }

  function kycNotice(me) {
    if (me.kyc.status === 'verified') return notice('ok', '<b>Verified volunteer.</b> Your Aadhaar (' + esc(me.aadhaar) + ') is verified, so you can be confirmed for crews.', 'kyc-' + me.id);
    if (me.kyc.status === 'rejected') return notice('bad', '<b>Your Aadhaar verification didn\'t go through.</b> ' + esc(me.kyc.note || 'Your details didn\'t match your card.') + ' Contact the coordination team to fix your details.');
    return notice('warn', '<b>Aadhaar verification pending.</b> You can send interest for events now. The OSH team verifies your Aadhaar (' + esc(me.aadhaar) + ') before confirming you for a crew.');
  }

  function demoNotice(me) {
    if (!me.demo) return '';
    return notice('', '<b>Demo account.</b> Everything here is sample data, refreshed daily. ' + (state.readOnly
      ? 'It\'s view-only on this server, so sending interest and editing your profile are switched off. <a href="/volunteer" data-signup>Sign up with your own number</a> to try them.'
      : 'Go ahead and send interest for events; the demo resets each day.'), 'demo');
  }

  // ---- tabs ----------------------------------------------------------------------

  function eventsPanel() {
    if (!state.events.length) return '<div class="empty"><b>No upcoming events in ' + esc(state.me.city) + ' yet</b>New events show up here as soon as the team announces them.</div>';
    return '<div class="ev-grid">' + state.events.map(function (e) {
      var mine = e.myApplication;
      var status = '';
      var actions = '';
      if (!mine || mine.status === 'withdrawn') {
        if (state.readOnly) actions = '<span class="badge">Sending interest is off in the view-only demo</span>';
        else if (e.slotsLeft > 0) {
          actions = (e.roles.length ? '<select class="input" data-role-for="' + esc(e.id) + '" aria-label="Preferred role for ' + esc(e.title) + '"><option value="">Any role</option>' +
            e.roles.map(function (r) { return '<option>' + esc(r) + '</option>'; }).join('') + '</select>' : '') +
            '<button class="btn btn-sm" type="button" data-apply="' + esc(e.id) + '">' + (mine ? 'I’m Interested again' : 'I’m Interested') + '</button>';
        } else actions = '<span class="badge">All positions filled</span>';
      } else {
        var st = STATUS[mine.status] || [mine.status, ''];
        status = '<span class="badge ev-status ' + st[1] + '">' + esc(st[0]) + '</span>';
        if ((mine.status === 'applied' || mine.status === 'approved') && !state.readOnly) actions = '<button class="linkbtn" type="button" data-withdraw="' + esc(e.id) + '">Withdraw my interest</button>';
      }
      var extra = (actions ? '<div class="vol-actions">' + actions + '</div>' : '') + '<p class="err" data-event-err="' + esc(e.id) + '"></p>';
      return O.eventCard(e, { status: status, extra: extra, hideFoot: true });
    }).join('') + '</div>';
  }

  function thumb(e) {
    return '<div class="thumb">' + (e.image ? '<img src="' + esc(e.image) + '" alt="" loading="lazy">' : '') +
      (e.date ? '<span>' + esc(O.localDate(e.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })) + '</span>' : '') + '</div>';
  }

  function applicationsPanel() {
    if (!state.applications.length) return '<div class="empty"><b>No interest sent yet</b>Tap “I’m Interested” on an event in ' + esc(state.me.city) + ' and track it here.</div>';
    return state.applications.map(function (a) {
      var st = STATUS[a.status] || [a.status, ''];
      var e = a.event || {};
      return '<article class="card app-item">' + thumb(e) + '<div>' +
        '<h3><a href="/events/' + encodeURIComponent(e.id || '') + '" style="text-decoration:none">' + esc(e.title || 'Event') + '</a></h3>' +
        '<p class="ev-meta" style="margin-top:4px">' + O.icon('calendar', 15) + (e.date ? esc(O.prettyDate(e.date)) : '') + (e.city ? ' · ' + esc(O.placeText(e)) : '') + '</p>' +
        '<div class="row"><span class="badge ' + st[1] + '">' + esc(st[0]) + '</span>' + (a.preferredRole ? '<span class="tag">' + esc(a.preferredRole) + '</span>' : '') + (e.category ? '<span class="tag">' + esc(e.category) + '</span>' : '') +
        (e.status === 'cancelled' ? '<span class="badge bad">Event cancelled</span>' : '') + '</div>' +
        (a.decisionNote ? '<p class="notice" style="margin-top:10px">' + esc(a.decisionNote) + '</p>' : '') +
        (a.review && a.review.rating ? '<p style="margin-top:10px"><span class="stars" aria-label="Rated ' + a.review.rating + ' out of 5">' + '★'.repeat(a.review.rating) + '☆'.repeat(5 - a.review.rating) + '</span>' +
          (a.review.comment ? ' <span class="muted">“' + esc(a.review.comment) + '”</span>' : '') + '</p>' : '') +
        '</div></article>';
    }).join('');
  }

  function leaderboardPanel() {
    var b = state.board;
    var r = state.rules;
    var rules = '<details class="card panel-card"><summary style="cursor:pointer;font-weight:600">How points and ranks work</summary><ul style="margin:12px 0 0;padding-left:18px" class="muted">' +
      '<li>Each completed event: <b>+' + r.pointsPerCompletedEvent + '</b> points</li><li>Coordinator rating bonus: ' + [5, 4, 3, 2, 1].map(function (n) { var v = r.ratingBonusByStars[n]; return n + '★ ' + (v > 0 ? '+' : '') + v; }).join(', ') + '</li>' +
      '<li>No-show: <b>' + r.noShowPenalty + '</b> points</li><li>Ties are broken by average rating, then events completed.</li></ul></details>';
    if (!b.leaderboard.length) return '<div class="empty"><b>No one is ranked in ' + esc(b.scope) + ' yet</b>Volunteers appear here after their first reviewed event.</div>' + rules;
    return '<div class="card" style="overflow-x:auto"><table class="lb"><thead><tr><th>Rank</th><th>Volunteer</th><th>Tier</th><th class="num">Points</th><th class="num hide-sm">Events</th><th class="num hide-sm">Rating</th></tr></thead><tbody>' +
      b.leaderboard.map(function (x) {
        return '<tr class="' + (x.isYou ? 'me' : '') + '"><td>#' + x.rank + '</td><td>' + esc(x.name) + (x.isYou ? ' (you)' : '') + '</td><td>' + esc(x.tier) + '</td><td class="num">' + x.points +
          '</td><td class="num hide-sm">' + x.completedEvents + '</td><td class="num hide-sm">' + (x.averageRating != null ? x.averageRating.toFixed(1) + '★' : '—') + '</td></tr>';
      }).join('') + '</tbody></table></div>' +
      (b.you && !b.leaderboard.some(function (x) { return x.isYou; }) ? '<p class="notice" style="margin-top:12px">You\'re <b>#' + b.you.rank + '</b> in ' + esc(b.scope) + ' with ' + b.you.points + ' points.</p>' : '') + rules;
  }

  function renderPanel() {
    var panel = document.getElementById('ppanel');
    panel.innerHTML = state.tab === 'applications' ? applicationsPanel() : state.tab === 'leaderboard' ? leaderboardPanel() : eventsPanel();
    panel.querySelectorAll('[data-apply]').forEach(function (b) { b.addEventListener('click', function () { apply(b); }); });
    panel.querySelectorAll('[data-withdraw]').forEach(function (b) { b.addEventListener('click', function () { withdraw(b); }); });
  }

  function flash(el) { if (!el) return; el.classList.remove('flash'); void el.offsetWidth; el.classList.add('flash'); }
  function openTab(id, scroll) {
    state.tab = id;
    O.write(TAB_KEY, id);
    root.querySelectorAll('.ptab').forEach(function (t) { t.setAttribute('aria-selected', String(t.getAttribute('data-tab') === id)); });
    renderPanel();
    if (scroll) document.querySelector('.ptabs').scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
    if (id === 'leaderboard') flash(document.querySelector('.lb tr.me'));
  }
  function toggleBreakdown(show) {
    state.showBreakdown = show === undefined ? !state.showBreakdown : show;
    var p = document.getElementById('breakdown');
    p.hidden = !state.showBreakdown;
    root.querySelectorAll('[aria-controls="breakdown"]').forEach(function (b) { b.setAttribute('aria-expanded', String(state.showBreakdown)); });
    if (state.showBreakdown) p.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'nearest' });
  }

  function animate() {
    var first = !state.animated && !reduceMotion;
    state.animated = true;
    root.querySelectorAll('.track [data-to]').forEach(function (el) {
      var prop = el.classList.contains('fill') ? 'width' : 'left';
      var to = el.getAttribute('data-to') + '%';
      if (!first) { el.style[prop] = to; return; }
      el.style[prop] = '0%';
      requestAnimationFrame(function () { requestAnimationFrame(function () { el.style[prop] = to; }); });
    });
    if (!first) return;
    root.querySelectorAll('[data-count]').forEach(function (el) {
      var to = Number(el.getAttribute('data-count')), dec = Number(el.getAttribute('data-decimals'));
      var pre = el.getAttribute('data-prefix'), suf = el.getAttribute('data-suffix'), start = null;
      function step(t) {
        if (start === null) start = t;
        var p = Math.min(1, (t - start) / 900);
        el.textContent = pre + (to * (1 - Math.pow(1 - p, 3))).toFixed(dec) + suf;
        if (p < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    });
  }

  function render() {
    var me = state.me, s = me.stats, rank = me.standing.city.rank;
    document.title = me.name + ' | OSH Entertainment';
    var welcome = state.welcome;
    state.welcome = false;
    var counts = { events: state.events.length, applications: state.applications.length };
    var details = [me.department, me.experience, me.availability].filter(Boolean);
    root.innerHTML =
      '<header class="prof-head"><div class="prof-id"><span class="avatar-lg" aria-hidden="true">' + esc(me.name.charAt(0).toUpperCase()) + '</span>' +
      '<div><span class="eyebrow">Volunteer profile</span><h1>Hi, ' + esc(me.name.split(' ')[0]) + '</h1>' +
      '<p>' + O.icon('pin', 15) + ' ' + esc(me.city) + ' · ' + esc(O.prettyPhone(me.phone)) + '</p>' +
      (details.length ? '<p>' + O.icon('award', 15) + ' ' + esc(details.join(' · ')) + '</p>' : '') + '</div></div>' +
      '<div style="display:flex;flex-wrap:wrap;gap:10px">' + (state.readOnly ? '' : '<button class="btn btn-outline btn-sm" type="button" id="change-city">' + O.icon('pin', 16) + 'Edit profile</button>') +
      '<button class="btn btn-ghost btn-sm" type="button" id="sign-out">' + O.icon('logOut', 16) + 'Sign out</button></div></header>' +
      '<form class="card panel-card" id="f-city" hidden novalidate><div class="panel-head"><h3>Edit profile</h3></div>' +
      '<p class="hint" style="margin-top:4px">Your city decides which events you see. Changing it moves you to that city\'s events and leaderboard.</p>' +
      '<div class="grid-2"><div class="field"><label for="new-city">City</label><input class="input" id="new-city" list="city-options" value="' + esc(me.city) + '" maxlength="60"></div>' +
      '<div class="field"><label for="new-dept">Skill / department</label><select class="input" id="new-dept">' + O.selectOptions(state.opts.departments, 'Choose skill', me.department) + '</select></div></div>' +
      '<div class="grid-2"><div class="field"><label for="new-exp">Experience</label><select class="input" id="new-exp">' + O.selectOptions(state.opts.experienceLevels, 'Choose', me.experience) + '</select></div>' +
      '<div class="field"><label for="new-avail">Availability</label><select class="input" id="new-avail">' + O.selectOptions(state.opts.availability, 'Choose', me.availability) + '</select></div></div>' +
      '<p class="err" id="city-err" style="margin-top:10px"></p>' +
      '<p style="display:flex;gap:10px;margin-top:14px"><button class="btn btn-sm" type="submit">Save</button><button class="btn btn-ghost btn-sm" type="button" id="city-cancel">Cancel</button></p></form>' +
      '<div class="prof-notices">' + (welcome ? notice('ok', '<b>You\'re in!</b> Your volunteer profile is ready. Tap “I’m Interested” on any event below.') : '') + demoNotice(me) + kycNotice(me) + '</div>' +
      nextShift() +
      '<div class="pstats">' + [
        { id: 'points', icon: 'star', value: s.points, count: s.points, label: 'Points', hint: 'See breakdown', toggle: true },
        { id: 'tier', icon: 'award', value: s.tier, label: 'Tier', hint: 'How tiers work', toggle: true },
        { id: 'rank', icon: 'trophy', value: rank ? '#' + rank : '—', count: rank || null, prefix: '#', label: rank ? 'Rank in ' + esc(me.city) + ' of ' + me.standing.city.rankedVolunteers : 'Rank after your first rated event', hint: 'Open leaderboard' },
        { id: 'events', icon: 'calendarCheck', value: s.completedEvents, count: s.completedEvents, label: 'Events completed', hint: 'View my interest' },
        { id: 'rating', icon: 'sparkles', value: s.averageRating != null ? s.averageRating.toFixed(1) + '★' : '—', count: s.averageRating, decimals: 1, suffix: '★', label: 'Average rating', hint: 'See your ratings' },
      ].map(stat).join('') + '</div>' +
      breakdown(s) + ladder(s) +
      '<div class="ptabs" role="tablist" aria-label="Profile sections">' +
      [['events', 'Events in ' + esc(me.city) + ' (' + counts.events + ')'], ['applications', 'My interest (' + counts.applications + ')'], ['leaderboard', 'Leaderboard']]
        .map(function (t) { return '<button class="ptab" type="button" role="tab" data-tab="' + t[0] + '" aria-selected="' + (state.tab === t[0]) + '">' + t[1] + '</button>'; }).join('') +
      '</div><div class="ppanel" id="ppanel" role="tabpanel"></div>';
    renderPanel();
    animate();
    bind();
  }

  function bind() {
    root.querySelectorAll('.ptab').forEach(function (t) { t.addEventListener('click', function () { openTab(t.getAttribute('data-tab')); }); });
    root.querySelectorAll('[data-stat]').forEach(function (b) {
      b.addEventListener('click', function () {
        var w = b.getAttribute('data-stat');
        if (w === 'points' || w === 'tier') toggleBreakdown();
        else if (w === 'rank') openTab('leaderboard', true);
        else openTab('applications', true);
      });
    });
    root.querySelector('[data-close-breakdown]').addEventListener('click', function () { toggleBreakdown(false); });
    root.querySelectorAll('[data-dismiss]').forEach(function (b) { b.addEventListener('click', function () { dismiss(b.getAttribute('data-dismiss')); b.parentNode.remove(); }); });
    var next = root.querySelector('[data-goto]');
    if (next) next.addEventListener('click', function () {
      openTab('events');
      var card = document.querySelector('.ev-card[data-event="' + next.getAttribute('data-goto') + '"]');
      if (card) { card.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' }); flash(card); }
    });
    root.querySelectorAll('[data-signup]').forEach(function (a) { a.addEventListener('click', function () { O.auth.signOut(); }); });
    document.getElementById('sign-out').addEventListener('click', function () { O.auth.signOut(); location.href = '/volunteer/login'; });
    var cityForm = document.getElementById('f-city');
    var change = document.getElementById('change-city');
    if (change) change.addEventListener('click', function () { cityForm.hidden = false; document.getElementById('new-city').select(); });
    document.getElementById('city-cancel').addEventListener('click', function () { cityForm.hidden = true; });
    cityForm.addEventListener('submit', function (ev) {
      ev.preventDefault();
      var city = document.getElementById('new-city').value.trim();
      if (city.length < 2) { document.getElementById('city-err').textContent = 'Enter a city name.'; return; }
      var patch = { city: city };
      [['department', 'new-dept'], ['experience', 'new-exp'], ['availability', 'new-avail']].forEach(function (f) {
        var v = document.getElementById(f[1]).value;
        if (v) patch[f[0]] = v;
      });
      var moved = city.toLowerCase() !== state.me.city.toLowerCase();
      var done = busy(cityForm.querySelector('button[type=submit]'), 'Saving…');
      O.api('/volunteer/me', { method: 'PATCH', token: token, body: patch })
        .then(function (res) { O.toast(moved ? 'Now showing events in ' + res.volunteer.city : 'Profile updated'); state.tab = 'events'; return load(); })
        .catch(function (err) { done(); document.getElementById('city-err').textContent = err.message; });
    });
  }

  function eventError(id, msg) { var el = document.querySelector('[data-event-err="' + id + '"]'); if (el) el.textContent = msg; }
  function apply(btn) {
    var id = btn.getAttribute('data-apply');
    var role = document.querySelector('[data-role-for="' + id + '"]');
    var done = busy(btn, 'Sending…');
    O.api('/volunteer/events/' + encodeURIComponent(id) + '/apply', { method: 'POST', token: token, body: role && role.value ? { preferredRole: role.value } : {} })
      .then(function (res) { O.toast('Interest sent for ' + res.application.event.title); return load(); })
      .catch(function (err) { done(); eventError(id, err.message); });
  }
  function withdraw(btn) {
    var id = btn.getAttribute('data-withdraw');
    if (!window.confirm('Withdraw your interest for this event?')) return;
    var done = busy(btn, 'Withdrawing…');
    O.api('/volunteer/events/' + encodeURIComponent(id) + '/withdraw', { method: 'POST', token: token })
      .then(function () { O.toast('Interest withdrawn'); return load(); })
      .catch(function (err) { done(); eventError(id, err.message); });
  }

  load();
  O.api('/cities').then(function (res) {
    document.getElementById('city-options').innerHTML = res.cities.map(function (c) { return '<option value="' + esc(c.city) + '"></option>'; }).join('');
  }).catch(function () {});
})();
