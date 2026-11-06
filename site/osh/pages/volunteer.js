// Join as a Volunteer: registration with phone OTP (inline), date of birth, city, Aadhaar
// and area of interest. A number that is already registered is signed straight in.
(function () {
  'use strict';
  var O = window.OSH;
  var body = document.getElementById('reg-body');
  var REG_KEY = 'osh_registration';
  var INTERESTS = ['Event Management', 'Crowd Management', 'Hospitality', 'Registration & Ticketing', 'Backstage & Artist Care', 'Technical & AV', 'Social Media & Content', 'Photography', 'Logistics', 'First Aid'];
  var DEFAULT_CITIES = ['Delhi', 'Mumbai', 'Bengaluru', 'Hyderabad', 'Chennai', 'Kolkata', 'Pune', 'Ahmedabad', 'Jaipur', 'Lucknow', 'Chandigarh', 'Gurugram', 'Noida', 'Indore', 'Kochi', 'Goa'];

  // Aadhaar numbers end in a Verhoeff check digit; checking here catches typos early.
  var VD = [[0,1,2,3,4,5,6,7,8,9],[1,2,3,4,0,6,7,8,9,5],[2,3,4,0,1,7,8,9,5,6],[3,4,0,1,2,8,9,5,6,7],[4,0,1,2,3,9,5,6,7,8],[5,9,8,7,6,0,4,3,2,1],[6,5,9,8,7,1,0,4,3,2],[7,6,5,9,8,2,1,0,4,3],[8,7,6,5,9,3,2,1,0,4],[9,8,7,6,5,4,3,2,1,0]];
  var VP = [[0,1,2,3,4,5,6,7,8,9],[1,5,7,6,2,8,3,0,9,4],[5,8,0,3,7,9,6,1,4,2],[8,9,1,6,0,4,3,5,2,7],[9,4,5,3,1,2,6,8,7,0],[4,2,8,6,5,7,3,9,0,1],[2,7,9,3,8,0,6,4,1,5],[7,0,4,6,9,1,3,2,5,8]];
  function aadhaarValid(d) {
    if (!/^[2-9]\d{11}$/.test(d)) return false;
    var c = 0;
    d.split('').reverse().forEach(function (x, i) { c = VD[c][VP[i % 8][Number(x)]]; });
    return c === 0;
  }
  function tenDigits(value) {
    var d = String(value).replace(/\D/g, '');
    if (d.length === 12 && d.indexOf('91') === 0) d = d.slice(2);
    if (d.length === 11 && d[0] === '0') d = d.slice(1);
    return /^[6-9]\d{9}$/.test(d) ? d : null;
  }
  function registration() {
    var r = O.readJson(REG_KEY, null, sessionStorage);
    return r && r.expires > Date.now() ? r : null;
  }
  function setRegistration(r) { O.write(REG_KEY, r ? JSON.stringify(r) : null, sessionStorage); }
  function prettyPhone(p) { var m = /^\+91(\d{5})(\d{5})$/.exec(p || ''); return m ? '+91 ' + m[1] + ' ' + m[2] : p; }

  // Already signed in: nothing to register.
  if (O.auth.token()) {
    var me = O.auth.me() || {};
    body.innerHTML = '<div class="notice ok" style="margin-top:16px"><b>You\'re already an OSH volunteer' + (me.name ? ', ' + O.esc(me.name.split(' ')[0]) : '') + '.</b> Apply to events in your city from your profile.</div>' +
      '<p style="margin-top:18px;display:flex;flex-wrap:wrap;gap:10px"><a class="btn" href="/profile">Go to my profile</a><button class="btn btn-ghost" type="button" id="switch-account">Use a different number</button></p>';
    document.getElementById('switch-account').addEventListener('click', function () { O.auth.signOut(); location.reload(); });
    return;
  }

  var maxDob = new Date();
  maxDob.setFullYear(maxDob.getFullYear() - 18);
  body.innerHTML =
    '<form id="f-reg" novalidate>' +
    '<p class="muted" style="margin-top:6px;font-size:14px">Fields marked <span class="req">*</span> are required.</p>' +
    '<div class="field"><label for="r-name">Full Name <span class="req">*</span> <span class="optional">(as on your Aadhaar)</span></label><input class="input" id="r-name" autocomplete="name" placeholder="Nitin Singh" maxlength="80"><p class="err" data-err="name"></p></div>' +
    '<div class="field"><label for="r-email">Email <span class="req">*</span></label><input class="input" id="r-email" type="email" autocomplete="email" placeholder="nitin@example.com" maxlength="254"><p class="err" data-err="email"></p></div>' +
    '<div class="field"><label for="r-phone">Phone <span class="req">*</span></label>' +
    '<div class="otp-row" id="phone-row"><div class="input-row"><span class="input-prefix">+91</span><input class="input" id="r-phone" type="tel" inputmode="numeric" autocomplete="tel-national" placeholder="98765 43210" maxlength="14"></div>' +
    '<button class="btn btn-outline" type="button" id="otp-send">Send OTP</button></div>' +
    '<p class="err" data-err="phone"></p>' +
    '<div id="otp-box" hidden><p class="notice" id="otp-note" style="margin-top:8px"></p>' +
    '<div class="otp-row" style="margin-top:10px"><input class="input otp-input" id="r-otp" inputmode="numeric" autocomplete="one-time-code" maxlength="6" placeholder="6-digit code" aria-label="6-digit code">' +
    '<button class="btn" type="button" id="otp-verify">Verify</button></div><p class="err" data-err="otp"></p>' +
    '<p class="hint" style="margin-top:6px"><button class="linkbtn" type="button" id="otp-resend" disabled>Resend code</button></p></div>' +
    '<p class="verified" id="phone-ok" hidden>' + O.icon('checkCircle', 18) + '<span id="phone-ok-text">Phone verified</span> <button class="linkbtn" type="button" id="phone-change" style="margin-left:8px">Change</button></p>' +
    '</div>' +
    '<div class="grid-2"><div class="field"><label for="r-dob">Date of birth <span class="req">*</span></label><input class="input" id="r-dob" type="date" min="1925-01-01" max="' + O.isoOf(maxDob) + '"><p class="err" data-err="dateOfBirth"></p></div>' +
    '<div class="field"><label for="r-city">City <span class="req">*</span></label><input class="input" id="r-city" list="city-options" autocomplete="address-level2" placeholder="e.g. Delhi" maxlength="60"><p class="err" data-err="city"></p></div></div>' +
    '<div class="field"><label for="r-aadhaar">Aadhaar number <span class="req">*</span></label><input class="input" id="r-aadhaar" inputmode="numeric" autocomplete="off" placeholder="1234 5678 9012" maxlength="14">' +
    '<p class="hint">We only keep the last 4 digits. Bring your Aadhaar card to your first event to get verified.</p><p class="err" data-err="aadhaarNumber"></p></div>' +
    '<div class="field"><label for="r-interest">Area of Interest <span class="req">*</span></label><select class="input" id="r-interest"><option value="">Select an area</option>' +
    INTERESTS.map(function (i) { return '<option>' + O.esc(i) + '</option>'; }).join('') + '</select><p class="err" data-err="interest"></p></div>' +
    '<label class="check"><input type="checkbox" id="r-terms"><span>I agree to the <a href="/terms" target="_blank" rel="noopener">Terms &amp; Conditions</a> and <a href="/privacy" target="_blank" rel="noopener">Privacy Policy</a>, and to OSH using my Aadhaar details to verify my identity.</span></label>' +
    '<p class="err" data-err="terms"></p>' +
    '<p class="err" id="reg-error" role="alert" style="margin-top:12px"></p>' +
    '<button class="btn btn-lg" type="submit" id="reg-submit" style="margin-top:20px">Register as Volunteer ' + O.icon('arrowRight', 18) + '</button>' +
    '<p class="switch-line" style="text-align:left">Already registered? <a href="/volunteer/login">Sign in</a></p>' +
    '</form>';

  var $ = function (id) { return document.getElementById(id); };
  var form = $('f-reg');
  var state = { phone: null, resendAt: 0, timer: null, reg: registration() };

  function fieldError(name, message) {
    var slot = form.querySelector('[data-err="' + name + '"]');
    var input = { name: 'r-name', email: 'r-email', phone: 'r-phone', otp: 'r-otp', dateOfBirth: 'r-dob', city: 'r-city', aadhaarNumber: 'r-aadhaar', interest: 'r-interest' }[name];
    if (input && $(input)) $(input).setAttribute('aria-invalid', message ? 'true' : 'false');
    if (slot) slot.textContent = message || '';
    return Boolean(slot);
  }
  function busy(btn, text) { var t = btn.innerHTML; btn.disabled = true; btn.textContent = text; return function () { btn.disabled = false; btn.innerHTML = t; }; }

  function showVerified() {
    $('phone-row').hidden = true;
    $('otp-box').hidden = true;
    $('phone-ok').hidden = false;
    $('phone-ok-text').textContent = prettyPhone(state.reg.phone) + ' verified';
    clearInterval(state.timer);
  }
  function resetPhone() {
    state.reg = null;
    setRegistration(null);
    $('phone-row').hidden = false;
    $('phone-ok').hidden = true;
    $('otp-box').hidden = true;
    $('r-phone').focus();
  }
  if (state.reg) showVerified();

  function tick() {
    var left = Math.ceil((state.resendAt - Date.now()) / 1000);
    $('otp-resend').disabled = left > 0;
    $('otp-resend').textContent = left > 0 ? 'Resend code in ' + left + 's' : 'Resend code';
  }

  function sendOtp(btn) {
    fieldError('phone', ''); fieldError('otp', '');
    var digits = tenDigits($('r-phone').value);
    if (!digits) return fieldError('phone', 'Enter a valid 10-digit Indian mobile number.');
    var done = busy(btn, 'Sending…');
    O.api('/auth/send-otp', { method: 'POST', body: { phone: digits } })
      .then(function (res) {
        done();
        state.phone = res.phone;
        state.resendAt = Date.now() + res.resendAfterSeconds * 1000;
        $('otp-box').hidden = false;
        $('otp-send').textContent = 'Resend';
        $('otp-note').innerHTML = res.devOtp
          ? '<b>Test mode:</b> SMS isn\'t switched on yet, so here is your code: <b>' + O.esc(res.devOtp) + '</b>'
          : 'We sent a 6-digit code to <b>' + O.esc(prettyPhone(res.phone)) + '</b>.';
        $('r-otp').value = res.devOtp || '';
        $('r-otp').focus();
        clearInterval(state.timer);
        tick();
        state.timer = setInterval(tick, 1000);
      })
      .catch(function (err) { done(); fieldError('phone', err.message); });
  }

  $('otp-send').addEventListener('click', function () { sendOtp($('otp-send')); });
  $('otp-resend').addEventListener('click', function () { sendOtp($('otp-resend')); });
  $('phone-change').addEventListener('click', resetPhone);
  $('r-otp').addEventListener('input', function () { this.value = this.value.replace(/\D/g, '').slice(0, 6); });
  $('r-aadhaar').addEventListener('input', function () {
    var d = this.value.replace(/\D/g, '').slice(0, 12);
    this.value = d.replace(/(\d{4})(?=\d)/g, '$1 ');
  });
  $('otp-verify').addEventListener('click', function () {
    var btn = this;
    fieldError('otp', '');
    var code = $('r-otp').value.trim();
    if (!/^\d{6}$/.test(code)) return fieldError('otp', 'Enter the 6-digit code.');
    var done = busy(btn, 'Checking…');
    O.api('/auth/verify-otp', { method: 'POST', body: { phone: state.phone, otp: code } })
      .then(function (res) {
        done();
        if (!res.isNewUser) {
          O.auth.signIn(res.token, res.volunteer);
          body.innerHTML = '<div class="notice ok" style="margin-top:16px"><b>Welcome back, ' + O.esc(res.volunteer.name.split(' ')[0]) + '!</b> This number already has a volunteer account. Taking you to your profile…</div>';
          setTimeout(function () { location.href = '/profile'; }, 1200);
          return;
        }
        state.reg = { token: res.registrationToken, phone: state.phone, expires: Date.now() + res.expiresInSeconds * 1000 };
        setRegistration(state.reg);
        showVerified();
        O.toast('Phone verified');
      })
      .catch(function (err) { done(); fieldError('otp', err.message); });
  });

  form.addEventListener('submit', function (ev) {
    ev.preventDefault();
    ['name', 'email', 'phone', 'otp', 'dateOfBirth', 'city', 'aadhaarNumber', 'interest', 'terms'].forEach(function (n) { fieldError(n, ''); });
    $('reg-error').textContent = '';
    var v = {
      name: $('r-name').value.trim(), email: $('r-email').value.trim(), dob: $('r-dob').value, city: $('r-city').value.trim(),
      aadhaar: $('r-aadhaar').value.replace(/\D/g, ''), interest: $('r-interest').value, terms: $('r-terms').checked,
    };
    var bad = [];
    function need(ok, field, msg) { if (!ok) { fieldError(field, msg); bad.push(field); } }
    need(v.name.length >= 2, 'name', 'Enter your full name.');
    need(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.email), 'email', 'Enter a valid email address.');
    need(Boolean(state.reg), 'phone', 'Verify your phone number with the OTP first.');
    need(Boolean(v.dob), 'dateOfBirth', 'Enter your date of birth.');
    if (v.dob) need(v.dob <= O.isoOf(maxDob), 'dateOfBirth', 'You need to be at least 18 to volunteer.');
    need(v.city.length >= 2, 'city', 'Enter the city you want to volunteer in.');
    need(v.aadhaar.length === 12 && aadhaarValid(v.aadhaar), 'aadhaarNumber', v.aadhaar.length === 12 ? "This doesn't look like a valid Aadhaar number. Check for typos." : 'Enter all 12 digits of your Aadhaar number.');
    need(Boolean(v.interest), 'interest', 'Choose an area of interest.');
    need(v.terms, 'terms', 'Please agree to continue.');
    if (bad.length) {
      var first = form.querySelector('[aria-invalid="true"]') || $('r-terms');
      if (first) first.focus();
      return;
    }
    var done = busy($('reg-submit'), 'Creating your profile…');
    O.api('/auth/register', {
      method: 'POST', token: state.reg.token,
      body: { name: v.name, email: v.email, dateOfBirth: v.dob, city: v.city, aadhaarNumber: v.aadhaar, skills: [v.interest] },
    })
      .then(function (res) {
        setRegistration(null);
        O.auth.signIn(res.token, res.volunteer);
        location.href = '/profile?welcome=1';
      })
      .catch(function (err) {
        done();
        if (err.status === 401) { resetPhone(); return fieldError('phone', 'Your phone verification expired. Verify your number again.'); }
        if (err.code === 'already_registered') { resetPhone(); return fieldError('phone', 'This number already has an account. Sign in instead.'); }
        var field = err.details && err.details.field;
        if (!(field && fieldError(field, err.message))) $('reg-error').textContent = err.message;
      });
  });

  O.api('/cities').then(function (res) { return res.cities.map(function (c) { return c.city; }); }).catch(function () { return []; })
    .then(function (fromApi) {
      var seen = {};
      $('city-options').innerHTML = fromApi.concat(DEFAULT_CITIES).filter(function (c) {
        var k = c.toLowerCase(); if (seen[k]) return false; seen[k] = true; return true;
      }).map(function (c) { return '<option value="' + O.esc(c) + '"></option>'; }).join('');
    });
})();
