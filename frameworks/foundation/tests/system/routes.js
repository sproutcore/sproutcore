// ========================================================================
// SC.routes Base Tests
// ========================================================================
/*globals module test ok isObj equals expects */

var currentRoute;

var handleRoute = function(url) {
  currentRoute = url.url;
};

module("SC.routes", {
  
  setup: function() {
    currentRoute = null;
    SC.routes.add(':url', handleRoute);
  },
  
  teardown: function() {
    SC.routes.set('location', '');
  }
  
});

test("Routes with UTF-8 characters", function() {
  SC.routes.set('location', 'éàçùß€');
  equals(currentRoute, 'éàçùß€');
  stop();
  setTimeout(function() {
    start();
    equals(currentRoute, 'éàçùß€');
  }, 1200);
});
