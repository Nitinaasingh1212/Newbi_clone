// Vendor Registration: company, contact, mobile, city, category, optional GST and services.
// New vendors start as "pending" until the OSH team verifies them.
(function () {
  'use strict';
  var O = window.OSH;
  var root = document.getElementById('vendor-body');
  var OTHER = 'Other city…';
  var GSTIN = /^\d{2}[A-Z]{5}\d{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/;

  function form(opts) {
    root.innerHTML =
      '<form id="f-vendor" novalidate>' +
      '<p class="hint">Fields marked <span class="req">*</span> are required.</p>' +
      '<div class="grid-2"><div class="field"><label for="v-company">Company / Vendor name <span class="req">*</span></label><input class="input" id="v-company" autocomplete="organization" placeholder="Business name" maxlength="100"><p class="err" data-err="companyName"></p></div>' +
      '<div class="field"><label for="v-contact">Contact person <span class="req">*</span></label><input class="input" id="v-contact" autocomplete="name" placeholder="Contact person" maxlength="80"><p class="err" data-err="contactPerson"></p></div></div>' +
      '<div class="grid-2"><div class="field"><label for="v-phone">Mobile number <span class="req">*</span></label><div class="input-row"><span class="input-prefix">+91</span><input class="input" id="v-phone" type="tel" inputmode="numeric" autocomplete="tel-national" placeholder="10-digit mobile" maxlength="14"></div><p class="err" data-err="phone"></p></div>' +
      '<div class="field"><label for="v-city">City <span class="req">*</span></label><select class="input" id="v-city">' + O.selectOptions(opts.networkCities.concat([OTHER]), 'Select city') + '</select>' +
      '<input class="input" id="v-city-other" placeholder="Type your city" maxlength="60" hidden style="margin-top:8px" aria-label="Your city"><p class="err" data-err="city"></p></div></div>' +
      '<div class="grid-2"><div class="field"><label for="v-cat">Vendor category <span class="req">*</span></label><select class="input" id="v-cat">' + O.selectOptions(opts.vendorCategories, 'Select category') + '</select><p class="err" data-err="category"></p></div>' +
      '<div class="field"><label for="v-gst">GST number <span class="optional">(optional)</span></label><input class="input" id="v-gst" placeholder="GSTIN" maxlength="18" autocapitalize="characters" style="text-transform:uppercase"><p class="err" data-err="gstin"></p></div></div>' +
      '<div class="field"><label for="v-services">Services / portfolio details</label><textarea class="input" id="v-services" maxlength="1500" placeholder="Describe your services, equipment, experience and portfolio link"></textarea></div>' +
      '<p class="err" id="v-error" role="alert" style="margin-top:12px"></p>' +
      '<button class="btn btn-lg btn-block" type="submit" id="v-submit" style="margin-top:18px">Register as Vendor</button>' +
      '<p class="form-note">Vendor applications require verification by OSH Entertainment before appearing as verified partners.</p></form>';

    var $ = function (id) { return document.getElementById(id); };
    var f = $('f-vendor');
    var INPUTS = { companyName: 'v-company', contactPerson: 'v-contact', phone: 'v-phone', city: 'v-city', category: 'v-cat', gstin: 'v-gst' };
    function fieldError(name, msg) {
      var slot = f.querySelector('[data-err="' + name + '"]');
      if (INPUTS[name]) $(INPUTS[name]).setAttribute('aria-invalid', msg ? 'true' : 'false');
      if (slot) slot.textContent = msg || '';
      return Boolean(slot);
    }
    $('v-city').addEventListener('change', function () {
      $('v-city-other').hidden = this.value !== OTHER;
      if (this.value === OTHER) $('v-city-other').focus();
    });
    f.addEventListener('submit', function (ev) {
      ev.preventDefault();
      Object.keys(INPUTS).forEach(function (k) { fieldError(k, ''); });
      $('v-error').textContent = '';
      var v = {
        companyName: $('v-company').value.trim(), contactPerson: $('v-contact').value.trim(), phone: O.tenDigits($('v-phone').value),
        city: $('v-city').value === OTHER ? $('v-city-other').value.trim() : $('v-city').value, category: $('v-cat').value,
        gstin: $('v-gst').value.replace(/\s/g, '').toUpperCase(), services: $('v-services').value.trim(),
      };
      var bad = [];
      function need(ok, field, msg) { if (!ok) { fieldError(field, msg); bad.push(field); } }
      need(v.companyName.length >= 2, 'companyName', 'Enter your company or business name.');
      need(v.contactPerson.length >= 2, 'contactPerson', "Enter the contact person's name.");
      need(Boolean(v.phone), 'phone', 'Enter a valid 10-digit Indian mobile number.');
      need(v.city.length >= 2, 'city', 'Choose your city.');
      need(Boolean(v.category), 'category', 'Choose a vendor category.');
      need(!v.gstin || GSTIN.test(v.gstin), 'gstin', 'Check the GST number (15 characters, like 09AAACH7409R1ZZ), or leave it blank.');
      if (bad.length) { var first = f.querySelector('[aria-invalid="true"]'); if (first) first.focus(); return; }
      var body = { companyName: v.companyName, contactPerson: v.contactPerson, phone: v.phone, city: v.city, category: v.category };
      if (v.gstin) body.gstin = v.gstin;
      if (v.services) body.services = v.services;
      var done = O.busy($('v-submit'), 'Registering…');
      O.api('/vendors', { method: 'POST', body: body })
        .then(function (res) { success(res.vendor, opts); })
        .catch(function (err) {
          done();
          var field = err.details && err.details.field;
          if (err.code === 'vendor_exists') field = 'phone';
          if (!(field && fieldError(field, err.message))) $('v-error').textContent = err.message;
        });
    });
  }

  function success(vendor, opts) {
    root.innerHTML = '<div class="success"><span class="success-mark">' + O.icon('check', 30) + '</span>' +
      '<h2>Registration received</h2>' +
      '<p class="muted">Thank you. <b>' + O.esc(vendor.companyName) + '</b> is registered as a <b>' + O.esc(vendor.category) + '</b> vendor in <b>' + O.esc(vendor.city) + '</b>. The OSH team will verify your details and call you.</p>' +
      '<p>Reference: <span class="ref">' + O.esc(vendor.id) + '</span> · <span class="badge warn">Pending verification</span></p>' +
      '<p style="display:flex;flex-wrap:wrap;gap:10px;margin-top:8px"><a class="btn" href="/">Back to home</a><button class="btn btn-ghost" type="button" id="again">Register another vendor</button></p></div>';
    document.getElementById('again').addEventListener('click', function () { form(opts); });
    root.scrollIntoView({ block: 'start' });
  }

  O.options().then(form).catch(function (err) {
    root.innerHTML = '<p class="notice bad">Couldn\'t load the form: ' + O.esc(err.message) + '</p>';
  });
})();
