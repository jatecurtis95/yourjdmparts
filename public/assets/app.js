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
    var list = partsList();
    if (list) updateAddButton(list.querySelectorAll('[data-part-block]').length);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
