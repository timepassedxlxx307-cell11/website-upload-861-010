import { H as Hls } from './hls.js';

function startPlayer(root) {
  var video = root.querySelector('video');
  var cover = root.querySelector('.player-cover');
  var source = root.getAttribute('data-video-src');
  var initialized = false;
  var hls = null;

  if (!video || !source) {
    return;
  }

  function attachSource() {
    if (initialized) {
      return;
    }

    initialized = true;

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
      return;
    }

    if (Hls && Hls.isSupported()) {
      hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true
      });

      hls.loadSource(source);
      hls.attachMedia(video);
      return;
    }

    video.src = source;
  }

  function play() {
    attachSource();

    if (cover) {
      cover.classList.add('is-hidden');
    }

    video.controls = true;

    var promise = video.play();

    if (promise && typeof promise.catch === 'function') {
      promise.catch(function () {
        if (cover) {
          cover.classList.remove('is-hidden');
        }
      });
    }
  }

  if (cover) {
    cover.addEventListener('click', play);
  }

  video.addEventListener('click', function () {
    if (!initialized) {
      play();
    }
  });

  video.addEventListener('play', function () {
    if (cover) {
      cover.classList.add('is-hidden');
    }
  });

  window.addEventListener('pagehide', function () {
    if (hls) {
      hls.destroy();
    }
  });
}

document.querySelectorAll('.js-player').forEach(startPlayer);
