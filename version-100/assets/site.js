
(function () {
  var menuButton = document.querySelector('.menu-toggle');
  var mobilePanel = document.querySelector('.mobile-panel');

  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function () {
      mobilePanel.classList.toggle('open');
    });
  }

  var carousel = document.querySelector('[data-hero-carousel]');

  if (carousel) {
    var slides = Array.prototype.slice.call(carousel.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-dot]'));
    var prev = carousel.querySelector('[data-hero-prev]');
    var next = carousel.querySelector('[data-hero-next]');
    var current = 0;
    var timer = null;

    function show(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === current);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5600);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        show(index);
        start();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        show(current - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(current + 1);
        start();
      });
    }

    carousel.addEventListener('mouseenter', stop);
    carousel.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  var params = new URLSearchParams(window.location.search);
  var query = params.get('q') || '';
  var searchPageInput = document.querySelector('[data-search-page-input]');

  if (searchPageInput && query) {
    searchPageInput.value = query;
  }

  var liveInputs = Array.prototype.slice.call(document.querySelectorAll('[data-live-search]'));

  liveInputs.forEach(function (input) {
    if (query) {
      input.value = query;
    }
  });

  function filterScope(root) {
    var input = root.querySelector('[data-live-search]');
    var year = root.querySelector('[data-year-filter]');
    var type = root.querySelector('[data-type-filter]');
    var list = document.querySelector('[data-movie-list]');
    var empty = document.querySelector('[data-empty-state]');

    if (!list) {
      return;
    }

    var items = Array.prototype.slice.call(list.querySelectorAll('[data-title]'));

    function apply() {
      var keyword = input ? input.value.trim().toLowerCase() : '';
      var yearValue = year ? year.value : '';
      var typeValue = type ? type.value : '';
      var visible = 0;

      items.forEach(function (item) {
        var title = (item.getAttribute('data-title') || '').toLowerCase();
        var region = (item.getAttribute('data-region') || '').toLowerCase();
        var genre = (item.getAttribute('data-genre') || '').toLowerCase();
        var typeText = item.getAttribute('data-type') || '';
        var yearText = item.getAttribute('data-year') || '';
        var haystack = title + ' ' + region + ' ' + genre + ' ' + typeText.toLowerCase() + ' ' + yearText;
        var matchedKeyword = !keyword || haystack.indexOf(keyword) !== -1;
        var matchedYear = !yearValue || yearText.indexOf(yearValue) !== -1;
        var matchedType = !typeValue || typeText.indexOf(typeValue) !== -1;
        var matched = matchedKeyword && matchedYear && matchedType;
        item.style.display = matched ? '' : 'none';
        if (matched) {
          visible += 1;
        }
      });

      if (empty) {
        empty.classList.toggle('show', visible === 0);
      }
    }

    [input, year, type].forEach(function (control) {
      if (control) {
        control.addEventListener('input', apply);
        control.addEventListener('change', apply);
      }
    });

    apply();
  }

  Array.prototype.slice.call(document.querySelectorAll('[data-filter-scope]')).forEach(filterScope);
}());
