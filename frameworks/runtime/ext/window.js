/**
  Polyfills!
*/

// window.performance
(function() {
  // TODO: Include polyfill for node.js
  if (window && typeof window.performance === 'undefined') {
    window.performance = {};
  }

  if (window && !window.performance.now) {
    var initTimestamp;
    if (window.performance.timing && window.performance.timing.navigationStart) {
      initTimestamp = window.performance.timing.navigationStart;
    } else {
      window.performance.timing = {};
      initTimestamp = window.performance.timing.navigationStart = Date.now ? Date.now() : (new Date()).getTime();
    }
    window.performance.now = function() {
      var now = Date.now ? Date.now() : (new Date()).getTime();
      return now - initTimestamp;
    };
  }
})();
