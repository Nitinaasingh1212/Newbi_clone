// Event detail (/events/<id>): what the event is, the volunteer roles and open positions, and
// the "I'm Interested" panel. Volunteers can send interest only for events in their own city.
(function () {
  'use strict';
  var O = window.OSH;
  var root = document.getElementById('event-root');
  var id = O.pathId(1);
  var token = O.auth.token();
  var STATUS = {
    applied: ['Interest sent: waiting for the OSH team', 'warn'], approved: ["You're on the crew", 'ok'], rejected: ['Not selected this time', 'bad'],
    completed: ['Completed', 'ok'], no_show: ['Marked as no-show', 'bad'],
  };
  var state = { event: null, mine: null, mismatch: null, readOnly: false, error: '' };

  function notFound(message) {
    document.title = 'Event not found | OSH Entertainment';
    root.innerHTML = '<nav class="crumbs"><a href="/events">' + O.icon('arrowLeft', 16) + 'Events</a></nav>' +
      '<div class="empty"><b>We couldn\'t find that event</b>' + O.esc(message) + '<p style="margin-top:16px"><a class="btn" href="/events">Browse all events</a></p></div>';
  }

  function share(e) {
    var url = location.origin + '/events/' + encodeURIComponent(e.id);
    if (navigator.share) navigator.share({ title: e.title, text: e.title + ': volunteer with OSH Entertainment', url: url }).catch(function () {});
    else if (navigator.clipboard) navigator.clipboard.writeText(url).then(function () { O.toast('Link copied'); }, function () { O.toast(url); });
    else O.toast(url);
  }

  function interestBody() {
    var e = state.event;
    var here = '/events/' + encodeURIComponent(e.id);
    if (e.status !== 'open' || e.date < O.todayIso()) {
      return '<p class="notice" style="margin-top:14px">' + (e.status === 'cancelled' ? 'This event was cancelled.' : 'This event is no longer taking interest.') + '</p>';
    }
    if (!token) {
      return '<p class="muted" style="margin-top:14px;font-size:14.5px">Register as an OSH volunteer (two minutes, with your phone and Aadhaar) or sign in to tell the team you\'re interested.</p>' +
        '<div class="interest-actions"><a class="btn btn-lg" href="/volunteer?event=' + encodeURIComponent(e.id) + '">I’m Interested: Register</a>' +
        '<a class="btn btn-outline" href="/volunteer/login?next=' + encodeURIComponent(here + '#interest') + '">I already have an account</a></div>';
    }
    if (state.mismatch) {
      return '<p class="notice warn" style="margin-top:14px">This event is in <b>' + O.esc(e.city) + '</b>. You\'re registered in <b>' + O.esc(state.mismatch.yourCity) + '</b>, so you can send interest only for events there.</p>' +
        '<div class="interest-actions"><a class="btn" href="/events?city=' + encodeURIComponent(state.mismatch.yourCity) + '">Events in ' + O.esc(state.mismatch.yourCity) + '</a>' +
        '<a class="btn btn-ghost" href="/profile">Moved? Change your city</a></div>';
    }
    var mine = state.mine;
    if (mine && mine.status !== 'withdrawn') {
      var st = STATUS[mine.status] || [mine.status, ''];
      return '<p style="margin-top:14px"><span class="badge ' + st[1] + '">' + O.esc(st[0]) + '</span></p>' +
        (mine.status === 'applied' ? '<p class="muted" style="margin-top:10px;font-size:14px">The team verifies your Aadhaar and confirms crew members before the event. You\'ll see updates in your profile.</p>' : '') +
        '<div class="interest-actions"><a class="btn btn-outline" href="/profile">Open my profile</a>' +
        ((mine.status === 'applied' || mine.status === 'approved') && !state.readOnly ? '<button class="btn btn-ghost" type="button" id="withdraw">Withdraw my interest</button>' : '') + '</div>' +
        '<p class="err" id="interest-err" role="alert">' + O.esc(state.error) + '</p>';
    }
    if (e.slotsLeft === 0) return '<p class="notice" style="margin-top:14px">All volunteer positions for this event are filled.</p>';
    if (state.readOnly) {
      return '<p class="notice" style="margin-top:14px">The demo account is view-only here. <a href="/volunteer" id="own-number">Register with your own number</a> to send interest.</p>';
    }
    return '<form id="f-interest" novalidate>' +
      (e.roles.length ? '<div class="field"><label for="i-role">Preferred role <span class="optional">(optional)</span></label><select class="input" id="i-role"><option value="">Any role</option>' +
        e.roles.map(function (r) { return '<option>' + O.esc(r) + '</option>'; }).join('') + '</select></div>' : '') +
      '<div class="field"><label for="i-note">Note for the team <span class="optional">(optional)</span></label><textarea class="input" id="i-note" maxlength="300" style="min-height:84px" placeholder="Relevant experience, timing constraints…"></textarea></div>' +
      '<p class="err" id="interest-err" role="alert">' + O.esc(state.error) + '</p>' +
      '<div class="interest-actions"><button class="btn btn-lg" type="submit">' + O.icon('checkCircle', 20) + 'I’m Interested</button></div></form>';
  }

  function paintInterest() {
    var e = state.event;
    var filled = e.volunteersNeeded - (e.slotsLeft == null ? e.volunteersNeeded : e.slotsLeft);
    var pct = e.volunteersNeeded ? Math.round((filled / e.volunteersNeeded) * 100) : 0;
    var box = document.getElementById('interest');
    box.innerHTML = '<h2>Volunteer positions</h2>' +
      '<div class="positions"><div class="row"><span><b>' + (e.slotsLeft == null ? e.volunteersNeeded : e.slotsLeft) + '</b> of ' + e.volunteersNeeded + ' open</span><span>' + filled + ' confirmed</span></div>' +
      '<div class="bar" role="progressbar" aria-label="Positions filled" aria-valuemin="0" aria-valuemax="100" aria-valuenow="' + pct + '"><span style="width:' + Math.max(pct, 2) + '%"></span></div></div>' +
      (e.status === 'open' && e.date >= O.todayIso() && e.slotsLeft !== 0 ? '<p style="margin-top:14px"><span class="open-dot">Open for interest</span></p>' : '') +
      interestBody();
    var form = document.getElementById('f-interest');
    if (form) form.addEventListener('submit', sendInterest);
    var w = document.getElementById('withdraw');
    if (w) w.addEventListener('click', withdraw);
    var own = document.getElementById('own-number');
    if (own) own.addEventListener('click', function () { O.auth.signOut(); });
  }

  function sendInterest(ev) {
    ev.preventDefault();
    var btn = ev.target.querySelector('button[type=submit]');
    var role = document.getElementById('i-role');
    var note = document.getElementById('i-note').value.trim();
    var body = {};
    if (role && role.value) body.preferredRole = role.value;
    if (note) body.note = note;
    var done = O.busy(btn, 'Sending…');
    O.api('/volunteer/events/' + encodeURIComponent(state.event.id) + '/apply', { method: 'POST', token: token, body: body })
      .then(function (res) {
        state.mine = { id: res.application.id, status: res.application.status };
        state.error = '';
        O.toast('Interest sent for ' + state.event.title);
        paintInterest();
      })
      .catch(function (err) {
        done();
        if (err.code === 'demo_read_only') state.readOnly = true;
        if (err.code === 'already_applied') state.mine = { status: err.details.status };
        state.error = err.message;
        if (err.status === 401) { O.auth.signOut(); token = null; }
        paintInterest();
      });
  }

  function withdraw() {
    if (!window.confirm('Withdraw your interest for this event?')) return;
    var done = O.busy(document.getElementById('withdraw'), 'Withdrawing…');
    O.api('/volunteer/events/' + encodeURIComponent(state.event.id) + '/withdraw', { method: 'POST', token: token })
      .then(function () { state.mine = { status: 'withdrawn' }; state.error = ''; O.toast('Interest withdrawn'); return reloadEvent(); })
      .catch(function (err) { done(); state.error = err.message; paintInterest(); });
  }

  function reloadEvent() {
    return O.api('/events/' + encodeURIComponent(id)).then(function (res) { state.event = res.event; paintInterest(); });
  }

  function render() {
    var e = state.event;
    var c = O.categoryMeta(e.category);
    document.title = e.title + ' | OSH Entertainment';
    var place = [e.venue, e.address, e.venue.toLowerCase().indexOf(e.city.toLowerCase()) === -1 ? e.city : null].filter(Boolean).join(', ');
    var mapUrl = 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(place);
    root.innerHTML =
      '<nav class="crumbs" aria-label="Breadcrumb"><a href="/events">' + O.icon('arrowLeft', 16) + 'Events</a><span aria-hidden="true">/</span><span>' + O.esc(e.title) + '</span></nav>' +
      '<div class="detail"><article>' +
      '<div class="detail-media">' + (e.image ? '<img src="' + O.esc(e.image) + '" alt="">' : '') +
      '<button class="share" type="button" id="share-btn" aria-label="Share this event">' + O.icon('share', 18) + '</button></div>' +
      (e.imageCredit ? '<p class="hint" style="margin-top:8px">' + (e.imageCreditUrl ? '<a class="hint" href="' + O.esc(e.imageCreditUrl) + '" target="_blank" rel="noopener">' + O.esc(e.imageCredit) + '</a>' : O.esc(e.imageCredit)) + '</p>' : '') +
      '<span class="ev-tag k-' + c.key + '">' + O.esc(c.tag) + '</span>' +
      '<h1>' + O.esc(e.title) + '</h1>' +
      '<div class="detail-meta">' +
      '<p class="ev-meta">' + O.icon('pin', 18, 'i-pin') + O.esc(O.placeText(e)) + '</p>' +
      '<p class="ev-meta">' + O.icon('calendar', 18, 'i-cal') + O.esc(O.prettyDate(e.date, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })) + '</p>' +
      (e.startTime ? '<p class="ev-meta">' + O.icon('clock', 18, 'i-cal') + O.esc(O.timeRange(e)) + '</p>' : '') +
      '<p class="ev-meta">' + O.icon('users', 18, 'i-crew') + O.esc(O.plural(e.volunteersNeeded, 'volunteer position')) + '</p></div>' +
      (e.demo ? '<p class="notice" style="margin-top:16px">Demo event: details and counts are illustrative. Live listings will be managed by the OSH Admin team.</p>' : '') +
      '<h2>About the event</h2><p class="about">' + O.esc(e.description || 'More details coming soon.') + '</p>' +
      (e.roles.length ? '<h2>Volunteer roles</h2><div class="role-list">' + e.roles.map(function (r) { return '<span class="tag">' + O.esc(r) + '</span>'; }).join('') + '</div>' : '') +
      (e.highlights.length ? '<h2>Event highlights</h2><div class="highlights">' + e.highlights.map(function (h) {
        return '<div class="hl"><span class="ico">' + O.icon(O.highlightIcon(h), 24) + '</span>' + O.esc(h) + '</div>';
      }).join('') + '</div>' : '') +
      '<h2>Why work this event</h2><div class="perks">' +
      '<div class="perk">' + O.icon('star', 20) + 'A 1–5 star rating from your coordinator</div>' +
      '<div class="perk">' + O.icon('trendingUp', 20) + 'Points toward the Elite Crew</div>' +
      '<div class="perk">' + O.icon('award', 20) + 'Training badges as you grow</div></div>' +
      '<h2>Venue</h2><p class="about">' + O.esc(place) + '</p>' +
      '<p style="margin-top:10px"><a class="link" href="' + mapUrl + '" target="_blank" rel="noopener">Open in Google Maps ' + O.icon('arrowRight', 16) + '</a></p>' +
      '</article>' +
      '<aside class="side"><section class="card card-pad" id="interest" aria-label="Volunteer positions and interest"></section>' +
      '<div class="soft-card"><b>Questions about this event?</b><p class="muted" style="margin-top:6px;font-size:14px">Talk to your event coordinator, or write to OSH management.</p>' +
      '<a class="link" style="margin-top:10px" href="/feedback">' + O.icon('message', 18) + 'Feedback Portal</a></div></aside></div>' +
      '<section class="section" id="more" hidden><div class="section-head"><h2>More events in ' + O.esc(e.city) + '</h2><a class="btn btn-outline btn-sm" href="/events?city=' + encodeURIComponent(e.city) + '">See all</a></div><div class="ev-grid" id="more-grid"></div></section>';

    document.getElementById('share-btn').addEventListener('click', function () { share(e); });
    paintInterest();
    if (location.hash === '#interest') {
      var box = document.getElementById('interest');
      box.scrollIntoView({ block: 'start' });
      box.classList.add('flash');
    }

    O.api('/events?city=' + encodeURIComponent(e.city) + '&limit=5').then(function (res) {
      var others = res.events.filter(function (x) { return x.id !== e.id; }).slice(0, 3);
      if (!others.length) return;
      document.getElementById('more-grid').innerHTML = others.map(function (x) { return O.eventCard(x); }).join('');
      document.getElementById('more').hidden = false;
    }).catch(function () {});
  }

  // For a signed-in volunteer, also load their interest in this event (and whether it's in their city).
  function loadMine() {
    if (!token) return Promise.resolve();
    var me = O.auth.me() || {};
    return Promise.all([
      O.api('/volunteer/events/' + encodeURIComponent(id), { token: token }).then(function (res) {
        state.mine = res.event.myApplication;
      }).catch(function (err) {
        if (err.code === 'city_mismatch') state.mismatch = err.details;
        else if (err.status === 401 || err.code === 'account_suspended') { O.auth.signOut(); token = null; }
      }),
      me.demo ? O.api('/volunteer/me', { token: token }).then(function (res) { state.readOnly = Boolean(res.demoReadOnly); }).catch(function () {}) : null,
    ]);
  }

  if (!id) return notFound('The link is missing the event id.');
  Promise.all([O.api('/events/' + encodeURIComponent(id)), loadMine()])
    .then(function (r) { state.event = r[0].event; render(); })
    .catch(function (err) { notFound(err.status === 404 ? 'It may have been removed, or the link is wrong.' : err.message); });
})();
