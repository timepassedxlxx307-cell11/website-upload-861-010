import { H as Hls } from "./video-vendor-dru42stk.js";

function setupPlayer(video) {
  var source = video.getAttribute("data-video-src");
  var playButtons = Array.prototype.slice.call(document.querySelectorAll("[data-player-play]"));

  if (!source) {
    playButtons.forEach(function (button) {
      button.disabled = true;
      button.textContent = "暂无播放源";
    });
    return;
  }

  function attachSource() {
    if (video.getAttribute("data-source-attached") === "true") {
      return;
    }

    if (Hls && Hls.isSupported && Hls.isSupported()) {
      var hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90
      });
      hls.loadSource(source);
      hls.attachMedia(video);
      window.__movieHlsInstance = hls;
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = source;
    } else {
      video.src = source;
    }

    video.setAttribute("data-source-attached", "true");
  }

  attachSource();

  playButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      attachSource();
      var playPromise = video.play();
      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(function () {
          video.controls = true;
        });
      }
    });
  });
}

document.addEventListener("DOMContentLoaded", function () {
  var video = document.querySelector("video[data-video-src]");
  if (video) {
    setupPlayer(video);
  }
});
