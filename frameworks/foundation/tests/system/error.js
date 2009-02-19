// ========================================================================
// SC.Error Base Tests
// ========================================================================
/*globals module test ok isObj equals expects */

module("SC.ERROR");

test("SC.Error.desc creates an error instance with description,label and code", function() {
  c = SC.Error.desc('This is an error instance','Error Instance',99999);
  equals(SC.T_ERROR,SC.typeOf(c),'Error instance');
  equals('This is an error instance',c.description,'Description');
  equals('Error Instance',c.label,'Label');
  equals(99999,c.code,'Code');
});

test("SC.$error creates an error instance with description,label and code",function(){
  d = SC.$error('This is a new error instance','New Error Instance',99999);
  equals(SC.T_ERROR,SC.typeOf(d),'New Error instance');
  equals('This is a new error instance',d.description,'Description');
  equals('New Error Instance',d.label,'Label');
  equals(99999,d.code,'Code');
});