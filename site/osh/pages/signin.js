// Sign In: phone -> OTP -> profile (or ?next=). Includes the demo account box.
// A number that isn't registered yet goes to the Join page with its verification kept.
(function () {
  'use strict';
  var O = window.OSH;
  var box = document.getElementById('signin-body');
  var next = O.qs('next');
  var target = next && /^\/(?!\/)/.test(next) ? next : '/profile';
  var state = { phone: null, resendAt: 0, timer: null, demo: null };

  function tenDigits(value) {
    var d = String(value).replace(/\D/g, '');
    if (d.length === 12 && d.indexOf('91') === 0) d = d.slice(2);
    if (d.length === 11 && d[0] === '0') d = d.slice(1);
    return /^[6-9]\d{9}$/.test(d) ? d : null;
  }
  function prettyPhone(p) { var m = /^\+91(\d{5})(\d{5})$/.exec(p || ''); return m ? '+91 ' + m[1] + ' ' + m[2] : p; }
  function busy(btn, text) { var t = btn.innerHTML; btn.disabled = true; btn.textContent = text; return function () { btn.disabled = false; btn.innerHTML = t; }; }
  var $ = function (id) { return document.getElementById(id); };

  function finish(res) {
    if (res.isNewUser) {
      O.write('osh_registration', JSON.stringify({ token: res.registrationToken, phone: state.phone, expires: Date.now() + res.expiresInSeconds * 1000 }), sessionStorage);
      box.innerHTML = '<div class="notice warn" style="margin-top:16px"><b>This number isn\'t registered yet.</b> Your phone is verified, so you only need to fill in your details.</div>' +
        '<a class="btn btn-block btn-lg" style="margin-top:16px" href="/volunteer#register">Complete registration</a>';
      return;
    }
    O.auth.signIn(res.token, res.volunteer);
    location.href = target;
  }

  function demoHtml() {
    var d = state.demo;
    if (!d) return '';
    return '<div class="demo-box" id="demo"><span class="eyebrow">Demo account</span>' +
      '<p class="muted" style="margin-top:6px;font-size:14px">See a volunteer dashboard filled with sample events, ratings and a leaderboard.</p>' +
      '<dl class="creds"><div><dt>Phone</dt><dd>+91 ' + O.esc(d.phone) + '</dd></div><div><dt>OTP</dt><dd>' + O.esc(d.otp) + '</dd></div></dl>' +
      '<button class="btn btn-outline btn-block" type="button" id="demo-login" style="margin-top:14px">Sign in as the demo volunteer</button><p class="err" id="demo-err"></p></div>';
  }

  function viewPhone(flash) {
    clearInterval(state.timer);
    box.innerHTML =
      '<form id="f-phone" novalidate><p class="muted" style="margin-top:6px;font-size:14px">We\'ll send you a 6-digit code.</p>' +
      (flash ? '<p class="notice warn" style="margin-top:12px">' + O.esc(flash) + '</p>' : '') +
      '<div class="field"><label for="s-phone">Mobile number</label><div class="input-row"><span class="input-prefix">+91</span>' +
      '<input class="input" id="s-phone" type="tel" inputmode="numeric" autocomplete="tel-national" placeholder="98765 43210" maxlength="14"></div><p class="err" id="phone-err"></p></div>' +
      '<button class="btn btn-block btn-lg" type="submit" style="margin-top:18px">Send code ' + O.icon('arrowRight', 18) + '</button></form>' +
      demoHtml() +
      '<p class="switch-line">New volunteer? <a href="/volunteer">Create your profile</a></p>';
    $('f-phone').addEventListener('submit', function (ev) {
      ev.preventDefault();
      $('phone-err').textContent = '';
      var digits = tenDigits($('s-phone').value);
      if (!digits) { $('phone-err').textContent = 'Enter a valid 10-digit Indian mobile number.'; return; }
      var done = busy(ev.submitter || this.querySelector('button'), 'Sending…');
      O.api('/auth/send-otp', { method: 'POST', body: { phone: digits } })
        .then(function (res) { state.phone = res.phone; state.resendAt = Date.now() + res.resendAfterSeconds * 1000; viewOtp(res); })
        .catch(function (err) { done(); $('phone-err').textContent = err.message; });
    });
    var demo = $('demo-login');
    if (demo) demo.addEventListener('click', function () {
      var done = busy(demo, 'Signing in…');
      O.api('/auth/send-otp', { method: 'POST', body: { phone: state.demo.phone } })
        .then(function (sent) { state.phone = sent.phone; return O.api('/auth/verify-otp', { method: 'POST', body: { phone: sent.phone, otp: state.demo.otp } }); })
        .then(finish)
        .catch(function (err) { done(); $('demo-err').textContent = err.message; });
    });
    $('s-phone').focus();
  }

  function viewOtp(res) {
    var isDemo = state.demo && state.phone === '+91' + state.demo.phone.replace(/\D/g, '');
    box.innerHTML =
      '<form id="f-otp" novalidate><p class="muted" style="margin-top:6px;font-size:14px">Enter the code sent to <b style="color:var(--text)">' + O.esc(prettyPhone(state.phone)) + '</b>. <button class="linkbtn" type="button" id="change">Change</button></p>' +
      (res.devOtp ? '<p class="notice" style="margin-top:12px">' + (isDemo ? '<b>Demo account:</b> the code is always <b>' : '<b>Test mode:</b> SMS isn\'t switched on yet, so here is your code: <b>') + O.esc(res.devOtp) + '</b></p>' : '') +
      '<div class="field"><label for="s-otp">One-time code</label><input class="input otp-input" id="s-otp" inputmode="numeric" autocomplete="one-time-code" maxlength="6" value="' + O.esc(res.devOtp || '') + '"><p class="err" id="otp-err"></p></div>' +
      '<button class="btn btn-block btn-lg" type="submit" style="margin-top:18px">Verify &amp; sign in</button>' +
      '<p class="switch-line"><button class="linkbtn" type="button" id="resend" disabled>Resend code</button></p></form>';
    $('change').addEventListener('click', function () { viewPhone(); });
    var resend = $('resend');
    function tick() {
      var left = Math.ceil((state.resendAt - Date.now()) / 1000);
      resend.disabled = left > 0;
      resend.textContent = left > 0 ? 'Resend code in ' + left + 's' : 'Resend code';
    }
    tick();
    state.timer = setInterval(tick, 1000);
    resend.addEventListener('click', function () {
      O.api('/auth/send-otp', { method: 'POST', body: { phone: state.phone } })
        .then(function (r) { state.resendAt = Date.now() + r.resendAfterSeconds * 1000; O.toast('New code sent'); viewOtp(r); })
        .catch(function (err) { $('otp-err').textContent = err.message; });
    });
    $('s-otp').addEventListener('input', function () { this.value = this.value.replace(/\D/g, '').slice(0, 6); });
    $('f-otp').addEventListener('submit', function (ev) {
      ev.preventDefault();
      $('otp-err').textContent = '';
      var code = $('s-otp').value.trim();
      if (!/^\d{6}$/.test(code)) { $('otp-err').textContent = 'Enter the 6-digit code.'; return; }
      var done = busy(this.querySelector('button[type=submit]'), 'Checking…');
      O.api('/auth/verify-otp', { method: 'POST', body: { phone: state.phone, otp: code } })
        .then(finish)
        .catch(function (err) { done(); $('otp-err').textContent = err.message; });
    });
    $('s-otp').focus();
  }

  if (O.auth.token()) { location.replace(target); return; }
  O.api('/health').then(function (h) { state.demo = h.demoLogin || null; }).catch(function () {}).then(function () {
    viewPhone(O.qs('reason') === 'expired' ? 'Your session ended. Please sign in again.' : O.qs('reason') === 'missing' ? "We couldn't find your account on the server. Sign in again, and register again if asked." : null);
    var demo = location.hash === '#demo' && $('demo');
    if (demo) { demo.scrollIntoView({ block: 'center' }); demo.classList.add('flash'); }
  });
})();
