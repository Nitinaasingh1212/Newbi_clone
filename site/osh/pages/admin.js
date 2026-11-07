// OSH Admin Dashboard: sign in with the admin key, then manage events and the volunteers
// interested in them (approve, reject, verify Aadhaar, rate after the event), volunteer
// records, vendor verification and the feedback inbox.
(function () {
  'use strict';
  var O = window.OSH;
  var root = document.getElementById('admin-root');
  var who = document.getElementById('admin-who');
  var SESSION = 'osh_admin';
  var TABS = [['events', 'Manage / View Events'], ['volunteers', 'Volunteer Records'], ['vendors', 'Vendor Records'], ['feedback', 'Feedback Inbox']];
  var APP_STATUS = { applied: ['Interested', 'warn'], approved: ['Approved', 'ok'], rejected: ['Rejected', 'bad'], withdrawn: ['Withdrawn', ''], completed: ['Completed', 'ok'], no_show: ['No-show', 'bad'] };
  var KYC = { pending: ['Aadhaar pending', 'warn'], verified: ['Aadhaar verified', 'ok'], rejected: ['Aadhaar rejected', 'bad'] };
  var VENDOR = { pending: ['Pending', 'warn'], verified: ['Verified', 'ok'], rejected: ['Rejected', 'bad'] };
  var state = { tab: O.read('osh_admin_tab') || 'events', eventScope: 'upcoming', open: {}, feedbackScope: 'new', opts: null };
  var esc = O.esc;

  function session() {
    var s = O.readJson(SESSION, null, sessionStorage);
    return s && s.expires > Date.now() ? s : null;
  }
  function call(path, options) {
    options = options || {};
    options.token = (session() || {}).token;
    return O.api(path, options).catch(function (err) {
      if (err.status === 401) { O.write(SESSION, null, sessionStorage); signInView('Your admin session ended. Sign in again.'); }
      throw err;
    });
  }
  function badge(map, key) { var b = map[key] || [key, '']; return '<span class="badge ' + b[1] + '">' + esc(b[0]) + '</span>'; }
  function fail(el, err) { if (el) el.textContent = err.message; else O.toast(err.message); }

  // ---- sign in ----------------------------------------------------------------------
  function signInView(flash) {
    who.innerHTML = '';
    root.innerHTML = '<section class="card card-pad" style="max-width:520px;margin-top:20px" aria-labelledby="a-title">' +
      '<h2 id="a-title">' + O.icon('lock', 22) + ' Admin sign in</h2>' +
      '<p class="muted" style="margin-top:8px;font-size:15px">For the OSH coordination team. Use the admin key set on the server (ADMIN_API_KEY).</p>' +
      (flash ? '<p class="notice warn" style="margin-top:14px">' + esc(flash) + '</p>' : '') +
      '<form id="f-admin" novalidate><div class="field"><label for="a-name">Your name</label><input class="input" id="a-name" autocomplete="name" maxlength="60" placeholder="e.g. Priya (Ops)"></div>' +
      '<div class="field"><label for="a-key">Admin key</label><input class="input" id="a-key" type="password" autocomplete="current-password"></div>' +
      '<p class="err" id="a-err" role="alert" style="margin-top:10px"></p>' +
      '<button class="btn btn-lg btn-block" type="submit" style="margin-top:16px">Open dashboard</button></form></section>';
    document.getElementById('f-admin').addEventListener('submit', function (ev) {
      ev.preventDefault();
      var name = document.getElementById('a-name').value.trim();
      var key = document.getElementById('a-key').value;
      var err = document.getElementById('a-err');
      if (!name || !key) { err.textContent = 'Enter your name and the admin key.'; return; }
      var done = O.busy(ev.target.querySelector('button'), 'Signing in…');
      O.api('/admin/login', { method: 'POST', body: { name: name, apiKey: key } })
        .then(function (res) {
          O.write(SESSION, JSON.stringify({ token: res.token, name: res.admin.name, expires: Date.now() + res.expiresInSeconds * 1000 }), sessionStorage);
          dashboard();
        })
        .catch(function (e) { done(); err.textContent = e.message; });
    });
    document.getElementById('a-name').focus();
  }

  // ---- dashboard shell ----------------------------------------------------------------
  function dashboard() {
    var s = session();
    who.innerHTML = '<span class="badge info">' + O.icon('user', 14) + esc(s.name) + '</span> <button class="linkbtn" type="button" id="a-out" style="margin-left:8px">Sign out</button>';
    document.getElementById('a-out').addEventListener('click', function () { O.write(SESSION, null, sessionStorage); signInView(); });
    root.innerHTML = '<div class="admin-stats" id="a-stats"><div class="skeleton" style="min-height:96px;grid-column:1/-1"></div></div>' +
      '<div class="admin-tabs" role="tablist" aria-label="Dashboard sections">' + TABS.map(function (t) {
        return '<button type="button" role="tab" data-tab="' + t[0] + '" aria-selected="' + (state.tab === t[0]) + '">' + t[1] + '</button>';
      }).join('') + '</div><div class="admin-panel" id="a-panel" role="tabpanel"></div>';
    root.querySelectorAll('[data-tab]').forEach(function (b) { b.addEventListener('click', function () { openTab(b.getAttribute('data-tab')); }); });
    O.options().then(function (o) { state.opts = o; }).catch(function () {});
    loadOverview();
    openTab(state.tab);
  }

  function loadOverview() {
    return call('/admin/overview').then(function (o) {
      var cards = [
        ['events', o.events.listed, 'Events listed', o.events.upcoming + ' upcoming'],
        ['volunteers', o.volunteers.total, 'Volunteer profiles', o.volunteers.kycPending ? o.volunteers.kycPending + ' awaiting Aadhaar check' : ''],
        ['vendors', o.vendors.total, 'Vendor profiles', o.vendors.pending ? o.vendors.pending + ' awaiting verification' : ''],
        ['events', o.interested.total, 'Interested responses', o.interested.awaitingDecision ? o.interested.awaitingDecision + ' awaiting decision' : ''],
      ];
      document.getElementById('a-stats').innerHTML = cards.map(function (c) {
        return '<button class="admin-stat" type="button" data-go="' + c[0] + '"><b>' + Number(c[1]).toLocaleString('en-IN') + '</b><span>' + c[2] + '</span>' + (c[3] ? '<small>' + esc(c[3]) + '</small>' : '') + '</button>';
      }).join('');
      document.querySelectorAll('[data-go]').forEach(function (b) { b.addEventListener('click', function () { openTab(b.getAttribute('data-go')); }); });
      var fbTab = root.querySelector('[data-tab="feedback"]');
      if (fbTab) fbTab.textContent = 'Feedback Inbox' + (o.feedback.new ? ' (' + o.feedback.new + ' new)' : '');
    }).catch(function (err) { document.getElementById('a-stats').innerHTML = '<p class="notice bad" style="grid-column:1/-1">' + esc(err.message) + '</p>'; });
  }

  function openTab(id) {
    state.tab = id;
    O.write('osh_admin_tab', id);
    root.querySelectorAll('[data-tab]').forEach(function (b) { b.setAttribute('aria-selected', String(b.getAttribute('data-tab') === id)); });
    var panel = document.getElementById('a-panel');
    panel.innerHTML = '<div class="skeleton" style="min-height:240px"></div>';
    ({ events: eventsTab, volunteers: volunteersTab, vendors: vendorsTab, feedback: feedbackTab })[id]();
  }
  function refresh() { loadOverview(); openTab(state.tab); }

  // ---- events --------------------------------------------------------------------------
  function eventsTab() {
    var panel = document.getElementById('a-panel');
    var q = state.eventScope === 'upcoming' ? '?status=open&from=' + O.todayIso() : state.eventScope === 'past' ? '?to=' + O.todayIso() : '';
    call('/admin/events' + q + (q ? '&' : '?') + 'limit=200').then(function (res) {
      var list = state.eventScope === 'past' ? res.events.slice().reverse() : res.events;
      panel.innerHTML = '<div style="display:flex;flex-wrap:wrap;gap:10px;align-items:center;justify-content:space-between">' +
        '<div class="chips">' + [['upcoming', 'Upcoming'], ['past', 'Past'], ['all', 'All']].map(function (s) {
          return '<button class="chip" type="button" data-scope="' + s[0] + '" aria-pressed="' + (state.eventScope === s[0]) + '">' + s[1] + '</button>';
        }).join('') + '</div><button class="btn btn-sm" type="button" id="add-event">' + O.icon('plus', 16) + 'Add event</button></div>' +
        '<div id="event-form" hidden></div>' +
        '<div style="margin-top:14px">' + (list.length ? list.map(eventRow).join('') : '<div class="empty"><b>No events here</b>Add an event to start collecting interest.</div>') + '</div>';
      panel.querySelectorAll('[data-scope]').forEach(function (b) { b.addEventListener('click', function () { state.eventScope = b.getAttribute('data-scope'); eventsTab(); }); });
      document.getElementById('add-event').addEventListener('click', eventForm);
      panel.querySelectorAll('[data-responses]').forEach(function (b) {
        b.addEventListener('click', function () { var id = b.getAttribute('data-responses'); state.open[id] = !state.open[id]; responses(id); });
      });
      Object.keys(state.open).forEach(function (id) { if (state.open[id] && document.getElementById('apps-' + id)) responses(id); });
    }).catch(function (err) { panel.innerHTML = '<p class="notice bad">' + esc(err.message) + '</p>'; });
  }

  function eventRow(e) {
    var c = e.counts || {};
    var interested = (c.applied || 0) + (c.approved || 0) + (c.rejected || 0) + (c.completed || 0) + (c.noShow || 0);
    var statusTone = { open: 'ok', closed: '', completed: 'info', cancelled: 'bad' }[e.status] || '';
    return '<article class="card event-row"><div class="top">' +
      (e.image ? '<img src="' + esc(e.image) + '" alt="" loading="lazy">' : '<span class="ph"></span>') +
      '<div><h3><a href="/events/' + encodeURIComponent(e.id) + '" style="text-decoration:none">' + esc(e.title) + '</a></h3>' +
      '<p>' + esc(O.placeText(e)) + ' · ' + esc(O.prettyDate(e.date)) + (e.category ? ' · ' + esc(e.category) : '') + '</p>' +
      '<div class="nums"><span class="badge ' + statusTone + '">' + esc(e.status) + '</span><span class="badge info">' + c.filled + ' / ' + e.volunteersNeeded + ' filled</span>' +
      (c.applied ? '<span class="badge warn">' + c.applied + ' awaiting decision</span>' : '') + '</div></div>' +
      '<div class="side-btns"><button class="btn btn-sm btn-outline" type="button" data-responses="' + esc(e.id) + '" aria-expanded="' + Boolean(state.open[e.id]) + '">Responses (' + interested + ')</button></div></div>' +
      '<div class="applicants" id="apps-' + esc(e.id) + '"' + (state.open[e.id] ? '' : ' hidden') + '></div></article>';
  }

  function responses(eventId) {
    var box = document.getElementById('apps-' + eventId);
    var btn = document.querySelector('[data-responses="' + eventId + '"]');
    if (btn) btn.setAttribute('aria-expanded', String(Boolean(state.open[eventId])));
    if (!state.open[eventId]) { box.hidden = true; return; }
    box.hidden = false;
    box.innerHTML = '<p class="hint">Loading…</p>';
    call('/admin/events/' + encodeURIComponent(eventId) + '/applications').then(function (res) {
      var e = res.event;
      var past = e.date <= O.todayIso();
      var list = res.applications.filter(function (a) { return a.status !== 'withdrawn'; });
      if (!list.length) { box.innerHTML = '<p class="hint">No interest yet.</p>'; return; }
      box.innerHTML = list.map(function (a) {
        var v = a.volunteer || {};
        var actions = '';
        if (a.status === 'applied' || a.status === 'rejected' || (a.status === 'approved' && !past)) {
          if (v.kycStatus === 'pending') actions += '<button class="btn btn-sm btn-ghost" type="button" data-kyc="' + esc(v.id) + '" data-ev="' + esc(eventId) + '">Verify Aadhaar</button>';
          if (a.status !== 'approved') actions += '<button class="btn btn-sm" type="button" data-decide="approve" data-app="' + esc(a.id) + '" data-ev="' + esc(eventId) + '">Approve</button>';
          if (a.status !== 'rejected') actions += '<button class="btn btn-sm btn-danger" type="button" data-decide="reject" data-app="' + esc(a.id) + '" data-ev="' + esc(eventId) + '">Reject</button>';
        }
        if (past && (a.status === 'approved' || a.status === 'completed' || a.status === 'no_show')) {
          actions += '<select class="input" data-rating="' + esc(a.id) + '" aria-label="Rating for ' + esc(v.name) + '">' + [5, 4, 3, 2, 1].map(function (n) {
            return '<option value="' + n + '"' + (a.review && a.review.rating === n ? ' selected' : '') + '>' + n + ' ★</option>';
          }).join('') + '</select>' +
            '<button class="btn btn-sm" type="button" data-review="completed" data-app="' + esc(a.id) + '" data-ev="' + esc(eventId) + '">' + (a.status === 'completed' ? 'Update rating' : 'Completed') + '</button>' +
            (a.status !== 'no_show' ? '<button class="btn btn-sm btn-danger" type="button" data-review="no_show" data-app="' + esc(a.id) + '" data-ev="' + esc(eventId) + '">No-show</button>' : '');
        }
        return '<div class="applicant"><div><b>' + esc(v.name || 'Volunteer') + '</b> ' + badge(APP_STATUS, a.status) + ' ' + badge(KYC, v.kycStatus) +
          '<div class="meta">' + esc([O.prettyPhone(v.phone), v.city, v.department, v.tier + ' · ' + v.points + ' pts', v.averageRating != null ? v.averageRating + '★' : null, a.preferredRole ? 'Prefers: ' + a.preferredRole : null].filter(Boolean).join(' · ')) + '</div>' +
          (a.note ? '<div class="meta">“' + esc(a.note) + '”</div>' : '') +
          (a.review && a.review.rating ? '<div class="meta"><span class="stars">' + O.starText(a.review.rating) + '</span>' + (a.review.comment ? ' ' + esc(a.review.comment) : '') + '</div>' : '') +
          '</div><div class="actions">' + actions + '</div></div>';
      }).join('') + '<p class="err" id="err-' + esc(eventId) + '" role="alert"></p>';
      bindApplicantActions(box, eventId);
    }).catch(function (err) { box.innerHTML = '<p class="err">' + esc(err.message) + '</p>'; });
  }

  function bindApplicantActions(box, eventId) {
    var errEl = function () { return document.getElementById('err-' + eventId); };
    var after = function (msg) { O.toast(msg); loadOverview(); responses(eventId); };
    box.querySelectorAll('[data-decide]').forEach(function (b) {
      b.addEventListener('click', function () {
        var d = b.getAttribute('data-decide');
        var done = O.busy(b, d === 'approve' ? 'Approving…' : 'Rejecting…');
        call('/admin/applications/' + encodeURIComponent(b.getAttribute('data-app')) + '/decision', { method: 'POST', body: { decision: d } })
          .then(function () { after(d === 'approve' ? 'Approved for the crew' : 'Marked not selected'); })
          .catch(function (err) { done(); fail(errEl(), err); });
      });
    });
    box.querySelectorAll('[data-kyc]').forEach(function (b) {
      b.addEventListener('click', function () {
        var done = O.busy(b, 'Verifying…');
        call('/admin/volunteers/' + encodeURIComponent(b.getAttribute('data-kyc')), { method: 'PATCH', body: { kycStatus: 'verified', kycNote: 'Aadhaar checked by the coordination team.' } })
          .then(function () { after('Aadhaar marked verified'); })
          .catch(function (err) { done(); fail(errEl(), err); });
      });
    });
    box.querySelectorAll('[data-review]').forEach(function (b) {
      b.addEventListener('click', function () {
        var outcome = b.getAttribute('data-review');
        var appId = b.getAttribute('data-app');
        var body = { outcome: outcome };
        if (outcome === 'completed') body.rating = Number(box.querySelector('[data-rating="' + appId + '"]').value);
        var done = O.busy(b, 'Saving…');
        call('/admin/applications/' + encodeURIComponent(appId) + '/review', { method: 'POST', body: body })
          .then(function (res) { after(outcome === 'completed' ? 'Rated ' + body.rating + '★ · now ' + res.volunteerStats.points + ' points' : 'Marked as no-show'); })
          .catch(function (err) { done(); fail(errEl(), err); });
      });
    });
  }

  function eventForm() {
    var box = document.getElementById('event-form');
    if (!box.hidden) { box.hidden = true; return; }
    var o = state.opts || { categories: Object.keys(O.CATEGORIES), networkCities: [] };
    box.hidden = false;
    box.innerHTML = '<form class="card card-pad" id="f-event" style="margin-top:14px" novalidate><h2 style="font-size:19px">Add an event</h2>' +
      '<div class="grid-2"><div class="field"><label for="e-title">Title <span class="req">*</span></label><input class="input" id="e-title" maxlength="120"></div>' +
      '<div class="field"><label for="e-cat">Category <span class="req">*</span></label><select class="input" id="e-cat">' + O.selectOptions(o.categories, 'Select category') + '</select></div></div>' +
      '<div class="grid-2"><div class="field"><label for="e-city">City <span class="req">*</span></label><input class="input" id="e-city" list="e-cities" maxlength="60" placeholder="e.g. Lucknow"><datalist id="e-cities">' +
      o.networkCities.map(function (c) { return '<option value="' + esc(c) + '"></option>'; }).join('') + '</datalist></div>' +
      '<div class="field"><label for="e-venue">Venue <span class="req">*</span></label><input class="input" id="e-venue" maxlength="120"></div></div>' +
      '<div class="grid-2"><div class="field"><label for="e-date">Date <span class="req">*</span></label><input class="input" id="e-date" type="date" min="' + O.todayIso() + '"></div>' +
      '<div class="field"><label for="e-need">Volunteer positions <span class="req">*</span></label><input class="input" id="e-need" type="number" min="1" max="5000" value="10"></div></div>' +
      '<div class="grid-2"><div class="field"><label for="e-start">Start time</label><input class="input" id="e-start" type="time"></div><div class="field"><label for="e-end">End time</label><input class="input" id="e-end" type="time"></div></div>' +
      '<div class="field"><label for="e-roles">Volunteer roles <span class="optional">(comma-separated)</span></label><input class="input" id="e-roles" placeholder="Crowd management, Registration desk"></div>' +
      '<div class="field"><label for="e-desc">Description</label><textarea class="input" id="e-desc" maxlength="2000" placeholder="First sentence shows on the event cards."></textarea></div>' +
      '<div class="grid-2"><div class="field"><label for="e-hl">Highlights <span class="optional">(comma-separated)</span></label><input class="input" id="e-hl" placeholder="Live Band, Food Court"></div>' +
      '<div class="field"><label for="e-img">Image URL <span class="optional">(https://)</span></label><input class="input" id="e-img" type="url" placeholder="https://…"></div></div>' +
      '<p class="err" id="e-err" role="alert" style="margin-top:10px"></p>' +
      '<p style="display:flex;gap:10px;margin-top:16px"><button class="btn" type="submit">Publish event</button><button class="btn btn-ghost" type="button" id="e-cancel">Cancel</button></p></form>';
    document.getElementById('e-cancel').addEventListener('click', function () { box.hidden = true; });
    document.getElementById('f-event').addEventListener('submit', function (ev) {
      ev.preventDefault();
      var val = function (id) { return document.getElementById(id).value.trim(); };
      var body = { title: val('e-title'), category: val('e-cat'), city: val('e-city'), venue: val('e-venue'), date: val('e-date'), volunteersNeeded: Number(val('e-need')) };
      var err = document.getElementById('e-err');
      if (!body.title || !body.category || !body.city || !body.venue || !body.date || !body.volunteersNeeded) { err.textContent = 'Fill in the fields marked *.'; return; }
      if (val('e-start')) body.startTime = val('e-start');
      if (val('e-end')) body.endTime = val('e-end');
      if (val('e-roles')) body.roles = val('e-roles');
      if (val('e-desc')) body.description = val('e-desc');
      if (val('e-hl')) body.highlights = val('e-hl');
      if (val('e-img')) body.image = val('e-img');
      var done = O.busy(ev.target.querySelector('button[type=submit]'), 'Publishing…');
      call('/admin/events', { method: 'POST', body: body })
        .then(function (res) { O.toast('Published ' + res.event.title); state.eventScope = 'upcoming'; refresh(); })
        .catch(function (e) { done(); err.textContent = e.message; });
    });
    document.getElementById('e-title').focus();
  }

  // ---- volunteers ------------------------------------------------------------------------
  function volunteersTab() {
    var panel = document.getElementById('a-panel');
    call('/admin/volunteers?sort=points&limit=200').then(function (res) {
      if (!res.volunteers.length) { panel.innerHTML = '<div class="empty"><b>No volunteers yet</b>Profiles appear here as volunteers register.</div>'; return; }
      panel.innerHTML = '<p class="hint" style="margin-bottom:10px">' + O.plural(res.total, 'volunteer') + ', highest points first.</p>' +
        '<div class="card table-wrap"><table class="table"><thead><tr><th>Volunteer</th><th>City</th><th>Skill / department</th><th>Aadhaar</th><th>Tier</th><th class="num">Points</th><th class="num">Events</th><th class="num">Rating</th><th></th></tr></thead><tbody>' +
        res.volunteers.map(function (v) {
          var s = v.stats;
          return '<tr><td><b>' + esc(v.name) + '</b><span class="sub">' + esc(O.prettyPhone(v.phone)) + (v.experience ? ' · ' + esc(v.experience) : '') + '</span></td><td>' + esc(v.city) + '</td><td>' + esc(v.department || '—') + '</td>' +
            '<td>' + badge(KYC, v.kyc.status) + '<span class="sub">' + esc(v.aadhaar) + '</span></td><td>' + esc(s.tier) + '</td><td class="num">' + s.points + '</td><td class="num">' + s.completedEvents + '</td>' +
            '<td class="num">' + (s.averageRating != null ? s.averageRating.toFixed(1) + '★' : '—') + '</td>' +
            '<td><div class="actions">' + (v.kyc.status !== 'verified' ? '<button class="btn btn-sm btn-ghost" type="button" data-vkyc="verified" data-id="' + esc(v.id) + '">Verify</button>' : '') +
            (v.kyc.status === 'pending' ? '<button class="btn btn-sm btn-danger" type="button" data-vkyc="rejected" data-id="' + esc(v.id) + '">Reject</button>' : '') + '</div></td></tr>';
        }).join('') + '</tbody></table></div>';
      panel.querySelectorAll('[data-vkyc]').forEach(function (b) {
        b.addEventListener('click', function () {
          var status = b.getAttribute('data-vkyc');
          var body = { kycStatus: status };
          if (status === 'rejected') { var note = window.prompt('Reason shown to the volunteer:', "Details didn't match the Aadhaar card."); if (note === null) return; body.kycNote = note; }
          var done = O.busy(b, '…');
          call('/admin/volunteers/' + encodeURIComponent(b.getAttribute('data-id')), { method: 'PATCH', body: body })
            .then(function () { O.toast(status === 'verified' ? 'Aadhaar verified' : 'Verification rejected'); refresh(); })
            .catch(function (err) { done(); O.toast(err.message); });
        });
      });
    }).catch(function (err) { panel.innerHTML = '<p class="notice bad">' + esc(err.message) + '</p>'; });
  }

  // ---- vendors ----------------------------------------------------------------------------
  function vendorsTab() {
    var panel = document.getElementById('a-panel');
    call('/admin/vendors?limit=200').then(function (res) {
      if (!res.vendors.length) { panel.innerHTML = '<div class="empty"><b>No vendor registrations yet</b>They appear here when vendors register at <a class="link" href="/vendors">/vendors</a>.</div>'; return; }
      panel.innerHTML = '<div class="card table-wrap"><table class="table"><thead><tr><th>Vendor</th><th>City</th><th>Category</th><th>GST</th><th>Status</th><th>Registered</th><th></th></tr></thead><tbody>' +
        res.vendors.map(function (v) {
          return '<tr><td><b>' + esc(v.companyName) + '</b><span class="sub">' + esc(v.contactPerson) + ' · ' + esc(O.prettyPhone(v.phone)) + '</span>' +
            (v.services ? '<span class="sub" style="white-space:normal;max-width:36ch">' + esc(v.services) + '</span>' : '') + '</td>' +
            '<td>' + esc(v.city) + '</td><td>' + esc(v.category) + '</td><td>' + esc(v.gstin || '—') + '</td><td>' + badge(VENDOR, v.status) + '</td>' +
            '<td>' + esc(O.prettyDate(v.createdAt.slice(0, 10))) + '</td>' +
            '<td><div class="actions">' + (v.status !== 'verified' ? '<button class="btn btn-sm" type="button" data-vendor="verified" data-id="' + esc(v.id) + '">Verify</button>' : '') +
            (v.status !== 'rejected' ? '<button class="btn btn-sm btn-danger" type="button" data-vendor="rejected" data-id="' + esc(v.id) + '">Reject</button>' : '') + '</div></td></tr>';
        }).join('') + '</tbody></table></div>';
      panel.querySelectorAll('[data-vendor]').forEach(function (b) {
        b.addEventListener('click', function () {
          var status = b.getAttribute('data-vendor');
          var done = O.busy(b, '…');
          call('/admin/vendors/' + encodeURIComponent(b.getAttribute('data-id')), { method: 'PATCH', body: { status: status } })
            .then(function () { O.toast(status === 'verified' ? 'Vendor verified' : 'Vendor rejected'); refresh(); })
            .catch(function (err) { done(); O.toast(err.message); });
        });
      });
    }).catch(function (err) { panel.innerHTML = '<p class="notice bad">' + esc(err.message) + '</p>'; });
  }

  // ---- feedback ---------------------------------------------------------------------------
  function feedbackTab() {
    var panel = document.getElementById('a-panel');
    var q = state.feedbackScope === 'all' ? '' : '?status=' + state.feedbackScope;
    call('/admin/feedback' + q).then(function (res) {
      panel.innerHTML = '<div class="chips">' + [['new', 'New'], ['resolved', 'Resolved'], ['all', 'All']].map(function (s) {
        return '<button class="chip" type="button" data-fscope="' + s[0] + '" aria-pressed="' + (state.feedbackScope === s[0]) + '">' + s[1] + '</button>';
      }).join('') + '</div><div style="margin-top:14px">' +
        (res.feedback.length ? res.feedback.map(function (f) {
          return '<article class="card fb-item"><div class="top"><span class="badge info">' + esc(f.category) + '</span>' +
            '<span class="badge ' + (f.status === 'new' ? 'warn' : 'ok') + '">' + (f.status === 'new' ? 'New' : 'Resolved') + '</span>' +
            '<b>' + esc(f.name || 'Anonymous') + '</b><span class="meta">' + esc(new Date(f.createdAt).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' })) + '</span></div>' +
            '<p>' + esc(f.message) + '</p>' +
            '<p style="margin-top:12px"><button class="btn btn-sm ' + (f.status === 'new' ? '' : 'btn-ghost') + '" type="button" data-fb="' + esc(f.id) + '" data-to="' + (f.status === 'new' ? 'resolved' : 'new') + '">' + (f.status === 'new' ? 'Mark resolved' : 'Reopen') + '</button>' +
            (f.resolvedBy ? ' <span class="hint">Resolved by ' + esc(f.resolvedBy) + '</span>' : '') + '</p></article>';
        }).join('') : '<div class="empty"><b>Inbox zero</b>No ' + (state.feedbackScope === 'all' ? '' : state.feedbackScope + ' ') + 'feedback.</div>') + '</div>';
      panel.querySelectorAll('[data-fscope]').forEach(function (b) { b.addEventListener('click', function () { state.feedbackScope = b.getAttribute('data-fscope'); feedbackTab(); }); });
      panel.querySelectorAll('[data-fb]').forEach(function (b) {
        b.addEventListener('click', function () {
          var done = O.busy(b, '…');
          call('/admin/feedback/' + encodeURIComponent(b.getAttribute('data-fb')), { method: 'PATCH', body: { status: b.getAttribute('data-to') } })
            .then(function () { O.toast('Feedback updated'); refresh(); })
            .catch(function (err) { done(); O.toast(err.message); });
        });
      });
    }).catch(function (err) { panel.innerHTML = '<p class="notice bad">' + esc(err.message) + '</p>'; });
  }

  if (session()) dashboard(); else signInView();
})();
