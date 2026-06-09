(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  document.addEventListener(
    "error",
    function (event) {
      var target = event.target;
      if (!target || target.tagName !== "IMG" || !target.hasAttribute("data-fallback")) {
        return;
      }
      target.classList.add("is-missing");
      var wrap = target.closest(".cover-wrap");
      if (wrap) {
        wrap.classList.add("missing-image");
      }
    },
    true
  );

  function initMobileMenu() {
    var toggle = document.querySelector("[data-mobile-menu-toggle]");
    var menu = document.querySelector("[data-mobile-menu]");
    if (!toggle || !menu) {
      return;
    }
    toggle.addEventListener("click", function () {
      menu.classList.toggle("hidden");
    });
  }

  function initHero() {
    var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
    if (!slides.length) {
      return;
    }
    var index = 0;
    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === index);
      });
    }
    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-hero-dot")) || 0);
      });
    });
    window.setInterval(function () {
      show(index + 1);
    }, 5500);
  }

  function normalize(value) {
    return String(value || "").trim().toLowerCase();
  }

  function updateResultCount(panel, cards) {
    var result = panel ? panel.querySelector("[data-result-count]") : document.querySelector("[data-result-count]");
    if (!result) {
      return;
    }
    var visible = cards.filter(function (card) {
      return !card.hidden;
    }).length;
    result.textContent = "当前显示 " + visible + " 部影片";
  }

  function initCardFilters() {
    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-card]"));
    var panel = document.querySelector("[data-filter-panel]");
    var input = document.querySelector("[data-card-filter]");
    var selects = Array.prototype.slice.call(document.querySelectorAll("[data-select-filter]"));
    var reset = document.querySelector("[data-reset-filters]");
    if (!cards.length) {
      return;
    }

    if (input) {
      var params = new URLSearchParams(window.location.search);
      var query = params.get("q");
      if (query) {
        input.value = query;
      }
    }

    function matchCard(card) {
      var keyword = normalize(input ? input.value : "");
      var haystack = normalize([
        card.getAttribute("data-title"),
        card.getAttribute("data-year"),
        card.getAttribute("data-region"),
        card.getAttribute("data-type"),
        card.getAttribute("data-genre"),
        card.getAttribute("data-tags")
      ].join(" "));
      if (keyword && haystack.indexOf(keyword) === -1) {
        return false;
      }
      for (var i = 0; i < selects.length; i += 1) {
        var select = selects[i];
        var key = select.getAttribute("data-select-filter");
        var expected = normalize(select.value);
        if (expected && normalize(card.getAttribute("data-" + key)) !== expected) {
          return false;
        }
      }
      return true;
    }

    function applyFilter() {
      cards.forEach(function (card) {
        card.hidden = !matchCard(card);
      });
      updateResultCount(panel, cards);
    }

    if (input) {
      input.addEventListener("input", applyFilter);
    }
    selects.forEach(function (select) {
      select.addEventListener("change", applyFilter);
    });
    if (reset) {
      reset.addEventListener("click", function () {
        if (input) {
          input.value = "";
        }
        selects.forEach(function (select) {
          select.value = "";
        });
        applyFilter();
      });
    }
    applyFilter();
  }

  function initSortButtons() {
    var grid = document.querySelector("[data-card-grid]");
    var buttons = Array.prototype.slice.call(document.querySelectorAll("[data-sort]"));
    if (!grid || !buttons.length) {
      return;
    }
    var initialCards = Array.prototype.slice.call(grid.querySelectorAll("[data-card]"));
    buttons.forEach(function (button) {
      button.addEventListener("click", function () {
        buttons.forEach(function (item) {
          item.classList.remove("is-active");
        });
        button.classList.add("is-active");
        var sortType = button.getAttribute("data-sort");
        var cards = initialCards.slice();
        if (sortType === "year") {
          cards.sort(function (a, b) {
            return Number(b.getAttribute("data-year")) - Number(a.getAttribute("data-year"));
          });
        } else if (sortType === "views") {
          cards.sort(function (a, b) {
            return Number(b.getAttribute("data-views")) - Number(a.getAttribute("data-views"));
          });
        } else if (sortType === "rating") {
          cards.sort(function (a, b) {
            return Number(b.getAttribute("data-rating")) - Number(a.getAttribute("data-rating"));
          });
        }
        cards.forEach(function (card) {
          grid.appendChild(card);
        });
      });
    });
  }

  ready(function () {
    initMobileMenu();
    initHero();
    initCardFilters();
    initSortButtons();
  });
})();
