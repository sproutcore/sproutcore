// ==========================================================================
// Project:   SproutCore
// License:   Licensed under MIT license (see license.js)
// ==========================================================================
/*globals module, test, ok */

var XHRRequest, url, test_timeout = 2500;

module("SC.XHRResponse", {

  setup: function() {
    XHRRequest = SC.Request.extend({
      responseClass: SC.XHRResponse
    })

    url = sc_static("file_exists.json");
  },

  teardown: function() {
    url = null;
  }

});

/**
  If the request is across domains, we need to set the `withCredentials` property of the XHR request
  to true in order to allow Cookies to be passed.
*/
test("Test cross domain request credentials support (Default).", function() {
  var request = XHRRequest.getUrl('http://some-bogus-cross-domain.fake/' + url).json().credentials();

  request.notify(this, function(response) {
    ok(response.get('rawRequest').withCredentials, "The XHR request should have the withCredentials property set to true.");

    window.start();
  });

  window.stop(test_timeout); // Stops the test runner

  request.send();
});

test("Test cross domain request credentials support (Prohibited).", function() {
  var request = XHRRequest.getUrl('http://some-bogus-cross-domain.fake/' + url).json().credentials(false); // Don't allow credentials.

  request.notify(this, function(response) {
    ok(!response.get('rawRequest').withCredentials, "The XHR request should have the withCredentials property set to false.");

    window.start();
  });

  window.stop(test_timeout); // Stops the test runner

  request.send();
});

test("Test same domain request credentials support (Ignored).", function() {
  var request = XHRRequest.getUrl(url).json();

  request.notify(this, function(response) {
    ok(!response.get('rawRequest').withCredentials, "The XHR request should have the withCredentials property set to false (because it's same domain).");

    window.start();
  });

  window.stop(test_timeout); // Stops the test runner

  request.send();
});
