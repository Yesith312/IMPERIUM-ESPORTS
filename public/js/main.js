(function () {
  var burger = document.querySelector('[data-burger]');
  var nav = document.querySelector('[data-nav]');
  if (burger && nav) {
    burger.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  var banner = document.querySelector('[data-cookie]');
  var KEY = 'imperium_cookies';
  function read() {
    try { return JSON.parse(localStorage.getItem(KEY)); } catch (e) { return null; }
  }
  function save(v) {
    try { localStorage.setItem(KEY, JSON.stringify(v)); } catch (e) {}
    banner.hidden = true;
  }
  if (banner) {
    if (!read()) banner.hidden = false;
    banner.querySelector('[data-accept]').addEventListener('click', function () { save({ preferences: true, analytics: true }); });
    banner.querySelector('[data-reject]').addEventListener('click', function () { save({ preferences: false, analytics: false }); });
    banner.querySelector('[data-save]').addEventListener('click', function () {
      save({
        preferences: banner.querySelector('[data-pref=preferences]').checked,
        analytics: banner.querySelector('[data-pref=analytics]').checked
      });
    });
    document.addEventListener('click', function (e) {
      if (e.target.closest('[data-cookie-settings]')) banner.hidden = false;
    });
  }

  var splash = document.querySelector('[data-splash]');
  if (splash) {
    var seen = false;
    try { seen = sessionStorage.getItem('imperium_splash') === '1'; } catch (e) {}
    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!seen && !reduce) {
      splash.hidden = false;
      var close = function () {
        splash.classList.add('done');
        try { sessionStorage.setItem('imperium_splash', '1'); } catch (e) {}
        setTimeout(function () { splash.hidden = true; }, 700);
      };
      splash.querySelector('[data-skip]').addEventListener('click', close);
      setTimeout(close, 2400);
    }
  }

  document.querySelectorAll('[data-confirm]').forEach(function (f) {
    f.addEventListener('submit', function (e) {
      if (!window.confirm(f.getAttribute('data-confirm'))) e.preventDefault();
    });
  });

  document.querySelectorAll('[data-share]').forEach(function (b) {
    b.addEventListener('click', function () {
      var data = { title: b.getAttribute('data-title'), url: location.href };
      if (navigator.share) { navigator.share(data).catch(function () {}); return; }
      if (navigator.clipboard) navigator.clipboard.writeText(location.href).then(function () { b.textContent = 'Enlace copiado'; });
    });
  });
})();
