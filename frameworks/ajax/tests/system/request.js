// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================
// ========================================================================
// SC.Request Base Tests
// ========================================================================
/*globals module, test, ok, isObj, equals, expects */

var url, request, contents ;

module("SC.Request", {

  setup: function() {
    url = sc_static("file_exists.json");
    request = SC.Request.getUrl(url);
    contents = null ;
  },

  teardown: function() {
    url = request = contents;
  }

});

test("Basic Requirements", function() {
  ok(SC.Request, "SC.Request is defined") ;
  ok("" !== url, "url variable is not empty") ;
  ok(request !== null, "request object is not null") ;
  ok(contents === null, "contents is null" ) ;
});

test("Test Asynchronous GET Request", function() {

  var response, timer;

  timer = setTimeout(function() {
    ok(false, 'response did not invoke notify() within 2sec');
    window.start();
  }, 2000);

  request.notify(this, function(response) {
    ok(SC.ok(response), 'response should not be an error');
    equals(response.get('body'), '{"message": "Yay!"}', 'should match retrieved message');
    clearTimeout(timer);
    window.start();
  });

  response = request.send();
  ok(response !== null, 'request.send() should return a response object');
  ok(response.get('status')<0, 'response should still not have a return code since this should be async');

  stop() ; // stops the test runner - wait for response
});

test("Test Synchronous GET Request", function() {
  request.set("isAsynchronous", NO);
  var response = request.send();

  ok(response !== null, 'send() should return response') ;
  ok(SC.$ok(response), 'contents should not be an error ');
  equals(response.get('body'), '{"message": "Yay!"}', 'should match retrieved message') ;
});

test("Test Asynchronous GET Request, auto-deserializing JSON", function() {
  request.set("isJSON", YES);


  var timer;

  timer = setTimeout( function(){
    ok(false, 'response did not invoke notify()');
    window.start();
  }, 1000);

  request.notify(this, function(response) {
    ok(SC.ok(response), 'response should not be error');
    same(response.get('body'), {"message": "Yay!"}, 'repsonse.body');
    clearTimeout(timer);
    window.start();
  });

  request.send();

  stop() ; // stops the test runner

});

test("Test auto-deserializing malformed JSON", function() {
  request = SC.Request.getUrl(sc_static('malformed.json')).set('isJSON', YES);

  var timer = setTimeout(function() {
    ok(false, 'response did not invoke notify()');
    window.start();
  }, 1000);

  request.notify(this, function(response) {
    ok(SC.ok(response), 'response should not be error');

    try {
      var body = response.get('body');
      ok(!SC.ok(body), 'body should be an error');
    } catch(e) {
      ok(false, 'getting the body should not throw an exception');
    }

    clearTimeout(timer);
    window.start();
  });

  request.send();

  stop();
});

test("Test Synchronous GET Request, auto-deserializing JSON", function() {
  request.set("isAsynchronous", false);
  request.set("isJSON", true);

  var response = request.send();

  ok(response !== null, 'response should not be null') ;
  ok(SC.ok(response), 'contents should not be an error');
  same(response.get('body'), {"message": "Yay!"}, 'contents should have message') ;
});


test("Test if Request body is being auto-serializing to JSON", function() {
  var objectToPost={"content": "garbage"};
  request.set("isJSON", true).set('body', objectToPost);

  var jsonEncoded = request.get('encodedBody');

  equals(jsonEncoded, '{"content":"garbage"}', "The json object passed in send should be encoded and set as the body");
});


test("Test Multiple Asynchronous GET Request - two immediate, and two in serial", function() {
  var requestCount = 3;
  var responseCount = 0;
  var serialCount = 0;

  var observer = function(response) {
    responseCount++;
    if (serialCount<=2) {
      serialCount++;
      SC.Request.getUrl(url).notify(this, observer).send();
      requestCount++;
    }
  };


  SC.Request.getUrl(url).notify(this, observer).send();
  SC.Request.getUrl(url).notify(this, observer).send();
  SC.Request.getUrl(url).notify(this, observer).send();

  stop() ; // stops the test runner
  setTimeout( function(){
    equals(requestCount, 6, "requestCount should be 6");
    equals(responseCount, 6, "responseCount should be 6");
    window.start() ; // starts the test runner
  }, 2000);
});


