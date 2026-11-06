// Event detail: /events/<id>.
(function () {
  'use strict';
  var O = window.OSH;
  var root = document.getElementById('event-root');
  var id = O.pathId(1);

  function notFound(message) {
    document.title = 'Event not found | OSH Entertainment';
    root.innerHTML = '<nav class="crumbs"><a href="/events">' + O.icon('arrowLeft', 16) + 'Events</a></nav>' +
      '<div class="empty"><b>We couldn\'t find that event</b>' + O.esc(message) + '<p style="margin-top:16px"><a class="btn" href="/events">Browse all events</a></p></div>';
  }

  function share(e) {
    var url = location.origin + '/events/' + encodeURIComponent(e.id);
    if (navigator.share) {
      navigator.share({ title: e.title, text: e.title + ' on OSH Entertainment', url: url }).catch(function () {});
    } else if (navigator.clipboard) {
      navigator.clipboard.writeText(url).then(function () { O.toast('Link copied'); }, function () { O.toast(url); });
    } else {
      O.toast(url);
    }
  }

  function render(e) {
    document.title = e.title + ' | OSH Entertainment';
    var p = O.priceInfo(e);
    var mapUrl = 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent([e.venue, e.address, e.city].filter(Boolean).join(', '));
    var me = O.auth.me();
    var volunteerHref = O.auth.token() ? '/profile' : '/volunteer';
    var volunteerText = O.auth.token()
      ? (me && me.city === e.city ? 'Apply from your profile' : 'Open your profile')
      : 'Join as volunteer';
    var ticketsHtml = e.tickets.length
      ? '<div class="ticket-list">' + e.tickets.map(function (t) {
          return '<div class="ticket-row"><span><b>' + O.esc(t.name) + '</b>' + (t.description ? '<br><span class="muted">' + O.esc(t.description) + '</span>' : '') + '</span><b class="green">' + (t.price ? O.money(t.price) : 'Free') + '</b></div>';
        }).join('') + '</div>'
      : '<p class="muted" style="margin-top:8px">Entry details will be announced soon.</p>';
    var bookBtn = e.bookable
      ? '<a class="btn btn-block btn-lg" style="margin-top:18px" href="/events/' + encodeURIComponent(e.id) + '/book">' + (p.free ? 'Register now' : 'Book Now') + ' ' + O.icon('arrowRight', 18) + '</a>' +
        '<p class="hint" style="margin-top:10px;text-align:center">Instant confirmation with a booking code.</p>'
      : '<p class="notice" style="margin-top:16px">' + (e.date < O.todayIso() ? 'This event has already happened.' : 'Bookings for this event are closed.') + '</p>';

    root.innerHTML =
      '<nav class="crumbs" aria-label="Breadcrumb"><a href="/events">' + O.icon('arrowLeft', 16) + 'Events</a><span aria-hidden="true">/</span><span>' + O.esc(e.title) + '</span></nav>' +
      '<div class="detail"><article>' +
      '<div class="detail-media">' + (e.image ? '<img src="' + O.esc(e.image) + '" alt="">' : '') +
      (e.category ? '<span class="ev-cat">' + O.esc(e.category) + '</span>' : '') +
      '<div class="actions"><button class="ev-heart" type="button" id="share-btn" aria-label="Share this event">' + O.icon('share', 18) + '</button>' +
      '<button class="ev-heart" type="button" data-save="' + O.esc(e.id) + '" aria-pressed="' + O.saved.has(e.id) + '" aria-label="Save this event">' + O.icon('heart', 18) + '</button></div></div>' +
      (e.imageCredit ? '<p class="hint" style="margin-top:8px">' + (e.imageCreditUrl ? '<a class="muted" href="' + O.esc(e.imageCreditUrl) + '" target="_blank" rel="noopener">' + O.esc(e.imageCredit) + '</a>' : O.esc(e.imageCredit)) + '</p>' : '') +
      '<h1>' + O.esc(e.title) + '</h1>' +
      '<div class="detail-meta"><span>' + O.icon('calendar', 18) + O.esc(O.prettyDate(e.date, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })) + '</span>' +
      (e.startTime ? '<span>' + O.icon('clock', 18) + O.esc(O.timeRange(e)) + '</span>' : '') +
      '<span>' + O.icon('pin', 18) + O.esc(e.venue + ', ' + e.city) + '</span></div>' +
      (e.tags.length ? '<div class="tags">' + e.tags.map(function (t) { return '<span class="tag">' + O.esc(t) + '</span>'; }).join('') + '</div>' : '') +
      '<h2>About the Event</h2><p class="about">' + O.esc(e.description || 'More details coming soon.') + '</p>' +
      (e.highlights.length ? '<h2>Event Highlights</h2><div class="highlights">' + e.highlights.map(function (h) {
        return '<div class="hl"><span class="ico">' + O.icon(O.highlightIcon(h), 24) + '</span>' + O.esc(h) + '</div>';
      }).join('') + '</div>' : '') +
      '<h2>Venue</h2><p class="about">' + O.esc([e.venue, e.address, e.city].filter(Boolean).join(', ')) + '</p>' +
      '<p style="margin-top:10px"><a class="green" style="font-weight:600" href="' + mapUrl + '" target="_blank" rel="noopener">Open in Google Maps ' + O.icon('arrowRight', 14) + '</a></p>' +
      '</article>' +
      '<aside class="side">' +
      '<div class="card card-pad"><h2>Tickets</h2><p class="price-big">' + O.esc(p.text) + '</p>' + ticketsHtml + bookBtn + '</div>' +
      (e.volunteersNeeded && e.date >= O.todayIso() && e.status === 'open'
        ? '<div class="card card-pad"><span class="eyebrow">Volunteer at this event</span>' +
          '<h2 style="margin-top:8px">' + (e.slotsLeft > 0 ? e.slotsLeft + ' of ' + e.volunteersNeeded + ' spots open' : 'Volunteer team is full') + '</h2>' +
          (e.roles.length ? '<div class="tags" style="display:flex;flex-wrap:wrap;gap:6px;margin-top:12px">' + e.roles.map(function (r) { return '<span class="tag">' + O.esc(r) + '</span>'; }).join('') + '</div>' : '') +
          '<p class="muted" style="margin-top:12px;font-size:14px">Volunteers in ' + O.esc(e.city) + ' can apply for a shift, get a certificate and earn points.</p>' +
          '<a class="btn btn-outline btn-block" style="margin-top:16px" href="' + volunteerHref + '">' + volunteerText + '</a></div>'
        : '') +
      '</aside></div>' +
      '<section class="section" id="more" hidden><div class="section-head"><h2>More events in ' + O.esc(e.city) + '</h2><a class="btn btn-outline btn-sm" href="/events?city=' + encodeURIComponent(e.city) + '">See all</a></div><div class="ev-grid" id="more-grid"></div></section>';

    document.getElementById('share-btn').addEventListener('click', function () { share(e); });

    O.api('/events?city=' + encodeURIComponent(e.city) + '&limit=5').then(function (res) {
      var others = res.events.filter(function (x) { return x.id !== e.id; }).slice(0, 4);
      if (!others.length) return;
      document.getElementById('more-grid').innerHTML = others.map(function (x) { return O.eventCard(x); }).join('');
      document.getElementById('more').hidden = false;
    }).catch(function () {});
  }

  if (!id) return notFound('The link is missing the event id.');
  O.api('/events/' + encodeURIComponent(id))
    .then(function (res) { render(res.event); })
    .catch(function (err) { notFound(err.status === 404 ? 'It may have been removed, or the link is wrong.' : err.message); });
})();
