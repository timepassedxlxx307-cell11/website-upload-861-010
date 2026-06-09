(() => {
  const ready = (fn) => {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn);
    } else {
      fn();
    }
  };

  ready(() => {
    const menuButton = document.querySelector('.menu-toggle');
    const mobileNav = document.querySelector('.mobile-nav');

    if (menuButton && mobileNav) {
      menuButton.addEventListener('click', () => {
        const open = mobileNav.classList.toggle('open');
        menuButton.setAttribute('aria-expanded', open ? 'true' : 'false');
      });
    }

    const hero = document.querySelector('[data-hero-slider]');
    if (hero) {
      const slides = Array.from(hero.querySelectorAll('.hero-slide'));
      const dots = Array.from(hero.querySelectorAll('.hero-dots button'));
      const prev = hero.querySelector('[data-hero-prev]');
      const next = hero.querySelector('[data-hero-next]');
      let current = 0;
      let timer = null;

      const show = (index) => {
        if (!slides.length) return;
        current = (index + slides.length) % slides.length;
        slides.forEach((slide, i) => slide.classList.toggle('active', i === current));
        dots.forEach((dot, i) => dot.classList.toggle('active', i === current));
      };

      const start = () => {
        clearInterval(timer);
        timer = setInterval(() => show(current + 1), 5000);
      };

      dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
          show(index);
          start();
        });
      });

      if (prev) {
        prev.addEventListener('click', () => {
          show(current - 1);
          start();
        });
      }

      if (next) {
        next.addEventListener('click', () => {
          show(current + 1);
          start();
        });
      }

      show(0);
      start();
    }

    const params = new URLSearchParams(window.location.search);
    const presetQuery = params.get('q') || '';

    document.querySelectorAll('[data-search-scope]').forEach((scope) => {
      const input = scope.querySelector('[data-card-search]');
      const grids = Array.from(scope.querySelectorAll('[data-card-grid]'));
      const empty = scope.querySelector('[data-empty-state]');
      const filterButtons = Array.from(scope.querySelectorAll('[data-filter-value]'));
      const cards = grids.flatMap((grid) => Array.from(grid.querySelectorAll('.movie-card, .rank-item')));
      let activeFilter = 'all';

      if (input && presetQuery) {
        input.value = presetQuery;
      }

      const normalize = (value) => (value || '').toString().trim().toLowerCase();

      const run = () => {
        const keyword = normalize(input ? input.value : '');
        let visible = 0;

        cards.forEach((card) => {
          const haystack = normalize([
            card.getAttribute('data-title'),
            card.getAttribute('data-region'),
            card.getAttribute('data-type'),
            card.getAttribute('data-genre'),
            card.getAttribute('data-year'),
            card.getAttribute('data-category')
          ].join(' '));

          const filterText = normalize([
            card.getAttribute('data-region'),
            card.getAttribute('data-type'),
            card.getAttribute('data-genre'),
            card.getAttribute('data-category')
          ].join(' '));

          const keywordMatch = !keyword || haystack.includes(keyword);
          const filterMatch = activeFilter === 'all' || filterText.includes(activeFilter);
          const show = keywordMatch && filterMatch;

          card.style.display = show ? '' : 'none';
          if (show) visible += 1;
        });

        if (empty) {
          empty.classList.toggle('show', visible === 0);
        }
      };

      if (input) {
        input.addEventListener('input', run);
      }

      filterButtons.forEach((button) => {
        button.addEventListener('click', () => {
          activeFilter = normalize(button.getAttribute('data-filter-value')) || 'all';
          filterButtons.forEach((item) => item.classList.toggle('active', item === button));
          run();
        });
      });

      run();
    });
  });
})();
