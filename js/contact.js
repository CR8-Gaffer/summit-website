/* ============================================================
   Summit — contact form submission.
   Progressive: posts via fetch to a no-code endpoint (Formspree /
   Getform / Netlify all accept this shape). Shows an inline
   confirmation without leaving the page. Falls back cleanly when
   the endpoint hasn't been connected yet.

   FORM_ENDPOINT is set at launch to the form provider's POST URL
   (Formspree / Getform / Netlify all accept this shape). Until then the
   form offers a mailto fallback to CONTACT_EMAIL.
   ============================================================ */
(function () {
  'use strict';

  var FORM_ENDPOINT = 'https://formspree.io/f/mqpejkdd';                          // set at launch
  var CONTACT_EMAIL = 'enquiries@summitam.au';
  var CONTACT_PHONE = '0411 854 283';
  var CONTACT_TEL   = '+61411854283';

  var form = document.getElementById('enquiry');
  if (!form) return;

  // referrers.html links here with ?enquiry=referrer — preselect the referrer enquiry type
  try {
    var want = new URLSearchParams(location.search).get('enquiry');
    var typeSel = form.querySelector('select[name="enquiry"]');
    if (want && typeSel) {
      for (var i = 0; i < typeSel.options.length; i++) {
        if (typeSel.options[i].value.toLowerCase().indexOf(want.toLowerCase()) === 0) { typeSel.selectedIndex = i; break; }
      }
    }
  } catch (e) {}

  var card   = form.closest('.form-card') || form.parentNode;
  var status = form.querySelector('.form-status');
  var doneEl = card.querySelector('.form-done');
  var btn    = form.querySelector('button[type="submit"]');
  var btnTxt = btn ? btn.querySelector('.txt') : null;

  // ---- Where did this enquiry come from?  No cookies, no analytics: the tag rides on the link.
  // A link such as site-survey.html?src=gbp is carried to this page by js/site.js; here it is posted with the
  // enquiry so the register row can be tagged inbound_gbp / referral_partner:<name> / outreach_cold / inbound_web.
  function param(name) { try { return new URLSearchParams(location.search).get(name) || ''; } catch (e) { return ''; } }
  function clean(v) { return String(v || '').toLowerCase().replace(/[^a-z0-9_-]/g, '').slice(0, 40); }
  function sourceTag() {
    var s = clean(param('src'));
    if (s === 'gbp') return 'inbound_gbp';
    if (s === 'out') return 'outreach_cold';
    if (s.indexOf('ref-') === 0 && s.length > 4) return 'referral_partner:' + s.slice(4);
    return 'inbound_web';
  }
  function addHidden(name, value) {
    var i = document.createElement('input'); i.type = 'hidden'; i.name = name; i.value = value; form.appendChild(i);
  }
  var tag = sourceTag();
  addHidden('src_tag', tag);
  ['utm_source', 'utm_medium', 'utm_campaign'].forEach(function (k) { var v = clean(param(k)); if (v) addHidden(k, v); });
  try {
    var ref = document.referrer ? new URL(document.referrer) : null;
    if (ref) addHidden('came_from', ref.host === location.host ? ref.pathname : ref.host);
  } catch (e) {}

  var reduced = document.documentElement.classList.contains('reduced') ||
                (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);

  function showError(html) {
    if (!status) return;
    status.className = 'form-status err show';
    status.innerHTML = html;
    status.scrollIntoView({ block: 'nearest', behavior: reduced ? 'auto' : 'smooth' });
  }

  // ---- inline field errors: a message under the field, aria-invalid, aria-describedby, focus the first
  var MESSAGES = {
    name: 'Enter your name.',
    business: 'Enter the business or venue name.',
    email: 'Enter an email address, like you@business.com.au.',
    state: 'Choose your state or territory.'
  };
  function fieldMessage(el) {
    if (el.validity.valueMissing) return MESSAGES[el.name] || 'This field is required.';
    if (el.validity.typeMismatch && el.type === 'email') return MESSAGES.email;
    return el.validationMessage || 'Check this field.';
  }
  function setFieldError(el, msg) {
    var id = 'err-' + el.id, box = document.getElementById(id);
    if (msg) {
      if (!box) { box = document.createElement('p'); box.className = 'field-err'; box.id = id; el.insertAdjacentElement('afterend', box); }
      box.textContent = msg;
      el.setAttribute('aria-invalid', 'true');
      var d = (el.getAttribute('aria-describedby') || '').split(' ').filter(function (x) { return x && x !== id; });
      d.push(id); el.setAttribute('aria-describedby', d.join(' '));
    } else {
      if (box) box.remove();
      el.removeAttribute('aria-invalid');
      var rest = (el.getAttribute('aria-describedby') || '').split(' ').filter(function (x) { return x && x !== id; });
      if (rest.length) el.setAttribute('aria-describedby', rest.join(' ')); else el.removeAttribute('aria-describedby');
    }
  }
  function validate() {
    var first = null;
    Array.prototype.forEach.call(form.querySelectorAll('input[id], select[id], textarea[id]'), function (el) {
      if (el.type === 'hidden' || el.closest('.hp')) return;
      if (el.checkValidity()) { setFieldError(el, ''); return; }
      setFieldError(el, fieldMessage(el));
      if (!first) first = el;
    });
    if (first) first.focus();
    return !first;
  }
  form.addEventListener('input', function (e) { var el = e.target; dirty = true; if (el.getAttribute('aria-invalid') === 'true' && el.checkValidity()) setFieldError(el, ''); });
  form.addEventListener('change', function (e) { var el = e.target; if (el.getAttribute('aria-invalid') === 'true' && el.checkValidity()) setFieldError(el, ''); });

  // ---- a typed message is not lost by an accidental click away
  var dirty = false, sent = false;
  addEventListener('beforeunload', function (e) { if (dirty && !sent) { e.preventDefault(); e.returnValue = ''; } });
  function clearError() { if (status) status.className = 'form-status'; }

  function succeed() {
    sent = true;
    form.classList.add('sent');
    if (doneEl) {
      doneEl.classList.add('show');
      var h = doneEl.querySelector('h2');                // focus moves to the confirmation, so it is announced
      if (h) { h.setAttribute('tabindex', '-1'); h.focus(); }
    }
  }

  function mailtoFallback() {
    // Compose an email from the field values as a last resort.
    var d = new FormData(form);
    var lines = [];
    d.forEach(function (v, k) {
      if (k.charAt(0) === '_' || k === 'company_url' || !String(v).trim()) return;
      lines.push(k.replace(/_/g, ' ').replace(/\b\w/g, function (c) { return c.toUpperCase(); }) + ': ' + v);
    });
    var subject = (d.get('enquiry') || 'Enquiry') + ' — ' + (d.get('business') || 'Website');
    return 'mailto:' + CONTACT_EMAIL + '?subject=' + encodeURIComponent(subject) +
           '&body=' + encodeURIComponent(lines.join('\n'));
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    clearError();

    // honeypot: real people leave it empty
    if (form.company_url && form.company_url.value) { succeed(); return; }

    if (!validate()) return;

    // Endpoint not wired yet → offer the email fallback rather than posting nowhere.
    if (!FORM_ENDPOINT) {
      showError('This form isn’t connected to an inbox yet. Please call <a href="tel:' + CONTACT_TEL + '">' + CONTACT_PHONE + '</a> or email ' +
                '<a href="' + mailtoFallback() + '">' + CONTACT_EMAIL + '</a> and we’ll be straight back to you.');
      return;
    }

    if (btn) { btn.disabled = true; btn.classList.add('sending'); if (btnTxt) btnTxt.textContent = 'Sending…'; }
    var subj = form.querySelector('input[name="_subject"]');   // the subject line tells the inbox where it came from
    if (subj) subj.value = (form.enquiry && form.enquiry.value ? form.enquiry.value : 'Enquiry') + ' — ' + (form.business && form.business.value ? form.business.value : 'website') + ' [' + tag + (form.state && form.state.value ? ' | ' + form.state.value : '') + ']';

    fetch(FORM_ENDPOINT, {
      method: 'POST',
      body: new FormData(form),
      headers: { 'Accept': 'application/json' }
    }).then(function (r) {
      if (r.ok) { succeed(); return; }
      return r.json().then(function (j) {
        var msg = (j && j.errors && j.errors.map(function (x) { return x.message; }).join(', ')) || 'Something went wrong.';
        throw new Error(msg);
      });
    }).catch(function () {
      showError('We couldn’t send that just now. Please call <a href="tel:' + CONTACT_TEL + '">' + CONTACT_PHONE + '</a>, email ' +
                '<a href="' + mailtoFallback() + '">' + CONTACT_EMAIL + '</a> or try again in a moment.');
    }).finally(function () {
      if (btn) { btn.disabled = false; btn.classList.remove('sending'); if (btnTxt) btnTxt.textContent = 'Send enquiry'; }
    });
  });
})();
