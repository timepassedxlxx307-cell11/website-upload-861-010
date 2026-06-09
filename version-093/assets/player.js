
(function () {
    function ready(callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
        } else {
            callback();
        }
    }

    function init(sourceUrl) {
        ready(function () {
            var video = document.querySelector('[data-player-video]');
            var cover = document.querySelector('[data-player-cover]');
            var button = document.querySelector('[data-player-button]');
            if (!video || !cover || !sourceUrl) {
                return;
            }

            var prepared = false;
            var instance = null;

            function prepare() {
                if (prepared) {
                    return;
                }
                prepared = true;
                if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = sourceUrl;
                } else if (window.Hls && window.Hls.isSupported()) {
                    instance = new window.Hls({
                        maxBufferLength: 30,
                        enableWorker: true
                    });
                    instance.loadSource(sourceUrl);
                    instance.attachMedia(video);
                } else {
                    video.src = sourceUrl;
                }
            }

            function play() {
                prepare();
                cover.classList.add('is-hidden');
                video.controls = true;
                var action = video.play();
                if (action && action.catch) {
                    action.catch(function () {
                        cover.classList.remove('is-hidden');
                    });
                }
            }

            cover.addEventListener('click', play);
            if (button) {
                button.addEventListener('click', function (event) {
                    event.stopPropagation();
                    play();
                });
            }
            video.addEventListener('click', function () {
                if (video.paused) {
                    play();
                }
            });
            window.addEventListener('pagehide', function () {
                if (instance && instance.destroy) {
                    instance.destroy();
                }
            });
        });
    }

    window.MoviePlayer = {
        init: init
    };
})();
