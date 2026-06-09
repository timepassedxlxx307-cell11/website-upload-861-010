(function () {
  var navButton = document.querySelector('[data-nav-toggle]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (navButton && mobileNav) {
    navButton.addEventListener('click', function () {
      mobileNav.classList.toggle('is-open');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
  var heroIndex = 0;

  function showHeroSlide(index) {
    if (!slides.length) {
      return;
    }

    heroIndex = (index + slides.length) % slides.length;

    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('is-active', slideIndex === heroIndex);
    });

    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle('is-active', dotIndex === heroIndex);
    });
  }

  dots.forEach(function (dot, index) {
    dot.addEventListener('click', function () {
      showHeroSlide(index);
    });
  });

  if (slides.length > 1) {
    window.setInterval(function () {
      showHeroSlide(heroIndex + 1);
    }, 5200);
  }

  function normalize(value) {
    return String(value || '').toLowerCase().replace(/\s+/g, '');
  }

  var searchPage = document.querySelector('[data-search-page]');
  var searchInput = document.querySelector('[data-page-search]');
  var cards = Array.prototype.slice.call(document.querySelectorAll('[data-movie-card]'));
  var noResults = document.querySelector('[data-no-results]');
  var filterButtons = Array.prototype.slice.call(document.querySelectorAll('[data-filter]'));
  var activeFilter = 'all';

  function matchesCard(card, query) {
    var haystack = normalize([
      card.getAttribute('data-title'),
      card.getAttribute('data-genre'),
      card.getAttribute('data-region'),
      card.getAttribute('data-year'),
      card.getAttribute('data-kind')
    ].join(' '));

    var kind = card.getAttribute('data-kind') || '';
    var filterOk = activeFilter === 'all' || kind.indexOf(activeFilter) !== -1;
    return filterOk && (!query || haystack.indexOf(normalize(query)) !== -1);
  }

  function applySearch(query) {
    var visible = 0;

    cards.forEach(function (card) {
      var ok = matchesCard(card, query);
      card.style.display = ok ? '' : 'none';
      if (ok) {
        visible += 1;
      }
    });

    if (noResults) {
      noResults.classList.toggle('is-visible', visible === 0);
    }
  }

  if (searchInput && cards.length) {
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get('q') || '';
    searchInput.value = initialQuery;
    applySearch(initialQuery);

    searchInput.addEventListener('input', function () {
      applySearch(searchInput.value);
    });
  }

  filterButtons.forEach(function (button) {
    button.addEventListener('click', function () {
      activeFilter = button.getAttribute('data-filter') || 'all';

      filterButtons.forEach(function (item) {
        item.classList.toggle('is-active', item === button);
      });

      applySearch(searchInput ? searchInput.value : '');
    });
  });

  if (searchPage) {
    Array.prototype.slice.call(document.querySelectorAll('form.search-form')).forEach(function (form) {
      form.addEventListener('submit', function (event) {
        event.preventDefault();
        var input = form.querySelector('input[name="q"]');
        var query = input ? input.value : '';
        if (searchInput) {
          searchInput.value = query;
        }
        var url = new URL(window.location.href);
        if (query) {
          url.searchParams.set('q', query);
        } else {
          url.searchParams.delete('q');
        }
        window.history.replaceState({}, '', url.toString());
        applySearch(query);
      });
    });
  }
})();
