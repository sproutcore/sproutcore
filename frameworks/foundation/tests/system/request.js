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
    delete url ;
    delete request ;
    delete contents ;
  }
  
});

test("Basic Requirements", function() {
  ok(SC.Request, "SC.Request is defined") ;
  ok("" != url, "url variable is not empty") ;
  ok(request !== null, "request object is not null") ;
  ok(contents === null, "contents is null" ) ;
});

test("Test Asynchronous GET Request", function() {
  request.addObserver("response", function(response) {
      contents = request.get("response") ;
  });
  
  request.send() ;
  
  stop() ; // stops the test runner
  setTimeout( function(){
    ok(contents !== null) ;
    ok(SC.$ok(contents), 'contents should not be an error (Error: %@)'.fmt(contents));
    
    if (SC.$ok(contents)) equals('{"message": "Yay!"}', contents) ;
    window.start() ; // starts the test runner
  }, 1000);
});

test("Test Synchronous GET Request", function() {
  request.set("isAsynchronous", NO);
  
  request.send();
  
  contents = request.get("response");
  
  ok(contents !== null) ;
  ok(SC.$ok(contents), 'contents should not be an error (Error: %@)'.fmt(contents));
  if (SC.$ok(contents)) equals('{"message": "Yay!"}', contents) ;
});

test("Test Asynchronous GET Request, auto-deserializing JSON", function() {
  request.set("isJSON", YES);
  
  request.addObserver("response", function(response){
      contents = request.get("response");
  });
  
  request.send();
  
  stop() ; // stops the test runner
  setTimeout( function(){
    ok(contents !== null) ;
    ok(SC.$ok(contents), 'contents should not be an error (Error: %@)'.fmt(contents));
    if (SC.$ok(contents)) same({"message": "Yay!"}, contents) ;
    window.start() ; // starts the test runner
  }, 1000);
});

test("Test Synchronous GET Request, auto-deserializing JSON", function() {
  request.set("isAsynchronous", false);
  request.set("isJSON", true);
  
  request.send();
  
  var contents = request.get("response");
  
  ok(contents !== null) ;
  ok(SC.$ok(contents), 'contents should not be an error (Error: %@)'.fmt(contents));
  if (SC.$ok(contents)) same({"message": "Yay!"}, contents) ;
});
