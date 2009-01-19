// ========================================================================
// SC.Timer Tests
// ========================================================================
/*globals module test ok isObj equals expects */

module("Timer.invalidate") ;

test("invalidate immediately should never execute", function() {
  
  var fired = NO ;
  
  SC.runLoop.beginRunLoop() ;
  var start = SC.runLoop.get('startTime') ;
  var t = SC.Timer.schedule({
    target: this,
    action: function() { fired = YES ; },
    interval: 100
  });
  t.invalidate() ;
  SC.runLoop.endRunLoop() ;
  
  stop(2500) ; // stops the test runner
  setTimeout(function() {
    equals(NO, fired) ;
    window.start() ; // starts the test runner
  }, 1500);
  
});
