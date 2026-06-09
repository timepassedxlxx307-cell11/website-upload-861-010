(function () {
  var menuButton = document.querySelector('.menu-toggle');
  var mobilePanel = document.querySelector('.mobile-panel');

  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function () {
      var open = mobilePanel.classList.toggle('is-open');
      menuButton.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  var slider = document.querySelector('[data-hero-slider]');
  if (slider) {
    var slides = Array.prototype.slice.call(slider.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(slider.querySelectorAll('.hero-dot'));
    var active = 0;

    function showSlide(index) {
      active = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === active);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === active);
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        showSlide(index);
      });
    });

    if (slides.length > 1) {
      window.setInterval(function () {
        showSlide(active + 1);
      }, 5200);
    }
  }

  var params = new URLSearchParams(window.location.search);
  var queryFromUrl = params.get('q') || '';

  document.querySelectorAll('[data-filter-panel]').forEach(function (panel) {
    var scope = panel.parentElement;
    var queryInput = panel.querySelector('.filter-query');
    var genreInput = panel.querySelector('.filter-genre');
    var regionInput = panel.querySelector('.filter-region');
    var yearInput = panel.querySelector('.filter-year');
    var categoryInput = panel.querySelector('.filter-category');
    var resetButton = panel.querySelector('.filter-reset');
    var cards = Array.prototype.slice.call(scope.querySelectorAll('.movie-card'));
    var empty = scope.querySelector('.empty-state');

    if (queryInput && queryFromUrl) {
      queryInput.value = queryFromUrl;
    }

    function normalize(value) {
      return String(value || '').trim().toLowerCase();
    }

    function applyFilters() {
      var keyword = normalize(queryInput && queryInput.value);
      var genre = normalize(genreInput && genreInput.value);
      var region = normalize(regionInput && regionInput.value);
      var year = normalize(yearInput && yearInput.value);
      var category = normalize(categoryInput && categoryInput.value);
      var visible = 0;

      cards.forEach(function (card) {
        var haystack = normalize([
          card.dataset.title,
          card.dataset.genre,
          card.dataset.region,
          card.dataset.year,
          card.dataset.type,
          card.dataset.tags,
          card.textContent
        ].join(' '));
        var ok = true;
        ok = ok && (!keyword || haystack.indexOf(keyword) !== -1);
        ok = ok && (!genre || normalize(card.dataset.genre).indexOf(genre) !== -1 || normalize(card.dataset.tags).indexOf(genre) !== -1);
        ok = ok && (!region || normalize(card.dataset.region) === region);
        ok = ok && (!year || normalize(card.dataset.year) === year);
        ok = ok && (!category || normalize(card.dataset.category) === category);
        card.style.display = ok ? '' : 'none';
        if (ok) {
          visible += 1;
        }
      });

      if (empty) {
        empty.style.display = visible ? 'none' : 'block';
      }
    }

    [queryInput, genreInput, regionInput, yearInput, categoryInput].forEach(function (input) {
      if (input) {
        input.addEventListener('input', applyFilters);
        input.addEventListener('change', applyFilters);
      }
    });

    if (resetButton) {
      resetButton.addEventListener('click', function () {
        [queryInput, genreInput, regionInput, yearInput, categoryInput].forEach(function (input) {
          if (input) {
            input.value = '';
          }
        });
        applyFilters();
      });
    }

    applyFilters();
  });
})();
