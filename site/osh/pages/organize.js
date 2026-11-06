// Organize: services, process and the enquiry form (POST /api/v1/organize/enquiries).
(function () {
  'use strict';
  var O = window.OSH;
  var EVENT_TYPES = ['College fest', 'Concert', 'Corporate event', 'Brand activation', 'Workshop / conference', 'Sports event', 'Other'];
  var AUDIENCE = ['Under 200', '200 to 1,000', '1,000 to 5,000', 'Over 5,000'];
  var SERVICES = [
    ['clipboard', 'Event planning & production', 'Concept, run-of-show, vendors, stage and sound.'],
    ['users', 'Volunteer & crew staffing', 'Verified OSH volunteers for entry, desks, hospitality and backstage.'],
    ['ticket', 'Ticketing & registrations', 'Ticket types, online bookings and entry codes.'],
    ['mic', 'Artists & speakers', 'Line-ups for pro nights, fests and conferences.'],
    ['megaphone', 'Promotion', 'Campus outreach, social media and creator campaigns.'],
    ['shield', 'Logistics & safety', 'Crowd flow, first aid and permissions on the day.'],
  ];
  var PROCESS = [
    ['01', 'Brief', 'Tell us the what, where, when and who. A call or a form is enough.'],
    ['02', 'Plan', 'We send a plan with budget, timeline, staffing and ticketing.'],
    ['03', 'Run', 'Our coordinators and volunteers run the day, gate to green room.'],
    ['04', 'Report', 'Turnout, bookings, volunteer ratings and photos after the event.'],
  ];
  document.getElementById('services').innerHTML = SERVICES.map(function (s) {
    return '<article class="card tile"><span class="ico">' + O.icon(s[0], 24) + '</span><h3>' + O.esc(s[1]) + '</h3><p>' + O.esc(s[2]) + '</p></article>';
  }).join('');
  document.getElementById('process').innerHTML = PROCESS.map(function (p) {
    return '<article class="card tile"><p class="step-num">' + p[0] + '</p><h3 style="margin-top:6px">' + p[1] + '</h3><p>' + p[2] + '</p></article>';
  }).join('');
  [['i1', 'users'], ['i2', 'ticket'], ['i3', 'building'], ['i4', 'trendingUp']].forEach(function (x) { document.getElementById(x[0]).innerHTML = O.icon(x[1], 22); });

  var body = document.getElementById('enquiry-body');
  var preselect = O.qs('type');
  body.innerHTML =
    '<form id="f-enq" novalidate>' +
    '<div class="grid-2"><div class="field"><label for="e-name">Your name <span class="req">*</span></label><input class="input" id="e-name" autocomplete="name" maxlength="80"><p class="err" data-err="name"></p></div>' +
    '<div class="field"><label for="e-org">Organisation <span class="optional">(optional)</span></label><input class="input" id="e-org" autocomplete="organization" maxlength="100" placeholder="College, company or brand"></div></div>' +
    '<div class="grid-2"><div class="field"><label for="e-email">Email <span class="req">*</span></label><input class="input" id="e-email" type="email" autocomplete="email" maxlength="254"><p class="err" data-err="email"></p></div>' +
    '<div class="field"><label for="e-phone">Phone <span class="req">*</span></label><div class="input-row"><span class="input-prefix">+91</span><input class="input" id="e-phone" type="tel" inputmode="numeric" autocomplete="tel-national" maxlength="14" placeholder="98765 43210"></div><p class="err" data-err="phone"></p></div></div>' +
    '<div class="grid-2"><div class="field"><label for="e-type">Event type <span class="req">*</span></label><select class="input" id="e-type"><option value="">Select a type</option>' +
    EVENT_TYPES.map(function (t) { return '<option' + (t === preselect ? ' selected' : '') + '>' + O.esc(t) + '</option>'; }).join('') + '</select><p class="err" data-err="eventType"></p></div>' +
    '<div class="field"><label for="e-city">City <span class="optional">(optional)</span></label><input class="input" id="e-city" maxlength="60" placeholder="e.g. Lucknow"><p class="err" data-err="city"></p></div></div>' +
    '<div class="grid-2"><div class="field"><label for="e-date">Expected date <span class="optional">(optional)</span></label><input class="input" id="e-date" type="date" min="' + O.todayIso() + '"><p class="err" data-err="eventDate"></p></div>' +
    '<div class="field"><label for="e-aud">Expected audience <span class="optional">(optional)</span></label><select class="input" id="e-aud"><option value="">Not sure yet</option>' +
    AUDIENCE.map(function (a) { return '<option>' + O.esc(a) + '</option>'; }).join('') + '</select></div></div>' +
    '<div class="field"><label for="e-msg">What do you have in mind? <span class="req">*</span></label><textarea class="input" id="e-msg" maxlength="1500" placeholder="A two-day fest with a pro night, around 3,000 students…"></textarea><p class="err" data-err="message"></p></div>' +
    '<p class="err" id="enq-error" role="alert" style="margin-top:12px"></p>' +
    '<button class="btn btn-lg" type="submit" id="enq-submit" style="margin-top:18px">Send enquiry ' + O.icon('arrowRight', 18) + '</button></form>';

  var form = document.getElementById('f-enq');
  var ids = { name: 'e-name', email: 'e-email', phone: 'e-phone', eventType: 'e-type', city: 'e-city', eventDate: 'e-date', message: 'e-msg' };
  function err(field, msg) {
    var slot = form.querySelector('[data-err="' + field + '"]');
    if (ids[field]) document.getElementById(ids[field]).setAttribute('aria-invalid', msg ? 'true' : 'false');
    if (slot) slot.textContent = msg || '';
    return Boolean(slot);
  }
  function digits(v) {
    var d = String(v).replace(/\D/g, '');
    if (d.length === 12 && d.indexOf('91') === 0) d = d.slice(2);
    if (d.length === 11 && d[0] === '0') d = d.slice(1);
    return /^[6-9]\d{9}$/.test(d) ? d : null;
  }
  form.addEventListener('submit', function (ev) {
    ev.preventDefault();
    Object.keys(ids).forEach(function (k) { err(k, ''); });
    document.getElementById('enq-error').textContent = '';
    var v = function (id) { return document.getElementById(id).value.trim(); };
    var payload = {
      name: v('e-name'), organization: v('e-org') || undefined, email: v('e-email'), phone: digits(v('e-phone')),
      eventType: v('e-type'), city: v('e-city') || undefined, eventDate: v('e-date') || undefined, audience: v('e-aud') || undefined, message: v('e-msg'),
    };
    var bad = [];
    if (payload.name.length < 2) { err('name', 'Enter your name.'); bad.push('name'); }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email)) { err('email', 'Enter a valid email address.'); bad.push('email'); }
    if (!payload.phone) { err('phone', 'Enter a valid 10-digit mobile number.'); bad.push('phone'); }
    if (!payload.eventType) { err('eventType', 'Choose the kind of event.'); bad.push('eventType'); }
    if (payload.message.length < 10) { err('message', 'Tell us a little about the event (at least a sentence).'); bad.push('message'); }
    if (bad.length) { document.getElementById(ids[bad[0]]).focus(); return; }
    var btn = document.getElementById('enq-submit');
    var label = btn.innerHTML;
    btn.disabled = true; btn.textContent = 'Sending…';
    O.api('/organize/enquiries', { method: 'POST', body: payload })
      .then(function (res) {
        body.innerHTML = '<div style="text-align:center;padding:24px 0"><span class="success-mark">' + O.icon('check', 30) + '</span>' +
          '<h3 style="margin-top:14px;font-size:22px">Thanks, ' + O.esc(payload.name.split(' ')[0]) + '! We\'ve got your enquiry.</h3>' +
          '<p class="muted" style="margin-top:8px">Reference <b class="code">' + O.esc(res.enquiry.id) + '</b>. The OSH team will get back to you at ' + O.esc(payload.email) + '.</p>' +
          '<p style="margin-top:18px"><a class="btn btn-outline" href="/events">Browse events meanwhile</a></p></div>';
      })
      .catch(function (e) {
        btn.disabled = false; btn.innerHTML = label;
        var field = e.details && e.details.field;
        if (!(field && err(field, e.message))) document.getElementById('enq-error').textContent = e.message;
      });
  });
})();
