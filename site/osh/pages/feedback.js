// Volunteer Feedback: category, optional name and the message. Only admins can read it.
(function () {
  'use strict';
  var O = window.OSH;
  var root = document.getElementById('fb-body');

  function form(opts) {
    root.innerHTML =
      '<form id="f-fb" novalidate>' +
      '<div class="grid-2" style="margin-top:-16px"><div class="field"><label for="f-cat">Feedback category</label><select class="input" id="f-cat">' + O.selectOptions(opts.feedbackCategories, null, opts.feedbackCategories[0]) + '</select></div>' +
      '<div class="field"><label for="f-name">Your name <span class="optional">(optional)</span></label><input class="input" id="f-name" autocomplete="name" placeholder="Name or leave blank" maxlength="80"></div></div>' +
      '<div class="field"><label for="f-msg">Feedback <span class="req">*</span></label><textarea class="input" id="f-msg" maxlength="2000" style="min-height:150px" placeholder="Tell us what happened or how we can improve..."></textarea>' +
      '<p class="hint" id="f-count">0 / 2000</p><p class="err" id="f-err" role="alert"></p></div>' +
      '<button class="btn btn-lg btn-block" type="submit" id="f-submit" style="margin-top:16px">Send Feedback</button>' +
      '<p class="form-note">Only OSH management can read feedback. Leave your name blank to stay anonymous.</p></form>';

    var msg = document.getElementById('f-msg');
    msg.addEventListener('input', function () { document.getElementById('f-count').textContent = msg.value.length + ' / 2000'; });
    document.getElementById('f-fb').addEventListener('submit', function (ev) {
      ev.preventDefault();
      var err = document.getElementById('f-err');
      err.textContent = '';
      var text = msg.value.trim();
      if (text.length < 10) { err.textContent = 'Tell us a little more (at least 10 characters).'; msg.setAttribute('aria-invalid', 'true'); msg.focus(); return; }
      msg.setAttribute('aria-invalid', 'false');
      var body = { category: document.getElementById('f-cat').value, message: text };
      var name = document.getElementById('f-name').value.trim();
      if (name) body.name = name;
      var done = O.busy(document.getElementById('f-submit'), 'Sending…');
      O.api('/feedback', { method: 'POST', body: body })
        .then(function (res) {
          root.innerHTML = '<div class="success"><span class="success-mark">' + O.icon('check', 30) + '</span>' +
            '<h2>Thank you for telling us</h2>' +
            '<p class="muted">Your feedback reached OSH management' + (name ? '' : ' anonymously') + '. The team reviews every message.</p>' +
            '<p>Reference: <span class="ref">' + O.esc(res.feedback.id) + '</span></p>' +
            '<p style="display:flex;flex-wrap:wrap;gap:10px;margin-top:8px"><a class="btn" href="/">Back to home</a><button class="btn btn-ghost" type="button" id="again">Send more feedback</button></p></div>';
          document.getElementById('again').addEventListener('click', function () { form(opts); });
        })
        .catch(function (e) { done(); err.textContent = e.message; });
    });
  }

  O.options().then(form).catch(function (err) {
    root.innerHTML = '<p class="notice bad">Couldn\'t load the form: ' + O.esc(err.message) + '</p>';
  });
})();