//   There are two ways to be notified of request changes:
//     - Implementing a didReceive function on the SC.Request object
//     - Registering a listener using notify()
//   The following two tests test the timeout functionality for each of these.

test("Timeouts - SC.Request didReceive callback", function() {
  var message;

  // Sanity check - Should throw an error if we try to set a timeout of 0s.
  try {
    SC.Request.getUrl(url).set('timeout', 0).send();
  }
  catch (e) {
    message = e;
  }
  ok(message && message.indexOf("The timeout value must either not be specified or must be greater than 0") !== -1, 'An error should be thrown when the timeout value is 0 ms');

  // Sanity check 2 - Can't set timeouts on synchronous XHR requests
  try {
    SC.Request.getUrl(url).set('isAsynchronous', NO).set('timeout', 10).send();
  }
  catch (e2) {
    message = e2;
  }
  ok(message && message.indexOf("Timeout values cannot be used with synchronous requests") !== -1, 'An error should be thrown when trying to use a timeout with a synchronous request');


  // Make sure timeouts actually fire, and fire when expected.
  // Point to the server itself so that the tests will work even when offline
  var timeoutRequest = SC.Request.getUrl("/"),
      checkstop;

  var now = Date.now();

  // Set timeout as short as possible so that it will always timeout before
  // the request returns.
  // This test will fail should the response time drop to
  // below 10ms.
  timeoutRequest.set('timeout', 10);

  timeoutRequest.set('didReceive', function(request, response) {
    // Test runner is paused after the request is sent; resume unit testing
    // once we receive a response.
    start();
    clearTimeout(checkstop);

    // If this response was caused by a timeout…
    if (response.get('timedOut')) {
      equals(response.get('status'), 0,
             'Timed out responses should have status 0');

      // We should never be called before the timeout we specified
      var elapsed = Date.now()-now;
      ok(elapsed >= 10,
        'timeout must not fire earlier than 10msec - actual %@'.fmt(elapsed));
    } else {
      // We received a response from the server, which should never happen
      ok(false, 'timeout did not fire before response was received.  should have fired after 10msec.  response time: %@msec'.fmt(Date.now() - now));
    }
  });

  SC.RunLoop.begin();
  timeoutRequest.send();
  SC.RunLoop.end();

  // Stop the test runner and wait for a timeout or a response.
  stop();

  // In case we never receive a timeout, just start unit testing again after
  // 500ms.
  checkstop = setTimeout(function() {
    window.start();
    ok(false, 'timeout did not fire at all');
  }, 500);
});

test("Timeouts - Status listener callback", function() {
  // Make sure timeouts actually fire, and fire when expected.
  // Point to local server so test works offline
  var timeoutRequest = SC.Request.getUrl("/"),
      checkstop;

  // make the timeout as short as possible so that it will always happen
  timeoutRequest.timeoutAfter(10).notify(this, function(response) {
    start();
    clearTimeout(checkstop);

    equals(response.get('status'), 0, "Status code should be zero");
    equals(response.get('timedOut'), YES, "Should have timedOut property set to YES");
    // timeout did fire...just resume...

    return YES;
  });

  SC.RunLoop.begin();
  timeoutRequest.send();
  SC.RunLoop.end();

  stop() ; // stops the test runner

  // in case nothing works
  checkstop = setTimeout(function() {
    ok(false, 'timeout did not fire at all');
    window.start();
  }, 500);
});

test("Test Multiple listeners per single status response", function() {
  var numResponses = 0;
  var response;

  expect(4);

  request.notify(200, this, function(response) {
    numResponses++;
    ok(true, "Received a response");

    if (numResponses === 2) { window.start(); }
  });

  request.notify(200, this, function(response) {
    numResponses++;
    ok(true, "Received a response");

    if (numResponses === 2) { window.start(); }
  });

  response = request.send();
  ok(response !== null, 'request.send() should return a response object');
  ok(response.get('status')<0, 'response should still not have a return code since this should be async');

  stop() ; // stops the test runner - wait for response
});


