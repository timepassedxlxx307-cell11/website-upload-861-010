(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  function setupMobileMenu() {
    var button = document.querySelector(".mobile-toggle");
    var panel = document.querySelector(".mobile-panel");
    if (!button || !panel) {
      return;
    }
    button.addEventListener("click", function () {
      panel.classList.toggle("open");
      button.textContent = panel.classList.contains("open") ? "×" : "☰";
    });
  }

  function setupHero() {
    var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
    var thumbs = Array.prototype.slice.call(document.querySelectorAll(".hero-thumb"));
    if (!slides.length) {
      return;
    }
    var index = 0;
    var timer = null;
    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("active", i === index);
      });
      thumbs.forEach(function (thumb, i) {
        thumb.classList.toggle("active", i === index);
      });
    }
    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }
    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }
    thumbs.forEach(function (thumb) {
      thumb.addEventListener("click", function () {
        var next = Number(thumb.getAttribute("data-target-slide") || 0);
        show(next);
        start();
      });
    });
    var hero = document.querySelector(".home-hero");
    if (hero) {
      hero.addEventListener("mouseenter", stop);
      hero.addEventListener("mouseleave", start);
    }
    start();
  }

  function normalize(value) {
    return String(value || "").toLowerCase().trim();
  }

  function setupLocalFilter() {
    var box = document.querySelector("[data-filter-box]");
    var grid = document.querySelector(".filter-grid");
    if (!box || !grid) {
      return;
    }
    var keywordInput = box.querySelector("[data-filter-input]");
    var regionSelect = box.querySelector("[data-region-filter]");
    var yearSelect = box.querySelector("[data-year-filter]");
    var cards = Array.prototype.slice.call(grid.querySelectorAll(".movie-card"));
    function apply() {
      var keyword = normalize(keywordInput && keywordInput.value);
      var region = normalize(regionSelect && regionSelect.value);
      var year = normalize(yearSelect && yearSelect.value);
      cards.forEach(function (card) {
        var text = normalize(card.textContent);
        var cardRegion = normalize(card.getAttribute("data-region"));
        var cardYear = normalize(card.getAttribute("data-year"));
        var matched = true;
        if (keyword && text.indexOf(keyword) === -1) {
          matched = false;
        }
        if (region && cardRegion !== region) {
          matched = false;
        }
        if (year && cardYear !== year) {
          matched = false;
        }
        card.classList.toggle("hidden-card", !matched);
      });
    }
    [keywordInput, regionSelect, yearSelect].forEach(function (control) {
      if (control) {
        control.addEventListener("input", apply);
        control.addEventListener("change", apply);
      }
    });
  }

  function cardTemplate(item) {
    var tags = (item.tags || []).slice(0, 3).map(function (tag) {
      return "<span>" + escapeHtml(tag) + "</span>";
    }).join("");
    return "<article class=\"movie-card\">" +
      "<a class=\"poster-link\" href=\"./" + item.file + "\">" +
      "<img src=\"" + item.cover + "\" alt=\"" + escapeHtml(item.title) + "\" loading=\"lazy\">" +
      "<span class=\"poster-shade\"></span>" +
      "<span class=\"year-badge\">" + escapeHtml(item.year) + "</span>" +
      "<span class=\"play-dot\">▶</span>" +
      "</a>" +
      "<div class=\"movie-card-body\">" +
      "<div class=\"card-meta\"><span>" + escapeHtml(item.region) + "</span><span>" + escapeHtml(item.type) + "</span></div>" +
      "<h3><a href=\"./" + item.file + "\">" + escapeHtml(item.title) + "</a></h3>" +
      "<p>" + escapeHtml(item.oneLine) + "</p>" +
      "<div class=\"tag-row\">" + tags + "</div>" +
      "</div>" +
      "</article>";
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function setupSearchPage() {
    var tools = document.getElementById("searchTools");
    var results = document.getElementById("searchResults");
    if (!tools || !results || !window.SEARCH_INDEX) {
      return;
    }
    var query = document.getElementById("searchQuery");
    var category = document.getElementById("searchCategory");
    var region = document.getElementById("searchRegion");
    var year = document.getElementById("searchYear");
    var params = new URLSearchParams(window.location.search);
    if (query) {
      query.value = params.get("q") || "";
    }
    if (category) {
      category.value = params.get("category") || "";
    }
    if (region) {
      region.value = params.get("region") || "";
    }
    if (year) {
      year.value = params.get("year") || "";
    }
    function render() {
      var q = normalize(query && query.value);
      var c = normalize(category && category.value);
      var r = normalize(region && region.value);
      var y = normalize(year && year.value);
      var filtered = window.SEARCH_INDEX.filter(function (item) {
        var text = normalize([item.title, item.region, item.type, item.year, item.category, item.genre, item.oneLine, (item.tags || []).join(" ")].join(" "));
        if (q && text.indexOf(q) === -1) {
          return false;
        }
        if (c && normalize(item.category) !== c) {
          return false;
        }
        if (r && normalize(item.region) !== r) {
          return false;
        }
        if (y && normalize(item.year) !== y) {
          return false;
        }
        return true;
      }).slice(0, 120);
      if (!filtered.length) {
        results.innerHTML = "<div class=\"empty-state\">没有找到匹配内容</div>";
        return;
      }
      results.innerHTML = filtered.map(cardTemplate).join("");
    }
    tools.addEventListener("submit", function (event) {
      event.preventDefault();
      var next = new URLSearchParams();
      if (query && query.value.trim()) {
        next.set("q", query.value.trim());
      }
      if (category && category.value) {
        next.set("category", category.value);
      }
      if (region && region.value) {
        next.set("region", region.value);
      }
      if (year && year.value) {
        next.set("year", year.value);
      }
      var url = window.location.pathname + (next.toString() ? "?" + next.toString() : "");
      window.history.replaceState(null, "", url);
      render();
    });
    [query, category, region, year].forEach(function (control) {
      if (control) {
        control.addEventListener("input", render);
        control.addEventListener("change", render);
      }
    });
    render();
  }

  function initializeMoviePlayer(streamUrl, videoId, buttonId) {
    var video = document.getElementById(videoId);
    var button = document.getElementById(buttonId);
    var loaded = false;
    var hls = null;
    if (!video || !button) {
      return;
    }
    function attach() {
      if (loaded) {
        return;
      }
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = streamUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
        hls.loadSource(streamUrl);
        hls.attachMedia(video);
      } else {
        video.src = streamUrl;
      }
      loaded = true;
    }
    function play() {
      attach();
      button.classList.add("is-hidden");
      var attempt = video.play();
      if (attempt && typeof attempt.catch === "function") {
        attempt.catch(function () {
          button.classList.remove("is-hidden");
        });
      }
    }
    button.addEventListener("click", play);
    video.addEventListener("click", function () {
      if (video.paused) {
        play();
      } else {
        video.pause();
      }
    });
    video.addEventListener("play", function () {
      button.classList.add("is-hidden");
    });
    video.addEventListener("pause", function () {
      if (!video.ended) {
        button.classList.remove("is-hidden");
      }
    });
    window.addEventListener("beforeunload", function () {
      if (hls) {
        hls.destroy();
      }
    });
  }

  window.initializeMoviePlayer = initializeMoviePlayer;

  ready(function () {
    setupMobileMenu();
    setupHero();
    setupLocalFilter();
    setupSearchPage();
  });
})();
