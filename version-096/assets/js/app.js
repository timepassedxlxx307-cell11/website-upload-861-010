(function () {
  function ready(fn) {
    if (document.readyState !== 'loading') {
      fn();
    } else {
      document.addEventListener('DOMContentLoaded', fn);
    }
  }

  function setupMenu() {
    var toggle = document.querySelector('[data-menu-toggle]');
    var menu = document.querySelector('[data-mobile-menu]');
    if (!toggle || !menu) {
      return;
    }
    toggle.addEventListener('click', function () {
      menu.classList.toggle('is-open');
      toggle.textContent = menu.classList.contains('is-open') ? '×' : '☰';
    });
  }

  function setupHero() {
    var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
    if (!slides.length) {
      return;
    }
    var current = 0;
    var timer = null;
    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === current);
      });
    }
    function start() {
      stop();
      timer = setInterval(function () {
        show(current + 1);
      }, 5200);
    }
    function stop() {
      if (timer) {
        clearInterval(timer);
        timer = null;
      }
    }
    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
        start();
      });
    });
    var hero = document.querySelector('.hero-carousel');
    if (hero) {
      hero.addEventListener('mouseenter', stop);
      hero.addEventListener('mouseleave', start);
    }
    show(0);
    start();
  }

  function norm(value) {
    return (value || '').toString().trim().toLowerCase();
  }

  function setupSearch() {
    var grid = document.querySelector('[data-search-grid]');
    if (!grid) {
      return;
    }
    var cards = Array.prototype.slice.call(grid.querySelectorAll('.catalog-card'));
    var q = document.getElementById('searchInput');
    var channel = document.getElementById('filterChannel');
    var region = document.getElementById('filterRegion');
    var year = document.getElementById('filterYear');
    var clear = document.getElementById('clearFilters');
    var empty = document.getElementById('emptyState');
    var params = new URLSearchParams(window.location.search);
    if (q && params.get('q')) {
      q.value = params.get('q');
    }
    function apply() {
      var keyword = norm(q && q.value);
      var channelValue = norm(channel && channel.value);
      var regionValue = norm(region && region.value);
      var yearValue = norm(year && year.value);
      var visible = 0;
      cards.forEach(function (card) {
        var text = norm(card.dataset.title + ' ' + card.dataset.summary + ' ' + card.dataset.tags + ' ' + card.dataset.genre);
        var ok = true;
        if (keyword && text.indexOf(keyword) === -1) {
          ok = false;
        }
        if (channelValue && norm(card.dataset.channel) !== channelValue) {
          ok = false;
        }
        if (regionValue && norm(card.dataset.region) !== regionValue) {
          ok = false;
        }
        if (yearValue && norm(card.dataset.year) !== yearValue) {
          ok = false;
        }
        card.classList.toggle('is-filtered-out', !ok);
        if (ok) {
          visible += 1;
        }
      });
      if (empty) {
        empty.hidden = visible !== 0;
      }
    }
    [q, channel, region, year].forEach(function (node) {
      if (node) {
        node.addEventListener(node.tagName === 'INPUT' ? 'input' : 'change', apply);
      }
    });
    if (clear) {
      clear.addEventListener('click', function () {
        if (q) {
          q.value = '';
        }
        if (channel) {
          channel.value = '';
        }
        if (region) {
          region.value = '';
        }
        if (year) {
          year.value = '';
        }
        apply();
      });
    }
    apply();
  }

  window.setupMoviePlayer = function (streamUrl) {
    var video = document.getElementById('moviePlayer');
    var overlay = document.getElementById('playOverlay');
    if (!video || !streamUrl) {
      return;
    }
    var loaded = false;
    var hls = null;
    function begin() {
      if (!loaded) {
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = streamUrl;
        } else if (window.Hls && window.Hls.isSupported()) {
          hls = new Hls({ enableWorker: true, lowLatencyMode: true });
          hls.loadSource(streamUrl);
          hls.attachMedia(video);
          hls.on(Hls.Events.MANIFEST_PARSED, function () {
            video.play().catch(function () {});
          });
        } else {
          video.src = streamUrl;
        }
        loaded = true;
      }
      if (overlay) {
        overlay.classList.add('is-hidden');
      }
      video.play().catch(function () {});
    }
    if (overlay) {
      overlay.addEventListener('click', begin);
    }
    video.addEventListener('click', function () {
      if (video.paused) {
        begin();
      } else {
        video.pause();
      }
    });
    video.addEventListener('play', function () {
      if (overlay) {
        overlay.classList.add('is-hidden');
      }
    });
    video.addEventListener('pause', function () {
      if (overlay && video.currentTime === 0) {
        overlay.classList.remove('is-hidden');
      }
    });
    window.addEventListener('pagehide', function () {
      if (hls) {
        hls.destroy();
      }
    });
  };

  ready(function () {
    setupMenu();
    setupHero();
    setupSearch();
  });
})();
