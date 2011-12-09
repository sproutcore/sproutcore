// ========================================================================
// SC.Request Base Tests
// ========================================================================
/*globals module test ok isObj equals expects */

var url, request, contents ;

module("SC.Request", {
  
  setup: function() {
    url = sc_static("file_exists.json"); //"/static/sproutcore/en/desktop/_src/desktop.platform/english.lproj/file_exists.json" ;
    request = SC.Request.getUrl(url) ;
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


test("Test timeouts", function() {
  var message;
  
  // Sanity check 1
  try {
    SC.Request.getUrl(url).set('timeout', 0).send();
  }
  catch (e) {
    message = e;
  }
  ok(message && message.indexOf("The timeout value must either not be specified or must be greater than 0") !== -1, 'An error should be thrown when the timeout value is 0 ms');
  
  // Sanity check 2
  try {
    SC.Request.getUrl(url).set('isAsynchronous', NO).set('timeout', 10).send();
  }
  catch (e2) {
    message = e2;
  }
  ok(message && message.indexOf("Timeout values cannot be used with synchronous requests") !== -1, 'An error should be thrown when trying to use a timeout with a synchronous request');


  // Make sure timeouts actually fire, and fire when expected.
  var changedBefore  = NO,
      changedAfter   = NO,
      timeoutRequest = SC.Request.getUrl("http://www.sproutcore.com"),
      checkstop;

  var now = Date.now();
  
  // make the timeout as short as possible so that it will always happen
  timeoutRequest.set('timeout', 10);
  timeoutRequest.set('didTimeout', function() { 
    // at least timeout time must have elapsed
    var elapsed = Date.now()-now;
    ok(elapsed >= 10, 'timeout must not fire earlier than 10msec - actual %@'.fmt(elapsed));

    // timeout did fire...just resume...
    clearTimeout(checkstop);
    window.start();
  });
  
  timeoutRequest.set('didReceive', function() { 
    ok(false, 'timeout did not fire before response was recieved.  should have fired after 10msec.  response time: %@msec'.fmt(Date.now() - now));
    window.start(); // resume
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

