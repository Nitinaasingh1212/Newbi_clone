// Volunteer Registration: phone OTP (inline), then name, city, skill / department,
// experience, availability, date of birth and Aadhaar. A number that is already registered
// is signed straight in. ?event=<id> brings the volunteer back to that event afterwards.
(function () {
  'use strict';
  var O = window.OSH;
  var body = document.getElementById('reg-body');
  var REG_KEY = 'osh_registration';
  var OTHER = 'Other city…';
  var eventId = O.qs('event');
  var afterHref = eventId && /^[\w-]+$/.test(eventId) ? '/events/' + encodeURIComponent(eventId) + '#interest' : '/profile?welcome=1';
  var TIER_STYLE = { '5-Star Elite': ['tier-elite', '★★★★★'], Experienced: ['tier-exp', '★★★★☆'], Trained: ['tier-trained', '★★★☆☆'], 'New Joiner': ['tier-new', ''] };

  // Aadhaar numbers end in a Verhoeff check digit; checking here catches typos early.
  var VD = [[0,1,2,3,4,5,6,7,8,9],[1,2,3,4,0,6,7,8,9,5],[2,3,4,0,1,7,8,9,5,6],[3,4,0,1,2,8,9,5,6,7],[4,0,1,2,3,9,5,6,7,8],[5,9,8,7,6,0,4,3,2,1],[6,5,9,8,7,1,0,4,3,2],[7,6,5,9,8,2,1,0,4,3],[8,7,6,5,9,3,2,1,0,4],[9,8,7,6,5,4,3,2,1,0]];
  var VP = [[0,1,2,3,4,5,6,7,8,9],[1,5,7,6,2,8,3,0,9,4],[5,8,0,3,7,9,6,1,4,2],[8,9,1,6,0,4,3,5,2,7],[9,4,5,3,1,2,6,8,7,0],[4,2,8,6,5,7,3,9,0,1],[2,7,9,3,8,0,6,4,1,5],[7,0,4,6,9,1,3,2,5,8]];
  function aadhaarValid(d) {
    if (!/^[2-9]\d{11}$/.test(d)) return false;
    var c = 0;
    d.split('').reverse().forEach(function (x, i) { c = VD[c][VP[i % 8][Number(x)]]; });
    return c === 0;
  }
  function registration() {
    var r = O.readJson(REG_KEY, null, sessionStorage);
    return r && r.expires > Date.now() ? r : null;
  }
  function setRegistration(r) { O.write(REG_KEY, r ? JSON.stringify(r) : null, sessionStorage); }

  // The Elite Crew ladder, with the points each tier needs.
  O.api('/ranking/rules').then(function (res) {
    var r = res.rules;
    document.getElementById('tiers').innerHTML = r.tiers.map(function (t) {
      var s = TIER_STYLE[t.name] || ['tier-new', ''];
      return '<div class="tier-item ' + s[0] + '"><div class="top">' + (s[1] ? '<span class="st" aria-hidden="true">' + s[1] + '</span>' : '') + '<b>' + O.esc(t.name) + '</b></div>' +
        '<p>' + O.esc(t.about || '') + '</p><small>' + (t.minPoints ? t.minPoints + '+ points' : 'From your first day') + '</small></div>';
    }).join('');
    document.getElementById('points-rule').textContent = 'Each completed event earns ' + r.pointsPerCompletedEvent + ' points, plus up to +' + r.ratingBonusByStars[5] + ' for a 5-star rating. A no-show costs ' + Math.abs(r.noShowPenalty) + '.';
  }).catch(function () {});

  // Already signed in: nothing to register.
  if (O.auth.token()) {
    var me = O.auth.me() || {};
    body.innerHTML = '<div class="notice ok" style="margin-top:16px"><b>You\'re already an OSH volunteer' + (me.name ? ', ' + O.esc(me.name.split(' ')[0]) : '') + '.</b> Send interest for events in your city from the events page or your profile.</div>' +
      '<p style="margin-top:18px;display:flex;flex-wrap:wrap;gap:10px"><a class="btn" href="' + (eventId ? afterHref : '/profile') + '">' + (eventId ? 'Back to the event' : 'Go to my profile') + '</a><button class="btn btn-ghost" type="button" id="switch-account">Use a different number</button></p>';
    document.getElementById('switch-account').addEventListener('click', function () { O.auth.signOut(); location.reload(); });
    return;
  }

  var maxDob = new Date();
  maxDob.setFullYear(maxDob.getFullYear() - 18);

  function build(opts, eventTitle) {
    var cities = opts.networkCities.concat([OTHER]);
    body.innerHTML =
      (eventTitle ? '<p class="notice info" style="margin-top:16px">Register to send your interest for <b>' + O.esc(eventTitle) + '</b>. We\'ll take you back to it afterwards.</p>' : '') +
      '<form id="f-reg" novalidate>' +
      '<p class="hint" style="margin-top:14px">Fields marked <span class="req">*</span> are required.</p>' +
      '<div class="field"><label for="r-name">Full name <span class="req">*</span> <span class="optional">(as on your Aadhaar)</span></label><input class="input" id="r-name" autocomplete="name" placeholder="Your full name" maxlength="80"><p class="err" data-err="name"></p></div>' +
      '<div class="field"><label for="r-phone">Mobile number <span class="req">*</span></label>' +
      '<div class="otp-row" id="phone-row"><div class="input-row"><span class="input-prefix">+91</span><input class="input" id="r-phone" type="tel" inputmode="numeric" autocomplete="tel-national" placeholder="10-digit mobile" maxlength="14"></div>' +
      '<button class="btn btn-outline" type="button" id="otp-send">Send OTP</button></div>' +
      '<p class="err" data-err="phone"></p>' +
      '<div id="otp-box" hidden><p class="notice" id="otp-note" style="margin-top:8px"></p>' +
      '<div class="otp-row" style="margin-top:10px"><input class="input otp-input" id="r-otp" inputmode="numeric" autocomplete="one-time-code" maxlength="6" placeholder="6-digit code" aria-label="6-digit code">' +
      '<button class="btn" type="button" id="otp-verify">Verify</button></div><p class="err" data-err="otp"></p>' +
      '<p class="hint" style="margin-top:6px"><button class="linkbtn" type="button" id="otp-resend" disabled>Resend code</button></p></div>' +
      '<p class="verified" id="phone-ok" hidden>' + O.icon('checkCircle', 18) + '<span id="phone-ok-text">Mobile verified</span> <button class="linkbtn" type="button" id="phone-change" style="margin-left:8px">Change</button></p>' +
      '</div>' +
      '<div class="grid-2"><div class="field"><label for="r-email">Email <span class="optional">(optional)</span></label><input class="input" id="r-email" type="email" autocomplete="email" placeholder="you@example.com" maxlength="254"><p class="err" data-err="email"></p></div>' +
      '<div class="field"><label for="r-city">Preferred city <span class="req">*</span></label><select class="input" id="r-city">' + O.selectOptions(cities, 'Select city') + '</select>' +
      '<input class="input" id="r-city-other" placeholder="Type your city" autocomplete="address-level2" maxlength="60" hidden style="margin-top:8px" aria-label="Your city"><p class="err" data-err="city"></p></div></div>' +
      '<div class="grid-2"><div class="field"><label for="r-dept">Skill / department <span class="req">*</span></label><select class="input" id="r-dept">' + O.selectOptions(opts.departments, 'Choose skill') + '</select><p class="err" data-err="department"></p></div>' +
      '<div class="field"><label for="r-exp">Experience</label><select class="input" id="r-exp">' + O.selectOptions(opts.experienceLevels, null, 'Fresher') + '</select></div></div>' +
      '<div class="grid-2"><div class="field"><label for="r-avail">Availability</label><select class="input" id="r-avail">' + O.selectOptions(opts.availability, null, opts.availability[0]) + '</select></div>' +
      '<div class="field"><label for="r-dob">Date of birth <span class="req">*</span></label><input class="input" id="r-dob" type="date" min="1925-01-01" max="' + O.isoOf(maxDob) + '"><p class="err" data-err="dateOfBirth"></p></div></div>' +
      '<div class="field"><label for="r-aadhaar">Aadhaar number <span class="req">*</span></label><input class="input" id="r-aadhaar" inputmode="numeric" autocomplete="off" placeholder="1234 5678 9012" maxlength="14">' +
      '<p class="hint">We keep only the last 4 digits. Bring your Aadhaar card to your first event to get verified.</p><p class="err" data-err="aadhaarNumber"></p></div>' +
      '<label class="check"><input type="checkbox" id="r-terms"><span>I agree to the <a href="/terms" target="_blank" rel="noopener">Terms &amp; Conditions</a> and <a href="/privacy" target="_blank" rel="noopener">Privacy Policy</a>, and to OSH using my Aadhaar details to verify my identity.</span></label>' +
      '<p class="err" data-err="terms"></p>' +
      '<p class="err" id="reg-error" role="alert" style="margin-top:12px"></p>' +
      '<button class="btn btn-lg btn-block" type="submit" id="reg-submit" style="margin-top:20px">Submit Volunteer Registration</button>' +
      '<p class="form-note">Your profile goes to the OSH team for Aadhaar verification. You can send interest for events in your city straight away.</p>' +
      '</form>';
    wire();
  }

  function wire() {
    var $ = function (id) { return document.getElementById(id); };
    var form = $('f-reg');
    var state = { phone: null, resendAt: 0, timer: null, reg: registration() };
    var INPUTS = { name: 'r-name', email: 'r-email', phone: 'r-phone', otp: 'r-otp', dateOfBirth: 'r-dob', city: 'r-city', aadhaarNumber: 'r-aadhaar', department: 'r-dept' };

    function fieldError(name, message) {
      var slot = form.querySelector('[data-err="' + name + '"]');
      if (INPUTS[name] && $(INPUTS[name])) $(INPUTS[name]).setAttribute('aria-invalid', message ? 'true' : 'false');
      if (slot) slot.textContent = message || '';
      return Boolean(slot);
    }
    function showVerified() {
      $('phone-row').hidden = true;
      $('otp-box').hidden = true;
      $('phone-ok').hidden = false;
      $('phone-ok-text').textContent = O.prettyPhone(state.reg.phone) + ' verified';
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
      var digits = O.tenDigits($('r-phone').value);
      if (!digits) return fieldError('phone', 'Enter a valid 10-digit Indian mobile number.');
      var done = O.busy(btn, 'Sending…');
      O.api('/auth/send-otp', { method: 'POST', body: { phone: digits } })
        .then(function (res) {
          done();
          state.phone = res.phone;
          state.resendAt = Date.now() + res.resendAfterSeconds * 1000;
          $('otp-box').hidden = false;
          $('otp-send').textContent = 'Resend';
          $('otp-note').innerHTML = res.devOtp
            ? '<b>Test mode:</b> SMS isn\'t switched on yet, so here is your code: <b>' + O.esc(res.devOtp) + '</b>'
            : 'We sent a 6-digit code to <b>' + O.esc(O.prettyPhone(res.phone)) + '</b>.';
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
    $('r-city').addEventListener('change', function () {
      var other = this.value === OTHER;
      $('r-city-other').hidden = !other;
      if (other) $('r-city-other').focus();
    });
    $('otp-verify').addEventListener('click', function () {
      var btn = this;
      fieldError('otp', '');
      var code = $('r-otp').value.trim();
      if (!/^\d{6}$/.test(code)) return fieldError('otp', 'Enter the 6-digit code.');
      var done = O.busy(btn, 'Checking…');
      O.api('/auth/verify-otp', { method: 'POST', body: { phone: state.phone, otp: code } })
        .then(function (res) {
          done();
          if (!res.isNewUser) {
            O.auth.signIn(res.token, res.volunteer);
            body.innerHTML = '<div class="notice ok" style="margin-top:16px"><b>Welcome back, ' + O.esc(res.volunteer.name.split(' ')[0]) + '!</b> This number already has a volunteer account. Taking you there…</div>';
            setTimeout(function () { location.href = eventId ? afterHref : '/profile'; }, 1200);
            return;
          }
          state.reg = { token: res.registrationToken, phone: state.phone, expires: Date.now() + res.expiresInSeconds * 1000 };
          setRegistration(state.reg);
          showVerified();
          O.toast('Mobile number verified');
        })
        .catch(function (err) { done(); fieldError('otp', err.message); });
    });

    form.addEventListener('submit', function (ev) {
      ev.preventDefault();
      Object.keys(INPUTS).concat(['terms']).forEach(function (n) { fieldError(n, ''); });
      $('reg-error').textContent = '';
      var city = $('r-city').value === OTHER ? $('r-city-other').value.trim() : $('r-city').value;
      var v = {
        name: $('r-name').value.trim(), email: $('r-email').value.trim(), dob: $('r-dob').value, city: city, dept: $('r-dept').value,
        aadhaar: $('r-aadhaar').value.replace(/\D/g, ''), terms: $('r-terms').checked,
      };
      var bad = [];
      function need(ok, field, msg) { if (!ok) { fieldError(field, msg); bad.push(field); } }
      need(v.name.length >= 2, 'name', 'Enter your full name.');
      need(Boolean(state.reg), 'phone', 'Verify your mobile number with the OTP first.');
      need(!v.email || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.email), 'email', 'Enter a valid email address, or leave it blank.');
      need(v.city.length >= 2, 'city', 'Choose the city you want to volunteer in.');
      need(Boolean(v.dept), 'department', 'Choose your skill or department.');
      need(Boolean(v.dob), 'dateOfBirth', 'Enter your date of birth.');
      if (v.dob) need(v.dob <= O.isoOf(maxDob), 'dateOfBirth', 'You need to be at least 18 to volunteer.');
      need(v.aadhaar.length === 12 && aadhaarValid(v.aadhaar), 'aadhaarNumber', v.aadhaar.length === 12 ? "This doesn't look like a valid Aadhaar number. Check for typos." : 'Enter all 12 digits of your Aadhaar number.');
      need(v.terms, 'terms', 'Please agree to continue.');
      if (bad.length) {
        var first = form.querySelector('[aria-invalid="true"]') || $('r-terms');
        if (first) first.focus();
        return;
      }
      var done = O.busy($('reg-submit'), 'Creating your profile…');
      var payload = {
        name: v.name, dateOfBirth: v.dob, city: v.city, aadhaarNumber: v.aadhaar,
        department: v.dept, experience: $('r-exp').value, availability: $('r-avail').value, skills: [v.dept],
      };
      if (v.email) payload.email = v.email;
      O.api('/auth/register', { method: 'POST', token: state.reg.token, body: payload })
        .then(function (res) {
          setRegistration(null);
          O.auth.signIn(res.token, res.volunteer);
          location.href = afterHref;
        })
        .catch(function (err) {
          done();
          if (err.status === 401) { resetPhone(); return fieldError('phone', 'Your phone verification expired. Verify your number again.'); }
          if (err.code === 'already_registered') { resetPhone(); return fieldError('phone', 'This number already has an account. Sign in instead.'); }
          var field = err.details && err.details.field;
          if (!(field && fieldError(field, err.message))) $('reg-error').textContent = err.message;
        });
    });
  }

  Promise.all([
    O.options(),
    eventId ? O.api('/events/' + encodeURIComponent(eventId)).then(function (r) { return r.event.title; }).catch(function () { return null; }) : null,
  ]).then(function (r) { build(r[0], r[1]); })
    .catch(function (err) { body.innerHTML = '<p class="notice bad" style="margin-top:16px">Couldn\'t load the form: ' + O.esc(err.message) + '</p>'; });
})();
