// Explore Events: loads every upcoming event once, then searches and filters in the
// browser. Filters are mirrored in the URL (?q=&category=&city=&price=&when=&saved=1).
(function () {
  'use strict';
  var O = window.OSH;
  var els = {
    form: document.getElementById('search-form'), q: document.getElementById('q'),
    toggle: document.getElementById('filter-toggle'), count: document.getElementById('filter-count'), filters: document.getElementById('filters'),
    city: document.getElementById('f-city'), price: document.getElementById('f-price'), when: document.getElementById('f-when'),
    savedOnly: document.getElementById('f-saved'), reset: document.getElementById('f-reset'),
    categories: document.getElementById('categories'), meta: document.getElementById('results-meta'), results: document.getElementById('results'),
  };
  var params = new URLSearchParams(location.search);
  var state = {
    q: params.get('q') || '', category: params.get('category') || '', city: params.get('city') || '',
    price: params.get('price') || '', when: params.get('when') || '', saved: params.get('saved') === '1',
  };
  var all = [];
  var categories = [];

  function syncUrl() {
    var p = new URLSearchParams();
    ['q', 'category', 'city', 'price', 'when'].forEach(function (k) { if (state[k]) p.set(k, state[k]); });
    if (state.saved) p.set('saved', '1');
    history.replaceState(null, '', location.pathname + (p.toString() ? '?' + p : ''));
  }

  function daysFromToday(iso) { return Math.round((O.localDate(iso) - O.localDate(O.todayIso())) / 86400000); }

  function matches(e) {
    var q = state.q.trim().toLowerCase();
    if (q && [e.title, e.description, e.venue, e.city, e.category].concat(e.tags || []).join(' ').toLowerCase().indexOf(q) === -1) return false;
    if (state.category && e.category !== state.category) return false;
    if (state.city && e.city.toLowerCase() !== state.city.toLowerCase()) return false;
    if (state.price) { var free = O.priceInfo(e).free; if ((state.price === 'free') !== free) return false; }
    if (state.when === 'week' && daysFromToday(e.date) > 7) return false;
    if (state.when === 'month' && daysFromToday(e.date) > 30) return false;
    if (state.saved && !O.saved.has(e.id)) return false;
    return true;
  }

  function renderChips() {
    els.categories.innerHTML = ['', ].concat(categories).map(function (c) {
      return '<button class="chip" type="button" data-cat="' + O.esc(c) + '" aria-pressed="' + (state.category === c) + '">' + (c ? O.esc(c) : 'All Events') + '</button>';
    }).join('');
  }

  function render() {
    var list = all.filter(matches);
    var active = ['city', 'price', 'when'].filter(function (k) { return state[k]; }).length + (state.saved ? 1 : 0);
    els.count.hidden = !active;
    els.count.textContent = active;
    els.meta.textContent = list.length + ' event' + (list.length === 1 ? '' : 's') + (state.category ? ' in ' + state.category : '') + (state.city ? ' in ' + state.city : '') + (state.q ? ' for “' + state.q + '”' : '');
    els.results.innerHTML = list.length
      ? list.map(function (e) { return O.eventCard(e); }).join('')
      : '<div class="empty" style="grid-column:1/-1"><b>No events match</b>Try another search or clear the filters.<p style="margin-top:14px"><button class="btn btn-sm" type="button" id="clear-all">Clear filters</button></p></div>';
    var clear = document.getElementById('clear-all');
    if (clear) clear.addEventListener('click', resetAll);
    syncUrl();
  }

  function resetAll() {
    state = { q: '', category: '', city: '', price: '', when: '', saved: false };
    els.q.value = ''; els.city.value = ''; els.price.value = ''; els.when.value = ''; els.savedOnly.checked = false;
    renderChips();
    render();
  }

  els.q.value = state.q;
  els.price.value = state.price;
  els.when.value = state.when;
  els.savedOnly.checked = state.saved;
  if (state.city || state.price || state.when || state.saved) { els.filters.hidden = false; els.toggle.setAttribute('aria-expanded', 'true'); }

  els.form.addEventListener('submit', function (ev) { ev.preventDefault(); state.q = els.q.value; render(); });
  els.q.addEventListener('input', function () { state.q = els.q.value; render(); });
  els.toggle.addEventListener('click', function () {
    els.filters.hidden = !els.filters.hidden;
    els.toggle.setAttribute('aria-expanded', String(!els.filters.hidden));
  });
  els.city.addEventListener('change', function () { state.city = els.city.value; render(); });
  els.price.addEventListener('change', function () { state.price = els.price.value; render(); });
  els.when.addEventListener('change', function () { state.when = els.when.value; render(); });
  els.savedOnly.addEventListener('change', function () { state.saved = els.savedOnly.checked; render(); });
  els.reset.addEventListener('click', resetAll);
  els.categories.addEventListener('click', function (ev) {
    var chip = ev.target.closest('[data-cat]');
    if (!chip) return;
    state.category = chip.getAttribute('data-cat');
    renderChips();
    render();
  });
  document.addEventListener('osh:saved', function () { if (state.saved) render(); });

  O.api('/events?limit=200')
    .then(function (res) {
      all = res.events;
      categories = res.categories;
      if (state.category && categories.indexOf(state.category) === -1) state.category = '';
      els.city.innerHTML = '<option value="">All cities</option>' + res.cities.map(function (c) { return '<option>' + O.esc(c) + '</option>'; }).join('');
      var cityMatch = res.cities.filter(function (c) { return c.toLowerCase() === state.city.toLowerCase(); })[0];
      state.city = cityMatch || '';
      els.city.value = state.city;
      renderChips();
      render();
    })
    .catch(function (err) {
      els.results.innerHTML = '<div class="empty" style="grid-column:1/-1"><b>Couldn\'t load events</b>' + O.esc(err.message) + '</div>';
    });
})();
