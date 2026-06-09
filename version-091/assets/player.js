(() => {
  const setupPlayer = (shell) => {
    const video = shell.querySelector('video');
    const button = shell.querySelector('.play-overlay');
    const url = shell.getAttribute('data-video');
    let loaded = false;
    let hls = null;

    if (!video || !button || !url) return;

    const load = () => {
      if (loaded) return;
      loaded = true;

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = url;
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          maxBufferLength: 30,
          backBufferLength: 30
        });
        hls.loadSource(url);
        hls.attachMedia(video);
        return;
      }

      video.src = url;
    };

    const start = () => {
      load();
      shell.classList.add('is-playing');
      video.controls = true;
      const attempt = video.play();
      if (attempt && typeof attempt.catch === 'function') {
        attempt.catch(() => {
          shell.classList.remove('is-playing');
        });
      }
    };

    button.addEventListener('click', start);
    video.addEventListener('click', () => {
      if (video.paused) {
        start();
      }
    });

    video.addEventListener('play', () => shell.classList.add('is-playing'));
    video.addEventListener('error', () => {
      if (hls) {
        hls.destroy();
        hls = null;
      }
    });
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      document.querySelectorAll('.player-shell').forEach(setupPlayer);
    });
  } else {
    document.querySelectorAll('.player-shell').forEach(setupPlayer);
  }
})();
