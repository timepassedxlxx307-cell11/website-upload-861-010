(function () {
  var toggle = document.querySelector('[data-mobile-toggle]');
  var nav = document.querySelector('[data-mobile-nav]');
  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      nav.classList.toggle('open');
    });
  }

  document.querySelectorAll('[data-header-search]').forEach(function (form) {
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var input = form.querySelector('input');
      var query = input ? input.value.trim() : '';
      var target = './search.html';
      if (query) {
        target += '?q=' + encodeURIComponent(query);
      }
      window.location.href = target;
    });
  });

  var hero = document.querySelector('[data-hero]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
    var index = 0;
    var activate = function (next) {
      index = next;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === index);
      });
    };
    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        activate(i);
      });
    });
    if (slides.length > 1) {
      setInterval(function () {
        activate((index + 1) % slides.length);
      }, 5200);
    }
  }

  var filterRoot = document.querySelector('[data-filter-root]');
  if (filterRoot) {
    var keyword = filterRoot.querySelector('[data-filter-keyword]');
    var region = filterRoot.querySelector('[data-filter-region]');
    var year = filterRoot.querySelector('[data-filter-year]');
    var genre = filterRoot.querySelector('[data-filter-genre]');
    var cards = Array.prototype.slice.call(filterRoot.querySelectorAll('[data-movie-card]'));
    var empty = filterRoot.querySelector('[data-empty-result]');
    var apply = function () {
      var k = keyword ? keyword.value.trim().toLowerCase() : '';
      var r = region ? region.value : '';
      var y = year ? year.value : '';
      var g = genre ? genre.value : '';
      var shown = 0;
      cards.forEach(function (card) {
        var haystack = (card.getAttribute('data-title') + ' ' + card.getAttribute('data-genre') + ' ' + card.getAttribute('data-tags')).toLowerCase();
        var ok = true;
        if (k && haystack.indexOf(k) === -1) ok = false;
        if (r && card.getAttribute('data-region') !== r) ok = false;
        if (y && card.getAttribute('data-year') !== y) ok = false;
        if (g && card.getAttribute('data-genre').indexOf(g) === -1 && card.getAttribute('data-tags').indexOf(g) === -1) ok = false;
        card.style.display = ok ? '' : 'none';
        if (ok) shown += 1;
      });
      if (empty) {
        empty.style.display = shown ? 'none' : 'block';
      }
    };
    [keyword, region, year, genre].forEach(function (control) {
      if (control) {
        control.addEventListener(control.tagName === 'INPUT' ? 'input' : 'change', apply);
      }
    });
    apply();
  }
})();

function initializeMoviePlayer(videoId, buttonId, overlayId, source) {
  var video = document.getElementById(videoId);
  var button = document.getElementById(buttonId);
  var overlay = document.getElementById(overlayId);
  if (!video || !button || !overlay || !source) {
    return;
  }

  var loaded = false;
  var playerHls = null;

  var attach = function () {
    if (loaded) {
      return;
    }
    loaded = true;
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
    } else if (window.Hls && window.Hls.isSupported()) {
      playerHls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      playerHls.loadSource(source);
      playerHls.attachMedia(video);
    } else {
      video.src = source;
    }
  };

  var play = function () {
    attach();
    overlay.classList.add('is-hidden');
    video.controls = true;
    var promise = video.play();
    if (promise && typeof promise.catch === 'function') {
      promise.catch(function () {
        overlay.classList.remove('is-hidden');
      });
    }
  };

  button.addEventListener('click', function (event) {
    event.preventDefault();
    event.stopPropagation();
    play();
  });

  overlay.addEventListener('click', function () {
    play();
  });

  video.addEventListener('click', function () {
    if (video.paused) {
      play();
    }
  });

  window.addEventListener('pagehide', function () {
    if (playerHls) {
      playerHls.destroy();
    }
  });
}

(function () {
  var root = document.querySelector('[data-search-page]');
  if (!root || !window.SEARCH_MOVIES) {
    return;
  }

  var inputs = Array.prototype.slice.call(root.querySelectorAll('[data-search-input]'));
  var region = root.querySelector('[data-search-region]');
  var year = root.querySelector('[data-search-year]');
  var type = root.querySelector('[data-search-type]');
  var results = root.querySelector('[data-search-results]');
  var params = new URLSearchParams(window.location.search);
  var initial = params.get('q') || '';

  inputs.forEach(function (item) {
    item.value = initial;
  });

  var render = function () {
    var input = inputs[0];
    var q = input ? input.value.trim().toLowerCase() : '';
    var r = region ? region.value : '';
    var y = year ? year.value : '';
    var t = type ? type.value : '';
    var matches = window.SEARCH_MOVIES.filter(function (movie) {
      var haystack = (movie.title + ' ' + movie.genre + ' ' + movie.region + ' ' + movie.tags + ' ' + movie.oneLine).toLowerCase();
      if (q && haystack.indexOf(q) === -1) return false;
      if (r && movie.region !== r) return false;
      if (y && movie.year !== y) return false;
      if (t && movie.type !== t) return false;
      return true;
    }).slice(0, 120);

    if (!matches.length) {
      results.innerHTML = '<div class="empty-result">暂未找到匹配内容</div>';
      return;
    }

    results.innerHTML = matches.map(function (movie) {
      return '<article class="search-card">' +
        '<a href="' + movie.url + '"><img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '"></a>' +
        '<div>' +
        '<div class="card-meta"><span class="tag">' + escapeHtml(movie.genre) + '</span><span class="meta-pill">' + escapeHtml(movie.region) + '</span><span class="meta-pill">' + escapeHtml(movie.year) + '</span></div>' +
        '<h2><a href="' + movie.url + '">' + escapeHtml(movie.title) + '</a></h2>' +
        '<p>' + escapeHtml(movie.oneLine) + '</p>' +
        '<p><a class="btn btn-secondary" href="' + movie.url + '">进入播放页</a></p>' +
        '</div>' +
        '</article>';
    }).join('');
  };

  var escapeHtml = function (value) {
    return String(value).replace(/[&<>"']/g, function (char) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
      }[char];
    });
  };

  inputs.forEach(function (control) {
    control.addEventListener('input', function () {
      var value = control.value;
      inputs.forEach(function (item) {
        if (item !== control) {
          item.value = value;
        }
      });
      render();
    });
  });

  [region, year, type].forEach(function (control) {
    if (control) {
      control.addEventListener('change', render);
    }
  });

  render();
})();
