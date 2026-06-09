
(function () {
    function ready(callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
        } else {
            callback();
        }
    }

    ready(function () {
        var toggle = document.querySelector('[data-mobile-toggle]');
        var mobileNav = document.querySelector('[data-mobile-nav]');
        if (toggle && mobileNav) {
            toggle.addEventListener('click', function () {
                mobileNav.classList.toggle('open');
            });
        }

        var hero = document.querySelector('[data-hero]');
        if (hero) {
            var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
            var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
            var next = hero.querySelector('[data-hero-next]');
            var prev = hero.querySelector('[data-hero-prev]');
            var current = 0;
            var timer = null;

            function show(index) {
                if (!slides.length) {
                    return;
                }
                current = (index + slides.length) % slides.length;
                slides.forEach(function (slide, i) {
                    slide.classList.toggle('active', i === current);
                });
                dots.forEach(function (dot, i) {
                    dot.classList.toggle('active', i === current);
                });
            }

            function restart() {
                if (timer) {
                    clearInterval(timer);
                }
                timer = setInterval(function () {
                    show(current + 1);
                }, 5600);
            }

            dots.forEach(function (dot) {
                dot.addEventListener('click', function () {
                    show(Number(dot.getAttribute('data-hero-dot')) || 0);
                    restart();
                });
            });

            if (next) {
                next.addEventListener('click', function () {
                    show(current + 1);
                    restart();
                });
            }

            if (prev) {
                prev.addEventListener('click', function () {
                    show(current - 1);
                    restart();
                });
            }

            restart();
        }

        var searchPage = document.querySelector('[data-search-page]');
        if (searchPage) {
            var input = searchPage.querySelector('[data-search-input]');
            var typeSelect = searchPage.querySelector('[data-filter-type]');
            var yearSelect = searchPage.querySelector('[data-filter-year]');
            var genreSelect = searchPage.querySelector('[data-filter-genre]');
            var cards = Array.prototype.slice.call(document.querySelectorAll('[data-search-results] .movie-card'));
            var params = new URLSearchParams(window.location.search);

            if (input && params.get('q')) {
                input.value = params.get('q');
            }

            function matchText(card, value) {
                if (!value) {
                    return true;
                }
                var haystack = [
                    card.getAttribute('data-title') || '',
                    card.getAttribute('data-region') || '',
                    card.getAttribute('data-type') || '',
                    card.getAttribute('data-year') || '',
                    card.getAttribute('data-genre') || '',
                    card.textContent || ''
                ].join(' ').toLowerCase();
                return haystack.indexOf(value.toLowerCase()) !== -1;
            }

            function filter() {
                var keyword = input ? input.value.trim() : '';
                var type = typeSelect ? typeSelect.value : '';
                var year = yearSelect ? yearSelect.value : '';
                var genre = genreSelect ? genreSelect.value : '';
                cards.forEach(function (card) {
                    var visible = matchText(card, keyword);
                    if (type) {
                        visible = visible && (card.getAttribute('data-type') || '') === type;
                    }
                    if (year) {
                        visible = visible && (card.getAttribute('data-year') || '') === year;
                    }
                    if (genre) {
                        visible = visible && (card.getAttribute('data-genre') || '').indexOf(genre) !== -1;
                    }
                    card.classList.toggle('is-hidden', !visible);
                });
            }

            [input, typeSelect, yearSelect, genreSelect].forEach(function (element) {
                if (element) {
                    element.addEventListener('input', filter);
                    element.addEventListener('change', filter);
                }
            });
            filter();
        }

        var playButton = document.querySelector('[data-detail-play]');
        if (playButton) {
            playButton.addEventListener('click', function () {
                var cover = document.querySelector('[data-player-cover]');
                if (cover) {
                    cover.click();
                }
            });
        }
    });
})();
