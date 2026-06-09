function setupMoviePlayer(videoId, streamUrl) {
  var video = document.getElementById(videoId);
  if (!video) {
    return;
  }

  var layer = document.querySelector('[data-play-layer="' + videoId + '"]');
  var started = false;
  var hlsInstance = null;

  function attachStream() {
    if (started) {
      return;
    }
    started = true;

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = streamUrl;
    } else if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hlsInstance.loadSource(streamUrl);
      hlsInstance.attachMedia(video);
    } else {
      video.src = streamUrl;
    }
  }

  function playVideo() {
    attachStream();
    if (layer) {
      layer.classList.add('is-hidden');
    }
    video.setAttribute('controls', 'controls');
    var action = video.play();
    if (action && action.catch) {
      action.catch(function () {});
    }
  }

  if (layer) {
    layer.addEventListener('click', playVideo);
  }

  video.addEventListener('click', function () {
    if (video.paused) {
      playVideo();
    } else {
      video.pause();
    }
  });

  window.addEventListener('pagehide', function () {
    if (hlsInstance) {
      hlsInstance.destroy();
      hlsInstance = null;
    }
  });
}
