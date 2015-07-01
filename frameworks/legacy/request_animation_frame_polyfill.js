/** @scope window
  Polyfill for cross-browser backwards compatible window.requestAnimationFrame support.

  Supports using `window.requestAnimationFrame` on browsers prior to the following:

  * Chrome 10
  * Firefox 4.0 (Gecko 2.0)
  * Internet Explorer 10.0
  * Opera 15
  * Safari 6.0

  Modified from Erik Möller:
  http://my.opera.com/emoller/blog/2011/12/20/requestanimationframe-for-smart-er-animating
*/
(function() {
  var lastTime = 0;
  var vendors = ['ms', 'moz', 'webkit', 'o'];
  for (var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
    window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
    window.cancelRequestAnimationFrame = window[vendors[x]+
      'CancelRequestAnimationFrame'];
  }

  if (!window.requestAnimationFrame) {
    window.requestAnimationFrame = function(callback) {
      var currTime = new Date().getTime();
      var timeToCall = Math.max(0, 16 - (currTime - lastTime));
      var id = window.setTimeout(function() { callback(window.performance.now()); }, timeToCall);
      lastTime = currTime + timeToCall;
      return id;
    };
  }

  if (!window.cancelAnimationFrame) {
    window.cancelAnimationFrame = function(id) { clearTimeout(id); };
  }
}());