/**
  There was a short-lived bug where the additional Arguments passed to notify()
  were being dropped because the slice on 'arguments' was happening after they
  had already been adjusted.
*/
test("Multiple arguments passed to notify()", function() {
  var response;

  request.notify(this, function(response, a, b, c) {
    equals(a, 'a', "Listener called with argument 'a'");
    equals(b, 'b', "Listener called with argument 'b'");
    equals(c, 'c', "Listener called with argument 'c'");

    window.start();
  }, 'a', 'b', 'c');

  request.notify(200, this, function(response, a, b, c) {
    equals(a, 'a', "Listener called with argument 'a'");
    equals(b, 'b', "Listener called with argument 'b'");
    equals(c, 'c', "Listener called with argument 'c'");

    window.start();
  }, 'a', 'b', 'c');

  response = request.send();

  stop() ; // stops the test runner - wait for response
});


test("Test event listeners on successful request.", function() {
  var abort = false,
    error = false,
    load = false,
    loadend = false,
    loadstart = false,
    progress = false,
    response,
    status,
    timeout = false;

  request.notify("loadstart", this, function(evt) {
    loadstart = true;
  });

  request.notify("progress", this, function(evt) {
    progress = true;
  });

  request.notify("load", this, function(evt) {
    load = true;
  });

  request.notify("loadend", this, function(evt) {
    loadend = true;
  });

  request.notify(200, this, function(response) {
    status = response.status;

    ok(loadstart, "Received a loadstart event.");
    ok(progress, "Received a progress event.");
    ok(load, "Received a load event.");
    ok(loadend, "Received a loadend event.");
    ok(!abort, "Did not receive an abort event.");
    ok(!error, "Did not receive an error event.");
    ok(!timeout, "Did not receive a timeout event.");
    equals(status, 200, "Received a response with status 200.");

    window.start();
  });

  response = request.send();

  stop() ; // stops the test runner - wait for response
});


test("Test event listeners on aborted request.", function() {
  var abort = false,
    error = false,
    load = false,
    loadend = false,
    loadstart = false,
    progress = false,
    response,
    status,
    timeout = false;

  request.notify("loadstart", this, function(evt) {
    loadstart = true;
  });

  request.notify("progress", this, function(evt) {
    progress = true;

    // Cancel it before it completes.
    response.cancel();
  });

  request.notify("abort", this, function(evt) {
    abort = true;
  });

  request.notify("loadend", this, function(evt) {
    loadend = true;

    ok(loadstart, "Received a loadstart event.");
    ok(progress, "Received a progress event.");
    ok(abort, "Received an abort event.");
    ok(!load, "Did not receive a load event.");
    ok(loadend, "Received a loadend event.");
    ok(!error, "Did not receive an error event.");
    ok(!timeout, "Did not receive a timeout event.");
    equals(status, undefined, "Did not receive a status notification.");

    window.start();
  });

  request.notify(this, function(response) {
    status = response.status;
  });

  response = request.send();

  stop(); // stops the test runner - wait for response
});

test("Test upload event listeners on successful request.", function() {
  var abort = false,
    body = {},
    error = false,
    load = false,
    loadend = false,
    loadstart = false,
    progress = false,
    response,
    status,
    timeout = false;

  // Use a POST request
  request = SC.Request.postUrl('/');

  request.notify("upload.loadstart", this, function(evt) {
    loadstart = true;
  });

  request.notify("upload.progress", this, function(evt) {
    progress = true;
  });

  request.notify("upload.load", this, function(evt) {
    load = true;
  });

  request.notify("upload.loadend", this, function(evt) {
    loadend = true;
  });

  request.notify(200, this, function(response) {
    status = response.status;

    ok(loadstart, "Received a loadstart event.");
    ok(progress, "Received a progress event.");
    ok(load, "Received a load event.");
    ok(loadend, "Received a loadend event.");
    ok(!abort, "Did not receive an abort event.");
    ok(!error, "Did not receive an error event.");
    ok(!timeout, "Did not receive a timeout event.");
    equals(status, 200, "Received a response with status 200.");

    window.start();
  });

  // Make a significant body object.
  var i;
  for (i = 10000; i >= 0; i--) {
    body['k' + i] = 'v' + i;
  }

  response = request.send(body);

  stop() ; // stops the test runner - wait for response
});
