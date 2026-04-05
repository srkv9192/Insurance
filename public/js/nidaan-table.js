/* nidaan-table.js — safe visual only, no DataTable conflicts */
(function () {
  'use strict';
  document.addEventListener('DOMContentLoaded', function () {
    var page = window.location.pathname.split('/').pop() || '';
    if (!page) return;
    document.querySelectorAll('.dashboard-nav-dropdown-item').forEach(function (a) {
      var href = (a.getAttribute('href') || '').replace(/^\//, '');
      if (href && href === page) {
        a.style.fontWeight = '700';
        a.style.backgroundColor = 'rgba(255,255,255,0.08)';
        a.style.borderRadius = '6px';
      }
    });
  });
})();
