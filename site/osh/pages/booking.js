// Booking confirmation: /bookings/<id>. Uses the copy saved in this browser when booking,
// and falls back to the API (the booking id itself is the proof of purchase).
(function () {
  'use strict';
  var O = window.OSH;
  var root = document.getElementById('booking-root');
  var id = O.pathId(1);

  function icsText(s) { return String(s || '').replace(/\\/g, '\\\\').replace(/[,;]/g, function (c) { return '\\' + c; }).replace(/\n/g, '\\n'); }
  function stamp(date, time) { return date.replace(/-/g, '') + (time ? 'T' + time.replace(':', '') + '00' : ''); }
  function calendarFile(b, e) {
    var allDay = !e.startTime;
    var lines = [
      'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//OSH Entertainment//Bookings//EN', 'CALSCALE:GREGORIAN', 'BEGIN:VEVENT',
      'UID:' + b.id + '@osh-entertainment',
      'DTSTAMP:' + new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d+/, ''),
      allDay ? 'DTSTART;VALUE=DATE:' + stamp(e.date) : 'DTSTART:' + stamp(e.date, e.startTime),
      allDay ? '' : 'DTEND:' + stamp(e.date, e.endTime || e.startTime),
      'SUMMARY:' + icsText(e.title),
      'LOCATION:' + icsText([e.venue, e.address, e.city].filter(Boolean).join(', ')),
      'DESCRIPTION:' + icsText('Booking ' + b.code + ' · ' + b.ticket.name + ' · ' + b.attendee.name),
      'END:VEVENT', 'END:VCALENDAR',
    ].filter(Boolean);
    return new Blob([lines.join('\r\n')], { type: 'text/calendar' });
  }

  function render(b, e) {
    document.title = 'Ticket ' + b.code + ' | OSH Entertainment';
    var fresh = Date.now() - new Date(b.createdAt).getTime() < 10 * 60 * 1000;
    root.innerHTML =
      '<div style="text-align:center;max-width:760px;margin:0 auto 22px"><span class="success-mark">' + O.icon('check', 32) + '</span>' +
      '<h1 style="margin-top:14px;font-size:clamp(1.8rem,4vw,2.4rem)">' + (fresh ? 'You\'re going!' : 'Your ticket') + '</h1>' +
      '<p class="muted" style="margin-top:6px">Show this booking code at the entry gate.</p></div>' +
      '<article class="card ticket">' +
      '<div class="ticket-top">' + (e && e.image ? '<img src="' + O.esc(e.image) + '" alt="">' : '<span></span>') +
      '<div class="ticket-info"><span class="eyebrow">' + O.esc(e && e.category ? e.category : 'Event') + '</span>' +
      '<h1 style="margin-top:6px">' + O.esc(e ? e.title : 'Event') + '</h1>' +
      (e ? '<p>' + O.icon('calendar', 17) + O.esc(O.prettyDate(e.date, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })) + '</p>' +
        (e.startTime ? '<p>' + O.icon('clock', 17) + O.esc(O.timeRange(e)) + '</p>' : '') +
        '<p>' + O.icon('pin', 17) + O.esc([e.venue, e.address, e.city].filter(Boolean).join(', ')) + '</p>' : '') +
      '</div></div>' +
      '<div class="ticket-cut" aria-hidden="true"></div>' +
      '<dl class="ticket-bottom">' +
      '<div><dt>Booking code</dt><dd class="code">' + O.esc(b.code) + '</dd></div>' +
      '<div><dt>Ticket</dt><dd>' + O.esc(b.ticket.name) + '</dd></div>' +
      '<div><dt>Attendee</dt><dd>' + O.esc(b.attendee.name) + '</dd></div>' +
      '<div><dt>Amount</dt><dd>' + (b.amount ? O.money(b.amount) : 'Free') + '</dd></div>' +
      '</dl></article>' +
      (b.payment === 'simulated'
        ? '<p class="notice warn" style="max-width:760px;margin:16px auto 0">Online payment isn\'t connected in this prototype, so this booking was confirmed without a charge.</p>'
        : '') +
      '<div style="display:flex;flex-wrap:wrap;gap:12px;justify-content:center;margin-top:22px">' +
      (e ? '<button class="btn" type="button" id="cal-btn">' + O.icon('calendarCheck', 18) + 'Add to calendar</button>' : '') +
      (e ? '<a class="btn btn-outline" href="/events/' + encodeURIComponent(b.eventId) + '">View event</a>' : '') +
      '<a class="btn btn-ghost" href="/events">Browse more events</a></div>' +
      '<p class="hint" style="text-align:center;margin-top:16px">Confirmation for ' + O.esc(b.attendee.email) + ' · Saved under <a class="green" href="' + (O.auth.token() ? '/profile#tickets' : '/profile') + '">My tickets</a> on this device.</p>';

    var cal = document.getElementById('cal-btn');
    if (cal) cal.addEventListener('click', function () {
      var url = URL.createObjectURL(calendarFile(b, e));
      var a = document.createElement('a');
      a.href = url; a.download = (e.title || 'event').replace(/[^\w]+/g, '-').toLowerCase() + '.ics';
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
    });
  }

  function missing(message) {
    root.innerHTML = '<div class="empty" style="max-width:760px;margin:0 auto"><b>We couldn\'t find this booking</b>' + O.esc(message) +
      '<p style="margin-top:16px"><a class="btn" href="/events">Browse events</a></p></div>';
  }

  var local = O.tickets.get(id);
  if (local) return render(local.booking, local.event);
  if (!id) return missing('The link is missing the booking id.');
  O.api('/bookings/' + encodeURIComponent(id))
    .then(function (res) { O.tickets.add(res.booking, res.event); render(res.booking, res.event); })
    .catch(function (err) { missing(err.status === 404 ? 'Check the link in your confirmation.' : err.message); });
})();
