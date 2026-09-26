const READER_CHROME_TOGGLE_MESSAGE = 'reader-toggle-chrome';
const READER_SWIPE_NEXT_MESSAGE = 'reader-swipe-next';
const READER_SWIPE_PREVIOUS_MESSAGE = 'reader-swipe-previous';
const TAP_SLOP_PX = 24;
const TAP_MAX_DURATION_MS = 500;
const SWIPE_MIN_DISTANCE_PX = 48;

export type ReaderChromeToggle = {
  readonly message: string;
  readonly nextMessage: string;
  readonly previousMessage: string;
  readonly script: string;
};

/**
 * Page-tap listener for the reflowable WebView. A short tap toggles chrome; a drag still scrolls.
 */
export function createReaderChromeToggle(): ReaderChromeToggle {
  return {
    message: READER_CHROME_TOGGLE_MESSAGE,
    nextMessage: READER_SWIPE_NEXT_MESSAGE,
    previousMessage: READER_SWIPE_PREVIOUS_MESSAGE,
    script: buildReaderChromeToggleScript({
      toggleMessage: READER_CHROME_TOGGLE_MESSAGE,
      nextMessage: READER_SWIPE_NEXT_MESSAGE,
      previousMessage: READER_SWIPE_PREVIOUS_MESSAGE,
    }),
  };
}

function buildReaderChromeToggleScript(input: {
  readonly toggleMessage: string;
  readonly nextMessage: string;
  readonly previousMessage: string;
}): string {
  return `(function () {
    var originX = 0;
    var originY = 0;
    var startedAt = 0;
    var moved = false;
    var slop = ${TAP_SLOP_PX};
    var swipeDistance = ${SWIPE_MIN_DISTANCE_PX};
    function post(message) {
      if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
        window.ReactNativeWebView.postMessage(message);
      }
    }
    document.addEventListener('touchstart', function (event) {
      var touch = event.changedTouches && event.changedTouches[0];
      if (!touch) { return; }
      originX = touch.clientX;
      originY = touch.clientY;
      startedAt = Date.now();
      moved = false;
    }, true);
    document.addEventListener('touchmove', function (event) {
      var touch = event.changedTouches && event.changedTouches[0];
      if (!touch) { return; }
      var dx = touch.clientX - originX;
      var dy = touch.clientY - originY;
      if (dx * dx + dy * dy > slop * slop) { moved = true; }
    }, true);
    document.addEventListener('touchend', function (event) {
      var touch = event.changedTouches && event.changedTouches[0];
      if (!touch) { return; }
      var dx = touch.clientX - originX;
      var dy = touch.clientY - originY;
      if (Math.abs(dx) >= swipeDistance && Math.abs(dx) > Math.abs(dy)) {
        post(dx < 0 ? '${input.nextMessage}' : '${input.previousMessage}');
        return;
      }
      if (moved || Date.now() - startedAt > ${TAP_MAX_DURATION_MS}) { return; }
      var node = event.target;
      while (node) {
        if (node.tagName === 'A') { return; }
        node = node.parentNode;
      }
      post('${input.toggleMessage}');
    }, true);
  })();`;
}
