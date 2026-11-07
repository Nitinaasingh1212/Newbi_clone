// Upcoming Events: every open crew opportunity, filtered here by city, category and a search
// box. Filters are kept in the URL (?city=&category=&q=) so links like /events?city=Delhi work.
(function () {
  'use strict';
  var O = window.OSH;
  var $ = function (id) { return document.getElementById(id); };
  var state = { city: O.qs('city') || '', category: O.qs('category') || '', q: O.qs('q') || '', events: [], cities: [], categories: [] };
  var keyOf = function (s) { return String(s).toLowerCase().trim().replace(/[\s-]+/g, '-'); };

  function matches(e) {
    var q = state.q.trim().toLowerCase();
    return (!state.city || keyOf(e.city) === keyOf(state.city) || e.cityKey === keyOf(state.city)) &&
      (!state.category || e.category === state.category) &&
      (!q || [e.title, e.city, e.venue, e.category, e.description].concat(e.tags || [], e.roles || []).join(' ').toLowerCase().indexOf(q) !== -1);
  }

  function syncUrl() {
    var p = new URLSearchParams();
    if (state.city) p.set('city', state.city);
    if (state.category) p.set('category', state.category);
    if (state.q.trim()) p.set('q', state.q.trim());
    var url = '/events' + (p.toString() ? '?' + p : '');
    if (url !== location.pathname + location.search) history.replaceState(null, '', url);
  }

  function render() {
    var list = state.events.filter(matches);
    $('count-badge').textContent = O.plural(list.length, 'event');
    var parts = [];
    if (state.category) parts.push(state.category);
    if (state.city) parts.push('in ' + state.city);
    if (state.q.trim()) parts.push('matching “' + state.q.trim() + '”');
    $('results-meta').textContent = parts.length ? 'Showing ' + O.plural(list.length, 'event') + ' ' + parts.join(' ') : 'All upcoming crew opportunities across India';
    $('clear').hidden = !parts.length;
    $('results').innerHTML = list.length
      ? list.map(function (e) { return O.eventCard(e); }).join('')
      : '<div class="empty" style="grid-column:1/-1"><b>No events match</b>Try another city or category, or clear the filters.' +
        '<p style="margin-top:16px"><button class="btn btn-sm" type="button" data-clear>Clear filters</button></p></div>';
    document.querySelectorAll('#city-chips .chip').forEach(function (c) {
      c.setAttribute('aria-pressed', String(keyOf(c.getAttribute('data-city')) === keyOf(state.city)));
    });
    syncUrl();
  }

  function fillControls() {
    $('f-city').innerHTML = '<option value="">All Cities</option>' + state.cities.map(function (c) {
      return '<option value="' + O.esc(c.city) + '">' + O.esc(c.city) + ' (' + c.count + ')</option>';
    }).join('');
    $('f-cat').innerHTML = '<option value="">All Categories</option>' + state.categories.map(function (c) {
      return '<option value="' + O.esc(c.name) + '">' + O.esc(c.name) + ' (' + c.count + ')</option>';
    }).join('');
    var known = state.cities.filter(function (c) { return keyOf(c.city) === keyOf(state.city) || c.cityKey === keyOf(state.city); })[0];
    if (known) state.city = known.city;
    $('f-city').value = state.city;
    $('f-cat').value = state.category;
    $('q').value = state.q;
    $('city-chips').innerHTML = state.cities.map(function (c) {
      return '<button class="chip" type="button" data-city="' + O.esc(c.city) + '" aria-pressed="false">' + O.icon('pin', 15) + O.esc(c.city) + ' · ' + O.plural(c.count, 'event') + '</button>';
    }).join('');
  }

  function clearAll() { state.city = ''; state.category = ''; state.q = ''; fillControls(); render(); }

  $('f-city').addEventListener('change', function () { state.city = this.value; render(); });
  $('f-cat').addEventListener('change', function () { state.category = this.value; render(); });
  $('q').addEventListener('input', function () { state.q = this.value; render(); });
  $('filters').addEventListener('submit', function (ev) { ev.preventDefault(); });
  $('clear').addEventListener('click', clearAll);
  document.addEventListener('click', function (ev) {
    if (ev.target.closest('[data-clear]')) clearAll();
    var chip = ev.target.closest('#city-chips .chip');
    if (chip) {
      var city = chip.getAttribute('data-city');
      state.city = keyOf(city) === keyOf(state.city) ? '' : city;
      $('f-city').value = state.city;
      render();
    }
  });

  O.api('/events?limit=200')
    .then(function (res) {
      state.events = res.events;
      state.cities = res.cities;
      state.categories = res.categories;
      fillControls();
      render();
    })
    .catch(function (err) {
      $('results').innerHTML = '<div class="empty" style="grid-column:1/-1"><b>Couldn\'t load events</b>' + O.esc(err.message) + '</div>';
    });
})();
