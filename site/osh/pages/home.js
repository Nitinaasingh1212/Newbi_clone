// Home: network numbers, event categories, upcoming events with category chips, the city
// network, Star Volunteers, and the join / feedback calls to action.
(function () {
  'use strict';
  var O = window.OSH;
  var $ = function (id) { return document.getElementById(id); };
  var SHOWN_CITIES = 8; // 8 cities and a "More cities" tile
  var state = { events: [], category: '' };

  // Network numbers from the OSH design; replace with real figures before launch.
  $('stats').innerHTML = [['calendarCheck', '120+', 'Events Organized'], ['users', '1,250+', 'Volunteers'], ['pin', '28', 'Cities'], ['handshake', '85+', 'Partner Vendors']]
    .map(function (s) { return '<div class="stat-item">' + O.icon(s[0], 36) + '<div><b>' + s[1] + '</b><span>' + s[2] + '</span></div></div>'; }).join('');

  function categories(list, total) {
    var tiles = [{ name: 'All Events', meta: { icon: 'grid', blurb: 'Explore every opportunity' }, count: total, href: '/events' }]
      .concat(list.map(function (c) { return { name: c.name, meta: O.categoryMeta(c.name), count: c.count, href: '/events?category=' + encodeURIComponent(c.name) }; }));
    $('cat-tiles').innerHTML = tiles.map(function (t) {
      return '<a class="card cat-tile" href="' + t.href + '"><span class="ico">' + O.icon(t.meta.icon, 24) + '</span>' +
        '<b>' + O.esc(t.name) + '</b><small>' + O.esc(t.meta.blurb) + '</small><span class="num" aria-label="' + t.count + ' events">' + String(t.count).padStart(2, '0') + '</span></a>';
    }).join('');
    $('home-categories').innerHTML = ['All Events'].concat(list.filter(function (c) { return c.count; }).map(function (c) { return c.name; })).map(function (c) {
      var value = c === 'All Events' ? '' : c;
      return '<button class="chip" type="button" data-cat="' + O.esc(value) + '" aria-pressed="' + (state.category === value) + '">' + O.esc(c) + '</button>';
    }).join('');
  }

  function upcoming() {
    var list = state.events.filter(function (e) { return !state.category || e.category === state.category; }).slice(0, 4);
    $('upcoming').innerHTML = list.length
      ? list.map(function (e) { return O.eventCard(e); }).join('')
      : '<div class="empty" style="grid-column:1/-1"><b>No upcoming events yet</b>New crew opportunities appear here as soon as the OSH team lists them.</div>';
    document.querySelectorAll('#home-categories .chip').forEach(function (c) { c.setAttribute('aria-pressed', String(c.getAttribute('data-cat') === state.category)); });
  }

  function network(networkCities, cityCounts) {
    var counts = {};
    cityCounts.forEach(function (c) { counts[c.city.toLowerCase()] = c.count; });
    var names = networkCities.slice();
    var lower = names.map(function (n) { return n.toLowerCase(); });
    cityCounts.forEach(function (c) { if (lower.indexOf(c.city.toLowerCase()) === -1) names.push(c.city); });
    var expanded = false;
    function tile(name) {
      var n = counts[name.toLowerCase()] || 0;
      return '<a class="net-tile" href="/events?city=' + encodeURIComponent(name) + '">' + O.icon('pin', 22) + '<b>' + O.esc(name) + '</b>' +
        '<small>' + (n ? O.plural(n, 'event') : 'Coming soon') + '</small></a>';
    }
    function paint() {
      var list = expanded ? names : names.slice(0, SHOWN_CITIES);
      var more = names.length > SHOWN_CITIES
        ? '<button class="net-tile" type="button" id="more-cities" aria-expanded="' + expanded + '">' + O.icon(expanded ? 'x' : 'grid', 22) + '<b>' + (expanded ? 'Show fewer' : 'More cities') + '</b>' +
          '<small>' + (expanded ? '' : '+' + (names.length - SHOWN_CITIES)) + '</small></button>'
        : '<a class="net-tile" href="/events">' + O.icon('grid', 22) + '<b>All events</b><small>Every city</small></a>';
      $('net-grid').innerHTML = list.map(tile).join('') + more;
      var btn = $('more-cities');
      if (btn) btn.addEventListener('click', function () { expanded = !expanded; paint(); $('more-cities').focus(); });
    }
    paint();
  }

  function crew(list) {
    var el = $('crew');
    if (!list.length) {
      el.innerHTML = '<p class="crew-empty">Our first Elite Crew members appear here after their first rated event. <a class="link" href="/volunteer">Join the crew</a></p>';
      return;
    }
    el.innerHTML = list.map(function (v) {
      return '<div class="card crew-item"><span class="crew-av" aria-hidden="true">' + O.esc(v.name.charAt(0)) + '</span>' +
        '<div><b>' + O.esc(v.name) + (v.verified ? ' <span class="green" title="Aadhaar verified">' + O.icon('checkCircle', 15) + '</span>' : '') + '</b>' +
        '<small>' + O.esc([v.city, v.department].filter(Boolean).join(' · ')) + '</small></div>' +
        '<div class="r">' + (v.averageRating != null ? '<span class="stars" role="img" aria-label="Rated ' + v.averageRating + ' out of 5">' + O.starText(v.averageRating) + '</span>' : '') +
        O.esc(v.tier) + ' · ' + O.plural(v.completedEvents, 'event') + '</div></div>';
    }).join('') + '<a class="link" href="/volunteer" style="margin-top:4px">Grow into the Elite Crew ' + O.icon('arrowRight', 16) + '</a>';
  }

  document.addEventListener('click', function (ev) {
    var chip = ev.target.closest('#home-categories .chip');
    if (chip) { state.category = chip.getAttribute('data-cat'); upcoming(); }
  });

  Promise.all([O.api('/events?limit=200'), O.options().catch(function () { return { networkCities: [] }; })])
    .then(function (r) {
      var res = r[0];
      state.events = res.events;
      $('snapshot').innerHTML = '<b>' + res.total + '</b><span>upcoming crew opportunities across ' + O.plural(res.cities.length, 'city', 'cities') + '. Choose an event and tell us you\'re interested.</span>';
      categories(res.categories, res.total);
      upcoming();
      network(r[1].networkCities || [], res.cities);
    })
    .catch(function (err) {
      $('upcoming').innerHTML = '<div class="empty" style="grid-column:1/-1"><b>Couldn\'t load events</b>' + O.esc(err.message) + '</div>';
      network([], []);
    });

  O.api('/star-volunteers?limit=3').then(function (res) { crew(res.volunteers); }).catch(function () { crew([]); });
})();
