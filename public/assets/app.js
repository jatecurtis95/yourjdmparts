/**
 * Progressive enhancement only.
 *
 * Every page is complete and usable without this file. The request form in
 * particular submits one part with no JavaScript at all; this only lets you
 * add more of them without a round trip.
 *
 * Nothing here animates anything — motion in this system is 180ms colour and
 * opacity transitions in CSS, plus the ticker keyframe.
 */

(function () {
  'use strict';

  /* ── Repeatable part blocks ───────────────────────────────── */

  function partsList() {
    return document.querySelector('[data-parts-list]');
  }

  /**
   * Rewrite a block's field names and ids to a new index. Names look like
   * parts[0][description] and ids like part-0-description, so both are
   * reachable with the same index swap.
   */
  function renumber(block, index) {
    var html = block.innerHTML
      .replace(/parts\[\d+]/g, 'parts[' + index + ']')
      .replace(/part-\d+-/g, 'part-' + index + '-');
    block.innerHTML = html;

    var label = block.querySelector('[data-part-number]');
    if (label) label.textContent = String(index + 1);
  }

  function renumberAll() {
    var list = partsList();
    if (!list) return;
    var blocks = list.querySelectorAll('[data-part-block]');
    Array.prototype.forEach.call(blocks, function (block, i) {
      renumber(block, i);
    });
    updateAddButton(blocks.length);
  }

  function updateAddButton(count) {
    var form = document.querySelector('[data-request-form]');
    var button = document.querySelector('[data-add-part]');
    if (!form || !button) return;
    var max = parseInt(form.getAttribute('data-max-parts'), 10) || 8;
    button.disabled = count >= max;
  }

  function addPart() {
    var list = partsList();
    var template = document.querySelector('[data-part-template]');
    if (!list || !template) return;

    var form = document.querySelector('[data-request-form]');
    var max = parseInt(form && form.getAttribute('data-max-parts'), 10) || 8;
    var existing = list.querySelectorAll('[data-part-block]').length;
    if (existing >= max) return;

    var fragment = template.content.cloneNode(true);
    var block = fragment.querySelector('[data-part-block]');
    if (!block) return;

    list.appendChild(fragment);
    renumberAll();

    // Move focus to the new block so keyboard users are not stranded at the
    // bottom of the form wondering whether anything happened.
    var first = list.lastElementChild.querySelector('textarea, input, select');
    if (first) first.focus();
  }

  document.addEventListener('click', function (event) {
    if (event.target.closest('[data-add-part]')) {
      event.preventDefault();
      addPart();
      return;
    }

    var remove = event.target.closest('[data-remove-part]');
    if (remove) {
      event.preventDefault();
      var block = remove.closest('[data-part-block]');
      var list = partsList();
      if (!block || !list) return;
      if (list.querySelectorAll('[data-part-block]').length <= 1) return;
      block.remove();
      renumberAll();
    }
  });


  /* ── Three-step request form ──────────────────────────────────
     Progressive enhancement in the strict sense: the markup is one
     form with three fieldsets, so with no JavaScript you get the whole
     thing on one page and one submit — which is exactly what shipped
     before this. JavaScript panes it into steps. Because it stays a
     single form, file uploads and server validation are untouched. */

  function initSteps(form) {
    var steps = Array.prototype.slice.call(form.querySelectorAll('[data-step]'));
    if (steps.length < 2) return;

    var current = 0;

    // Progress indicator, built here so it never appears without JS.
    var progress = document.createElement('ol');
    progress.className = 'steps-progress';
    progress.setAttribute('aria-label', 'Progress');
    steps.forEach(function (step, i) {
      var li = document.createElement('li');
      li.className = 'steps-progress__step';
      li.innerHTML =
        '<span class="steps-progress__n">' + (i + 1) + '</span>' +
        '<span class="steps-progress__label">' + step.getAttribute('data-step-title') + '</span>';
      progress.appendChild(li);
    });
    form.insertBefore(progress, form.firstChild);

    // Navigation, one row per step.
    var navs = steps.map(function (step, i) {
      var nav = document.createElement('div');
      nav.className = 'step-nav';
      if (i > 0) {
        var back = document.createElement('button');
        back.type = 'button';
        back.className = 'btn btn--outline';
        back.textContent = 'Back';
        back.addEventListener('click', function () { go(i - 1); });
        nav.appendChild(back);
      }
      if (i < steps.length - 1) {
        var next = document.createElement('button');
        next.type = 'button';
        next.className = 'btn btn--bone';
        next.textContent = 'Next';
        next.addEventListener('click', function () { if (validate(i)) go(i + 1); });
        nav.appendChild(next);
      }
      step.appendChild(nav);
      return nav;
    });

    // The real submit lives on the last step only.
    var submitRow = form.querySelector('[data-submit-row]');
    if (submitRow) steps[steps.length - 1].appendChild(submitRow);

    /** Let the browser check this step's own required fields before moving on. */
    function validate(index) {
      var fields = steps[index].querySelectorAll('input, select, textarea');
      for (var i = 0; i < fields.length; i++) {
        var f = fields[i];
        if (f.willValidate && !f.checkValidity()) {
          f.reportValidity();
          return false;
        }
      }
      return true;
    }

    function go(index, options) {
      var moveFocus = !(options && options.initial);
      current = index;
      steps.forEach(function (step, i) { step.hidden = i !== index; });
      Array.prototype.forEach.call(progress.children, function (li, i) {
        li.setAttribute('data-state', i === index ? 'current' : i < index ? 'done' : 'todo');
        if (i === index) li.setAttribute('aria-current', 'step');
        else li.removeAttribute('aria-current');
      });
      // On the first render there is nothing to announce and nowhere to
      // move to — scrolling here would yank the visitor past the page
      // heading the moment the script loads.
      if (!moveFocus) return;

      var legend = steps[index].querySelector('legend');
      if (legend) {
        legend.setAttribute('tabindex', '-1');
        legend.focus({ preventScroll: true });
      }
      form.scrollIntoView({ block: 'start' });
    }

    // If the server sent back errors, open the step holding the first one
    // rather than dropping the visitor on step 1 with no idea what happened.
    var firstError = form.querySelector('[aria-invalid="true"], .field__error');
    var start = 0;
    if (firstError) {
      steps.forEach(function (step, i) { if (step.contains(firstError)) start = i; });
    }
    go(start, { initial: true });
  }

  /* ── Tabs ─────────────────────────────────────────────────── */

  function initTabs(root) {
    var tabs = Array.prototype.slice.call(root.querySelectorAll('[role="tab"]'));
    var panels = Array.prototype.slice.call(root.querySelectorAll('[role="tabpanel"]'));
    if (!tabs.length) return;

    function select(index) {
      tabs.forEach(function (tab, i) {
        tab.setAttribute('aria-selected', i === index ? 'true' : 'false');
        tab.setAttribute('tabindex', i === index ? '0' : '-1');
      });
      panels.forEach(function (panel, i) {
        panel.hidden = i !== index;
      });
    }

    tabs.forEach(function (tab, i) {
      tab.addEventListener('click', function () {
        select(i);
      });
      tab.addEventListener('keydown', function (event) {
        var next = null;
        if (event.key === 'ArrowRight') next = (i + 1) % tabs.length;
        if (event.key === 'ArrowLeft') next = (i - 1 + tabs.length) % tabs.length;
        if (event.key === 'Home') next = 0;
        if (event.key === 'End') next = tabs.length - 1;
        if (next === null) return;
        event.preventDefault();
        select(next);
        tabs[next].focus();
      });
    });

    // Panels are all visible until now, which keeps them readable with no JS.
    select(0);
  }

  /* ── Dialog ───────────────────────────────────────────────── */

  document.addEventListener('click', function (event) {
    var opener = event.target.closest('[data-dialog-open]');
    if (opener) {
      var dialog = document.getElementById(opener.getAttribute('data-dialog-open'));
      if (dialog && typeof dialog.showModal === 'function') {
        event.preventDefault();
        dialog.showModal();
      }
      return;
    }

    var closer = event.target.closest('[data-dialog-close]');
    if (closer) {
      var open = closer.closest('dialog');
      if (open) {
        event.preventDefault();
        open.close();
      }
    }
  });

  /* ── Navigation and facets ────────────────────────────────── */

  document.addEventListener('click', function (event) {
    var toggle = event.target.closest('[data-nav-toggle]');
    if (toggle) {
      event.preventDefault();
      var nav = document.getElementById('primary-nav');
      if (!nav) return;
      var open = nav.getAttribute('data-open') === 'true';
      nav.setAttribute('data-open', open ? 'false' : 'true');
      toggle.setAttribute('aria-expanded', open ? 'false' : 'true');
      return;
    }

    var facetToggle = event.target.closest('[data-facets-toggle]');
    if (facetToggle) {
      var facets = document.getElementById('facets');
      if (!facets) return;
      var shown = facets.getAttribute('data-open') === 'true';
      facets.setAttribute('data-open', shown ? 'false' : 'true');
      facetToggle.setAttribute('aria-expanded', shown ? 'false' : 'true');
    }
  });

  /* ── Boot ─────────────────────────────────────────────────── */

  function boot() {
    document.querySelectorAll('[data-tabs]').forEach(initTabs);
    document.querySelectorAll('[data-request-form]').forEach(initSteps);
    var list = partsList();
    if (list) updateAddButton(list.querySelectorAll('[data-part-block]').length);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
