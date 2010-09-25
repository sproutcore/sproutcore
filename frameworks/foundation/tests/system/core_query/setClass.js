// ========================================================================
// CoreQuery Tests
// ========================================================================

module("CoreQuery.setClass()");

test("setClass(existing, NO) should remove the class", function() {
  var cq = SC.$('<div class="existing"></div>') ;
  equals(cq.hasClass('existing'), YES, "cq has existing");
  
  cq.setClass("existing", NO) ;
  equals(cq.hasClass('existing'), NO, 'cq should not have existing');
});

test("setClass(existing, YES) should do nothing", function() {
  var cq = SC.$('<div class="existing"></div>') ;
  equals(cq.hasClass('existing'), YES, "cq has existing");
  
  cq.setClass("existing", YES) ;
  equals(cq.hasClass('existing'), YES, 'cq should have existing');
});

test("setClass(new, YES) should add the class", function() {
  var cq = SC.$('<div class="existing"></div>') ;
  equals(cq.hasClass('new'), NO, "cq does not have new");
  
  cq.setClass("new", YES) ;
  equals(cq.hasClass('new'), YES, 'cq should have new');
});

test("setClass(new, NO) should do nothing", function() {
  var cq = SC.$('<div class="existing"></div>') ;
  equals(cq.hasClass('new'), NO, "cq does not have new");
  
  cq.setClass("new", NO) ;
  equals(cq.hasClass('new'), NO, "cq does not have new");
});

test("setClass(mixed, YES) should work across multiple", function() {
  var cq = SC.$('<div class="root">\
    <div class="mixed match"></div>\
    <div class="match"></div>\
  </div>').find('.match');
  equals(cq.length, 2, 'should have two items');
  
  equals(cq.hasClass("mixed"), YES, "at least one should have mixed class");
  equals(cq.hasClass("mixed", YES), NO, "should not all have mixed class");
  
  cq.setClass("mixed", YES);
  equals(cq.hasClass("mixed", YES), YES, "now all should have mixed class") ;
}) ;
