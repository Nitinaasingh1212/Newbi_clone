// Home page: stats strip, upcoming events from the API, and the "how it works" tiles.
(function () {
  'use strict';
  var O = window.OSH;

  // Headline numbers from the OSH design. Update them here when the real figures change.
  var STATS = [
    ['calendarCheck', '500+', 'Events Organized'],
    ['users', '10,000+', 'Attendees'],
    ['heartHand', '2,500+', 'Volunteers'],
    ['handshake', '50+', 'Partner Organizations'],
  ];
  document.getElementById('stats').innerHTML = STATS.map(function (s) {
    return '<div class="stat-item">' + O.icon(s[0], 36) + '<div><b>' + s[1] + '</b><span>' + s[2] + '</span></div></div>';
  }).join('');

  var HOW = [
    ['search', 'Discover events', 'Browse concerts, fests, workshops and sports near you, filtered by city and category.', '/events', 'Explore events'],
    ['ticket', 'Book in seconds', 'Pick a ticket type, add your details and get a booking code straight away.', '/events', 'Find something to book'],
    ['users', 'Volunteer and grow', 'Work real events, get rated by the coordination team and climb from Bronze to Platinum.', '/volunteer', 'Join as volunteer'],
  ];
  document.getElementById('how').innerHTML = HOW.map(function (h, i) {
    return '<article class="card tile"><span class="ico">' + O.icon(h[0], 24) + '</span>' +
      '<p class="step-num" style="margin-top:14px">0' + (i + 1) + '</p><h3 style="margin-top:4px">' + h[1] + '</h3><p>' + h[2] + '</p>' +
      '<p style="margin-top:12px"><a class="green" style="font-weight:600;text-decoration:none" href="' + h[3] + '">' + h[4] + ' →</a></p></article>';
  }).join('');

  var grid = document.getElementById('upcoming');
  O.api('/events?limit=8')
    .then(function (res) {
      document.getElementById('home-categories').innerHTML = '<a class="chip active" href="/events">All Events</a>' +
        res.categories.map(function (c) { return '<a class="chip" href="/events?category=' + encodeURIComponent(c) + '">' + O.esc(c) + '</a>'; }).join('');
      grid.innerHTML = res.events.length
        ? res.events.map(function (e) { return O.eventCard(e); }).join('')
        : '<div class="empty" style="grid-column:1/-1"><b>No upcoming events yet</b>New events will show up here as soon as they are announced.</div>';
    })
    .catch(function (err) {
      grid.innerHTML = '<div class="empty" style="grid-column:1/-1"><b>Couldn\'t load events</b>' + O.esc(err.message) + '</div>';
    });
})();
