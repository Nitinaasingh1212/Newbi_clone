// Explore Events: every open crew opportunity, filtered here by search, category chips, city
// and date. Filters are kept in the URL (?q=&category=&city=&when=) so links like
// /events?city=Delhi work.
(function () {
  'use strict';
  var O = window.OSH;
  var $ = function (id) { return document.getElementById(id); };
  var state = { q: O.qs('q') || '', category: O.qs('category') || '', city: O.qs('city') || '', when: O.qs('when') || '', events: [], cities: [], categories: [] };
  var keyOf = function (s) { return String(s).toLowerCase().trim().replace(/[\s-]+/g, '-'); };

  function inWindow(e) {
    if (!state.when) return true;
    var days = Math.round((O.localDate(e.date) - O.localDate(O.todayIso())) / 86400000);
    return days <= (state.when === 'week' ? 7 : 30);
  }
  function matches(e) {
    var q = state.q.trim().toLowerCase();
    return (!state.city || keyOf(e.city) === keyOf(state.city) || e.cityKey === keyOf(state.city)) &&
      (!state.category || e.category === state.category) && inWindow(e) &&
      (!q || [e.title, e.city, e.venue, e.category, e.description].concat(e.tags || [], e.roles || []).join(' ').toLowerCase().indexOf(q) !== -1);
  }

  function syncUrl() {
    var p = new URLSearchParams();
    if (state.q.trim()) p.set('q', state.q.trim());
    if (state.category) p.set('category', state.category);
    if (state.city) p.set('city', state.city);
    if (state.when) p.set('when', state.when);
    var url = '/events' + (p.toString() ? '?' + p : '');
    if (url !== location.pathname + location.search) history.replaceState(null, '', url);
  }

  function render() {
    var list = state.events.filter(matches);
    $('count-badge').textContent = O.plural(list.length, 'event');
    var parts = [];
    if (state.category) parts.push(state.category);
    if (state.city) parts.push('in ' + state.city);
    if (state.when) parts.push(state.when === 'week' ? 'in the next 7 days' : 'in the next 30 days');
    if (state.q.trim()) parts.push('matching “' + state.q.trim() + '”');
    $('results-meta').textContent = parts.length ? 'Showing ' + O.plural(list.length, 'event') + ' ' + parts.join(' ') : 'All upcoming crew opportunities across India';
    $('clear').hidden = !parts.length;
    var active = (state.city ? 1 : 0) + (state.when ? 1 : 0);
    $('filter-count').hidden = !active;
    $('filter-count').textContent = active;
    $('results').innerHTML = list.length
      ? list.map(function (e) { return O.eventCard(e); }).join('')
      : '<div class="empty" style="grid-column:1/-1"><b>No events match</b>Try another city or category, or clear the filters.' +
        '<p style="margin-top:16px"><button class="btn btn-sm" type="button" data-clear>Clear filters</button></p></div>';
    document.querySelectorAll('#categories .chip').forEach(function (c) { c.setAttribute('aria-pressed', String(c.getAttribute('data-cat') === state.category)); });
    syncUrl();
  }

  function fillControls() {
    $('f-city').innerHTML = '<option value="">All cities</option>' + state.cities.map(function (c) {
      return '<option value="' + O.esc(c.city) + '">' + O.esc(c.city) + ' (' + c.count + ')</option>';
    }).join('');
    var known = state.cities.filter(function (c) { return keyOf(c.city) === keyOf(state.city) || c.cityKey === keyOf(state.city); })[0];
    if (known) state.city = known.city;
    $('f-city').value = state.city;
    $('f-when').value = state.when;
    $('q').value = state.q;
    $('categories').innerHTML = [{ name: 'All Events', value: '' }].concat(state.categories.filter(function (c) { return c.count; }).map(function (c) { return { name: c.name, value: c.name }; }))
      .map(function (c) { return '<button class="chip" type="button" data-cat="' + O.esc(c.value) + '" aria-pressed="false">' + O.esc(c.name) + '</button>'; }).join('');
    if (state.city || state.when) { $('filters').hidden = false; $('filter-toggle').setAttribute('aria-expanded', 'true'); }
  }

  function clearAll() { state.q = ''; state.category = ''; state.city = ''; state.when = ''; fillControls(); render(); }

  $('q').addEventListener('input', function () { state.q = this.value; render(); });
  $('search-form').addEventListener('submit', function (ev) { ev.preventDefault(); });
  $('f-city').addEventListener('change', function () { state.city = this.value; render(); });
  $('f-when').addEventListener('change', function () { state.when = this.value; render(); });
  $('f-reset').addEventListener('click', function () { state.city = ''; state.when = ''; $('f-city').value = ''; $('f-when').value = ''; render(); });
  $('clear').addEventListener('click', clearAll);
  $('filter-toggle').addEventListener('click', function () {
    var open = $('filters').hidden;
    $('filters').hidden = !open;
    this.setAttribute('aria-expanded', String(open));
  });
  document.addEventListener('click', function (ev) {
    if (ev.target.closest('[data-clear]')) clearAll();
    var chip = ev.target.closest('#categories .chip');
    if (chip) { state.category = chip.getAttribute('data-cat'); render(); }
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
