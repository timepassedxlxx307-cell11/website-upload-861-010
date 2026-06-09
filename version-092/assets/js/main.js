(function () {
  function ready(callback) {
    if (document.readyState !== 'loading') {
      callback();
      return;
    }

    document.addEventListener('DOMContentLoaded', callback);
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  ready(function () {
    var toggle = document.querySelector('[data-mobile-toggle]');
    var nav = document.querySelector('[data-site-nav]');

    if (toggle && nav) {
      toggle.addEventListener('click', function () {
        nav.classList.toggle('is-open');
      });
    }

    var hero = document.querySelector('[data-hero]');

    if (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
      var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
      var previous = hero.querySelector('[data-hero-prev]');
      var next = hero.querySelector('[data-hero-next]');
      var current = 0;
      var timer = null;

      function showSlide(index) {
        if (!slides.length) {
          return;
        }

        current = (index + slides.length) % slides.length;

        slides.forEach(function (slide, slideIndex) {
          slide.classList.toggle('is-active', slideIndex === current);
        });

        dots.forEach(function (dot, dotIndex) {
          dot.classList.toggle('is-active', dotIndex === current);
        });
      }

      function restart() {
        if (timer) {
          window.clearInterval(timer);
        }

        timer = window.setInterval(function () {
          showSlide(current + 1);
        }, 5000);
      }

      if (previous) {
        previous.addEventListener('click', function () {
          showSlide(current - 1);
          restart();
        });
      }

      if (next) {
        next.addEventListener('click', function () {
          showSlide(current + 1);
          restart();
        });
      }

      dots.forEach(function (dot) {
        dot.addEventListener('click', function () {
          showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
          restart();
        });
      });

      restart();
    }

    var searchInput = document.getElementById('site-search');
    var searchResults = document.getElementById('search-results');

    if (searchInput && searchResults && Array.isArray(window.searchMovies)) {
      searchInput.addEventListener('input', function () {
        var keyword = searchInput.value.trim().toLowerCase();

        if (!keyword) {
          searchResults.hidden = true;
          searchResults.innerHTML = '';
          return;
        }

        var matches = window.searchMovies
          .filter(function (movie) {
            return movie.search.indexOf(keyword) !== -1;
          })
          .slice(0, 24);

        if (!matches.length) {
          searchResults.hidden = false;
          searchResults.innerHTML = '<div class="search-results__empty">没有找到匹配影片</div>';
          return;
        }

        searchResults.hidden = false;
        searchResults.innerHTML = matches.map(function (movie) {
          return '<a class="search-results__item" href="./' + escapeHtml(movie.file) + '">' +
            '<img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '">' +
            '<span>' +
              '<strong>' + escapeHtml(movie.title) + '</strong>' +
              '<p>' + escapeHtml(movie.region + ' · ' + movie.type + ' · ' + movie.year) + '</p>' +
            '</span>' +
          '</a>';
        }).join('');
      });
    }

    document.querySelectorAll('[data-category-grid]').forEach(function (grid) {
      var section = grid.closest('.content-section') || document;
      var input = section.querySelector('[data-filter-input]');
      var sort = section.querySelector('[data-sort-select]');
      var count = section.querySelector('[data-filter-count]');
      var cards = Array.prototype.slice.call(grid.children);

      function applyFilters() {
        var keyword = input ? input.value.trim().toLowerCase() : '';
        var visible = [];

        cards.forEach(function (card) {
          var search = (card.getAttribute('data-search') || '').toLowerCase();
          var matched = !keyword || search.indexOf(keyword) !== -1;
          card.hidden = !matched;

          if (matched) {
            visible.push(card);
          }
        });

        if (sort) {
          var sorted = visible.slice();
          var value = sort.value;

          sorted.sort(function (a, b) {
            if (value === 'year-desc') {
              return Number(b.getAttribute('data-year')) - Number(a.getAttribute('data-year'));
            }

            if (value === 'year-asc') {
              return Number(a.getAttribute('data-year')) - Number(b.getAttribute('data-year'));
            }

            if (value === 'title') {
              var aTitle = a.querySelector('h3') ? a.querySelector('h3').textContent : '';
              var bTitle = b.querySelector('h3') ? b.querySelector('h3').textContent : '';
              return aTitle.localeCompare(bTitle, 'zh-CN');
            }

            return 0;
          });

          sorted.forEach(function (card) {
            grid.appendChild(card);
          });
        }

        if (count) {
          count.textContent = visible.length + ' 部';
        }
      }

      if (input) {
        input.addEventListener('input', applyFilters);
      }

      if (sort) {
        sort.addEventListener('change', applyFilters);
      }
    });
  });
})();
