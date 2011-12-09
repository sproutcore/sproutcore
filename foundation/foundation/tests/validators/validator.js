// ========================================================================
// SC.Validator Tests
// ========================================================================
/*globals module test ok isObj equals expects */

module("SC.Validator");

test("Calling fieldValueForObject() should not fail if this.prototypefieldValueForObject() is null", function() {
  var Klass = SC.Validator.extend({
    fieldValueForObject: null
  });
  equals(null, Klass.fieldValueForObject({}, null, null), "should return null") ;
});

test("Calling objectForFieldValue() should not fail if this.prototype.objectForFieldValue() is null", function() {
  var Klass = SC.Validator.extend({
    objectForFieldValue: null
  });
  equals(null, Klass.objectForFieldValue({}, null, null), "should return null") ;
});
