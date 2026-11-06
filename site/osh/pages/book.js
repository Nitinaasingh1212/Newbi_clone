// Book Your Ticket: /events/<id>/book (?ticket=<ticketId> preselects a ticket type).
(function () {
  'use strict';
  var O = window.OSH;
  var root = document.getElementById('book-root');
  var id = O.pathId(1);

  function fail(title, message) {
    root.innerHTML = '<nav class="crumbs"><a href="/events">' + O.icon('arrowLeft', 16) + 'Events</a></nav>' +
      '<div class="empty"><b>' + O.esc(title) + '</b>' + O.esc(message) + '<p style="margin-top:16px"><a class="btn" href="/events">Browse events</a></p></div>';
  }

  function tenDigits(value) {
    var d = String(value).replace(/\D/g, '');
    if (d.length === 12 && d.indexOf('91') === 0) d = d.slice(2);
    if (d.length === 11 && d[0] === '0') d = d.slice(1);
    return /^[6-9]\d{9}$/.test(d) ? d : null;
  }

  function render(e) {
    document.title = 'Book: ' + e.title + ' | OSH Entertainment';
    if (!e.bookable) {
      root.innerHTML = '<nav class="crumbs"><a href="/events/' + encodeURIComponent(e.id) + '">' + O.icon('arrowLeft', 16) + O.esc(e.title) + '</a></nav>' +
        '<div class="empty"><b>Bookings are closed</b>' + (e.date < O.todayIso() ? 'This event has already happened.' : 'This event is not taking bookings right now.') +
        '<p style="margin-top:16px"><a class="btn" href="/events">Find another event</a></p></div>';
      return;
    }
    var me = O.auth.me() || {};
    var wanted = O.qs('ticket');
    var selected = e.tickets.filter(function (t) { return t.id === wanted; })[0] || e.tickets[0];
    var phone = me.phone ? String(me.phone).replace(/^\+91/, '') : '';

    root.innerHTML =
      '<nav class="crumbs" aria-label="Breadcrumb"><a href="/events">' + O.icon('arrowLeft', 16) + 'Events</a><span aria-hidden="true">/</span>' +
      '<a href="/events/' + encodeURIComponent(e.id) + '" style="font-weight:500">' + O.esc(e.title) + '</a><span aria-hidden="true">/</span><span>Book</span></nav>' +
      '<header class="page-head" style="padding-top:0"><h1>Book Your Ticket</h1></header>' +
      '<form class="book-grid" id="book-form" novalidate style="margin-top:18px"><div>' +
      '<div class="card summary">' + (e.image ? '<img src="' + O.esc(e.image) + '" alt="">' : '<span></span>') +
      '<div><h3>' + O.esc(e.title) + '</h3><p>' + O.icon('calendar', 15) + O.esc(O.prettyDate(e.date)) + (e.startTime ? ' · ' + O.esc(O.prettyTime(e.startTime)) : '') + '</p>' +
      '<p>' + O.icon('pin', 15) + O.esc(e.venue + ', ' + e.city) + '</p></div></div>' +

      '<div class="card card-pad" style="margin-top:16px"><fieldset style="border:0;margin:0;padding:0"><legend><h2 style="font-size:19px">Select Ticket Type</h2></legend>' +
      '<div style="margin-top:14px">' + e.tickets.map(function (t) {
        return '<label class="ticket-option"><input type="radio" name="ticketId" value="' + O.esc(t.id) + '"' + (t.id === selected.id ? ' checked' : '') + '>' +
          '<span class="radio" aria-hidden="true"></span><span><b>' + O.esc(t.name) + '</b>' + (t.description ? '<small>' + O.esc(t.description) + '</small>' : '') + '</span>' +
          '<span class="amount">' + O.money(t.price) + '</span></label>';
      }).join('') + '</div></fieldset></div>' +

      '<div class="card card-pad" style="margin-top:16px"><h2 style="font-size:19px">Attendee Details</h2>' +
      '<div class="field"><label for="b-name">Full Name <span class="req">*</span></label><input class="input" id="b-name" name="name" autocomplete="name" maxlength="80" value="' + O.esc(me.name || '') + '" required><p class="err" data-err="name"></p></div>' +
      '<div class="field"><label for="b-email">Email <span class="req">*</span></label><input class="input" id="b-email" name="email" type="email" autocomplete="email" maxlength="254" value="' + O.esc(me.email || '') + '" required><p class="err" data-err="email"></p></div>' +
      '<div class="field"><label for="b-phone">Phone <span class="req">*</span></label><div class="input-row"><span class="input-prefix">+91</span><input class="input" id="b-phone" name="phone" type="tel" inputmode="numeric" autocomplete="tel-national" maxlength="14" placeholder="98765 43210" value="' + O.esc(phone) + '" required></div><p class="err" data-err="phone"></p></div>' +
      '</div></div>' +

      '<aside class="side"><div class="card card-pad"><h2>Order summary</h2>' +
      '<div style="margin-top:12px"><div class="order-line"><span id="sum-ticket"></span><span id="sum-price"></span></div>' +
      '<div class="order-line muted"><span>Quantity</span><span>1</span></div>' +
      '<div class="order-line order-total"><span>Total</span><span id="sum-total"></span></div></div>' +
      '<p class="err" id="form-error" role="alert" style="margin-top:12px"></p>' +
      '<button class="btn btn-block btn-lg" type="submit" id="pay-btn" style="margin-top:16px"></button>' +
      '<p class="hint" id="pay-note" style="margin-top:12px"></p></div></aside>' +
      '</form>';

    var form = document.getElementById('book-form');
    function current() {
      var v = (form.querySelector('input[name=ticketId]:checked') || {}).value;
      return e.tickets.filter(function (t) { return t.id === v; })[0] || selected;
    }
    function updateSummary() {
      var t = current();
      document.getElementById('sum-ticket').textContent = t.name;
      document.getElementById('sum-price').textContent = O.money(t.price);
      document.getElementById('sum-total').textContent = O.money(t.price);
      document.getElementById('pay-btn').innerHTML = (t.price ? 'Proceed to Pay ' + O.money(t.price) : 'Confirm Registration') + ' ' + O.icon('arrowRight', 18);
      document.getElementById('pay-note').textContent = t.price
        ? 'Online payment isn\'t connected in this prototype yet, so your booking is confirmed without a charge.'
        : 'Free ticket. You\'ll get a booking code right away.';
    }
    form.addEventListener('change', updateSummary);
    updateSummary();

    function fieldError(name, message) {
      var input = form.querySelector('[name="' + name + '"]');
      var slot = form.querySelector('[data-err="' + name + '"]');
      if (input) input.setAttribute('aria-invalid', message ? 'true' : 'false');
      if (slot) slot.textContent = message || '';
      return Boolean(slot);
    }

    form.addEventListener('submit', function (ev) {
      ev.preventDefault();
      ['name', 'email', 'phone'].forEach(function (n) { fieldError(n, ''); });
      document.getElementById('form-error').textContent = '';
      var name = document.getElementById('b-name').value.trim();
      var email = document.getElementById('b-email').value.trim();
      var digits = tenDigits(document.getElementById('b-phone').value);
      var bad = [];
      if (name.length < 2) { fieldError('name', 'Enter the attendee\'s full name.'); bad.push('name'); }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { fieldError('email', 'Enter a valid email address.'); bad.push('email'); }
      if (!digits) { fieldError('phone', 'Enter a valid 10-digit mobile number.'); bad.push('phone'); }
      if (bad.length) { form.querySelector('[name="' + bad[0] + '"]').focus(); return; }

      var btn = document.getElementById('pay-btn');
      var label = btn.innerHTML;
      btn.disabled = true;
      btn.textContent = 'Confirming…';
      O.api('/events/' + encodeURIComponent(e.id) + '/bookings', { method: 'POST', body: { ticketId: current().id, name: name, email: email, phone: digits } })
        .then(function (res) {
          O.tickets.add(res.booking, res.event);
          location.href = '/bookings/' + encodeURIComponent(res.booking.id);
        })
        .catch(function (err) {
          btn.disabled = false;
          btn.innerHTML = label;
          var field = err.details && err.details.field;
          if (!(field && fieldError(field, err.message))) document.getElementById('form-error').textContent = err.message;
        });
    });
  }

  if (!id) return fail('No event selected', 'Choose an event to book.');
  O.api('/events/' + encodeURIComponent(id))
    .then(function (res) { render(res.event); })
    .catch(function (err) { fail('We couldn\'t find that event', err.status === 404 ? 'It may have been removed, or the link is wrong.' : err.message); });
})();
