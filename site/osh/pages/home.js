// Home: Star Volunteers, the city network grid, event categories, upcoming events and the
// network snapshot, all from the API.
(function () {
  'use strict';
  var O = window.OSH;
  var $ = function (id) { return document.getElementById(id); };
  var SHOWN_CITIES = 8; // the grid shows 8 cities and a "More Cities" tile, as in the design
  var AVATAR = ['t-blue', 't-red', 't-green', 't-gold'];

  function crew(list) {
    var el = $('crew');
    if (!list.length) {
      el.innerHTML = '<p class="crew-empty">Our first Elite Crew members appear here after their first rated event. <a class="link" href="/volunteer">Join the crew</a></p>';
      return;
    }
    el.innerHTML = list.map(function (v, i) {
      return '<div class="crew-item"><span class="crew-av ' + AVATAR[i % AVATAR.length] + '" aria-hidden="true"><b style="font-size:16px;margin:0">' + O.esc(v.name.charAt(0)) + '</b></span>' +
        '<div><b>' + O.esc(v.name) + (v.verified ? ' <span class="blue" title="Aadhaar verified">' + O.icon('checkCircle', 15) + '</span>' : '') + '</b>' +
        '<small>' + O.esc([v.city, v.department].filter(Boolean).join(' · ')) + '</small></div>' +
        '<div class="r">' + (v.averageRating != null ? '<span class="stars" role="img" aria-label="Rated ' + v.averageRating + ' out of 5">' + O.starText(v.averageRating) + '</span>' : '') +
        O.esc(v.tier) + ' · ' + O.plural(v.completedEvents, 'event') + '</div></div>';
    }).join('') + '<a class="link" href="/volunteer" style="margin-top:4px">Grow into the Elite Crew ' + O.icon('arrowRight', 16) + '</a>';
  }

  function network(networkCities, cityCounts) {
    var counts = {};
    cityCounts.forEach(function (c) { counts[c.city.toLowerCase()] = c.count; });
    var names = networkCities.slice();
    cityCounts.forEach(function (c) { if (names.map(function (n) { return n.toLowerCase(); }).indexOf(c.city.toLowerCase()) === -1) names.push(c.city); });
    var expanded = false;
    function tile(name) {
      var n = counts[name.toLowerCase()] || 0;
      return '<a class="net-tile" href="/events?city=' + encodeURIComponent(name) + '">' + O.icon('pin', 24) + '<b>' + O.esc(name) + '</b>' +
        '<small>' + (n ? O.plural(n, 'event') : 'Coming soon') + '</small></a>';
    }
    function paint() {
      var list = expanded ? names : names.slice(0, SHOWN_CITIES);
      var more = names.length > SHOWN_CITIES
        ? '<button class="net-tile more" type="button" id="more-cities" aria-expanded="' + expanded + '">' + O.icon(expanded ? 'x' : 'pin', 24) + '<b>' + (expanded ? 'Show fewer' : 'More Cities') + '</b>' +
          '<small>' + (expanded ? '' : '+' + (names.length - SHOWN_CITIES)) + '</small></button>'
        : '<a class="net-tile more" href="/events">' + O.icon('pin', 24) + '<b>More Cities</b><small>All events</small></a>';
      $('net-grid').innerHTML = list.map(tile).join('') + more;
      var btn = $('more-cities');
      if (btn) btn.addEventListener('click', function () { expanded = !expanded; paint(); $('more-cities').focus(); });
    }
    paint();
  }

  function categories(list, total) {
    var tiles = [{ name: 'All Events', meta: { color: 'blue', icon: 'grid', blurb: 'Explore every opportunity' }, count: total, href: '/events' }]
      .concat(list.map(function (c) { return { name: c.name, meta: O.categoryMeta(c.name), count: c.count, href: '/events?category=' + encodeURIComponent(c.name) }; }));
    $('cat-tiles').innerHTML = tiles.map(function (t) {
      return '<a class="cat-tile c-' + t.meta.color + '" href="' + t.href + '"><span class="ico">' + O.icon(t.meta.icon, 24) + '</span>' +
        '<b>' + O.esc(t.name) + '</b><small>' + O.esc(t.meta.blurb) + '</small><span class="num" aria-label="' + t.count + ' events">' + String(t.count).padStart(2, '0') + '</span></a>';
    }).join('');
  }

  function upcoming(res) {
    $('upcoming').innerHTML = res.events.length
      ? res.events.slice(0, 3).map(function (e) { return O.eventCard(e); }).join('')
      : '<div class="empty"><b>No upcoming events yet</b>New crew opportunities appear here as soon as the OSH team lists them.</div>';
    var snap = $('snapshot');
    snap.innerHTML = '<span class="big">' + res.total + '</span><div><span class="eyebrow">Network snapshot</span><b style="margin-top:6px">Upcoming opportunities across India</b>' +
      '<p>' + O.plural(res.cities.length, 'city', 'cities') + ' with open crew positions. City counts update with the event listings; pick a city to see its roles and dates.</p></div>' +
      '<a class="btn" href="/events">Explore all events</a>';
    snap.hidden = false;
  }

  Promise.all([O.api('/events?limit=200'), O.options().catch(function () { return { networkCities: [] }; })])
    .then(function (r) {
      network(r[1].networkCities || [], r[0].cities);
      categories(r[0].categories, r[0].total);
      upcoming(r[0]);
    })
    .catch(function (err) {
      $('upcoming').innerHTML = '<div class="empty"><b>Couldn\'t load events</b>' + O.esc(err.message) + '</div>';
      network([], []);
    });

  O.api('/star-volunteers?limit=3').then(function (res) { crew(res.volunteers); }).catch(function () { crew([]); });
})();
