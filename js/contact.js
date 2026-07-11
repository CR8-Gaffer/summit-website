/* ============================================================
   Summit — contact form submission.
   Progressive: posts via fetch to a no-code endpoint (Formspree /
   Getform / Netlify all accept this shape). Shows an inline
   confirmation without leaving the page. Falls back cleanly when
   the endpoint hasn't been connected yet.

   >>> TO GO LIVE: set FORM_ENDPOINT to your form's POST URL, e.g.
       https://formspree.io/f/xxxxxxx   (free, ~2 min to create)
   and set CONTACT_EMAIL to the inbox that should receive enquiries.
   ============================================================ */
(function () {
  'use strict';

  var FORM_ENDPOINT = '';                         // TODO: paste your Formspree/Getform/Netlify endpoint
  var CONTACT_EMAIL = 'enquiries@summitam.com.au'; // TODO: confirm the real enquiries inbox

  var form = document.getElementById('enquiry');
  if (!form) return;

  var card   = form.closest('.form-card') || form.parentNode;
  var status = form.querySelector('.form-status');
  var doneEl = card.querySelector('.form-done');
  var btn    = form.querySelector('button[type="submit"]');
  var btnTxt = btn ? btn.querySelector('.txt') : null;

  function showError(html) {
    if (!status) return;
    status.className = 'form-status err show';
    status.innerHTML = html;
    status.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }
  function clearError() { if (status) status.className = 'form-status'; }

  function succeed() {
    form.classList.add('sent');
    if (doneEl) doneEl.classList.add('show');
  }

  function mailtoFallback() {
    // Compose an email from the field values as a last resort.
    var d = new FormData(form);
    var lines = [];
    d.forEach(function (v, k) {
      if (k.charAt(0) === '_' || k === 'company_url' || !String(v).trim()) return;
      lines.push(k.replace(/_/g, ' ').replace(/\b\w/g, function (c) { return c.toUpperCase(); }) + ': ' + v);
    });
    var subject = 'Compliance enquiry — ' + (d.get('business') || 'Website');
    return 'mailto:' + CONTACT_EMAIL + '?subject=' + encodeURIComponent(subject) +
           '&body=' + encodeURIComponent(lines.join('\n'));
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    clearError();

    // honeypot: real people leave it empty
    if (form.company_url && form.company_url.value) { succeed(); return; }

    if (!form.checkValidity()) { form.reportValidity(); return; }

    // Endpoint not wired yet → offer the email fallback rather than posting nowhere.
    if (!FORM_ENDPOINT) {
      showError('This form isn’t connected to an inbox yet. Please email us at ' +
                '<a href="' + mailtoFallback() + '">' + CONTACT_EMAIL + '</a> and we’ll be straight back to you.');
      return;
    }

    if (btn) { btn.disabled = true; if (btnTxt) btnTxt.textContent = 'Sending…'; }

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
      showError('We couldn’t send that just now. Please email ' +
                '<a href="' + mailtoFallback() + '">' + CONTACT_EMAIL + '</a> or try again in a moment.');
    }).finally(function () {
      if (btn) { btn.disabled = false; if (btnTxt) btnTxt.textContent = 'Send enquiry'; }
    });
  });
})();
