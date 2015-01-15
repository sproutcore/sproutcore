// ==========================================================================
// Project:   SproutCore
// License:   Licensed under MIT license
// ==========================================================================
/*globals CoreTest, module, test, ok, equals, same, expect, start, stop */

var gesture;
module("SC.SwipeGesture", {

  setup: function () {
    gesture = SC.SwipeGesture;
  },

  teardown: function () {
    if (gesture.destroy) { gesture.destroy(); }
    gesture = null;
  }
});

/* Properties */
test("Default Properties:", function () {
  gesture = gesture.create();
  equals(gesture.name, 'swipe', "The default value of name is");
});

/* Methods */
// This method tests the given angle against an approved angle within tolerance.
test("Method: _sc_testAngle", function () {
  gesture = gesture.create({});

  var testAngle,
      targetAngle;

  // Test the target angle 0°.
  targetAngle = 0;
  testAngle = 6;
  equals(gesture._sc_testAngle(Math.abs(testAngle), testAngle >= 0, targetAngle, 5), false, "If the angle, %@, is outside of the positive tolerance for target, %@°, the method returns".fmt(testAngle, targetAngle));

  testAngle = 5;
  equals(gesture._sc_testAngle(Math.abs(testAngle), testAngle >= 0, targetAngle, 5), true, "If the angle, %@, is equal to the positive tolerance for target, %@°, the method returns".fmt(testAngle, targetAngle));

  testAngle = 4;
  equals(gesture._sc_testAngle(Math.abs(testAngle), testAngle >= 0, targetAngle, 5), true, "If the angle, %@, is within the positive tolerance for target, %@°, the method returns".fmt(testAngle, targetAngle));

  testAngle = 0;
  equals(gesture._sc_testAngle(Math.abs(testAngle), testAngle >= 0, targetAngle, 5), true, "If the angle, %@, is equal to the target angle for target, %@°, the method returns".fmt(testAngle, targetAngle));

  testAngle = -4;
  equals(gesture._sc_testAngle(Math.abs(testAngle), testAngle >= 0, targetAngle, 5), true, "If the angle, %@, is within the negative tolerance for target, %@°, the method returns".fmt(testAngle, targetAngle));

  testAngle = -5;
  equals(gesture._sc_testAngle(Math.abs(testAngle), testAngle >= 0, targetAngle, 5), true, "If the angle, %@, is equal to the negative tolerance for target, %@°, the method returns".fmt(testAngle, targetAngle));

  testAngle = -6;
  equals(gesture._sc_testAngle(Math.abs(testAngle), testAngle >= 0, targetAngle, 5), false, "If the angle, %@, is outside of the negative tolerance for target, %@°, the method returns".fmt(testAngle, targetAngle));

  // Test the target angle 180°.
  targetAngle = 180;
  testAngle = -174;
  equals(gesture._sc_testAngle(Math.abs(testAngle), testAngle >= 0, targetAngle, 5), false, "If the angle, %@, is outside of the positive tolerance for target, %@°, the method returns".fmt(testAngle, targetAngle));

  testAngle = -175;
  equals(gesture._sc_testAngle(Math.abs(testAngle), testAngle >= 0, targetAngle, 5), true, "If the angle, %@, is equal to the positive tolerance for target, %@°, the method returns".fmt(testAngle, targetAngle));

  testAngle = -176;
  equals(gesture._sc_testAngle(Math.abs(testAngle), testAngle >= 0, targetAngle, 5), true, "If the angle, %@, is within the positive tolerance for target, %@°, the method returns".fmt(testAngle, targetAngle));

  testAngle = 180;
  equals(gesture._sc_testAngle(Math.abs(testAngle), testAngle >= 0, targetAngle, 5), true, "If the angle, %@, is equal to the target angle for target, %@°, the method returns".fmt(testAngle, targetAngle));

  testAngle = 176;
  equals(gesture._sc_testAngle(Math.abs(testAngle), testAngle >= 0, targetAngle, 5), true, "If the angle, %@, is within the negative tolerance for target, %@°, the method returns".fmt(testAngle, targetAngle));

  testAngle = 175;
  equals(gesture._sc_testAngle(Math.abs(testAngle), testAngle >= 0, targetAngle, 5), true, "If the angle, %@, is equal to the negative tolerance for target, %@°, the method returns".fmt(testAngle, targetAngle));

  testAngle = 174;
  equals(gesture._sc_testAngle(Math.abs(testAngle), testAngle >= 0, targetAngle, 5), false, "If the angle, %@, is outside of the negative tolerance for target, %@°, the method returns".fmt(testAngle, targetAngle));

  // Test the target angle -180°.
  targetAngle = -180;
  testAngle = -174;
  equals(gesture._sc_testAngle(Math.abs(testAngle), testAngle >= 0, targetAngle, 5), false, "If the angle, %@, is outside of the positive tolerance for target, %@°, the method returns".fmt(testAngle, targetAngle));

  testAngle = -175;
  equals(gesture._sc_testAngle(Math.abs(testAngle), testAngle >= 0, targetAngle, 5), true, "If the angle, %@, is equal to the positive tolerance for target, %@°, the method returns".fmt(testAngle, targetAngle));

  testAngle = -176;
  equals(gesture._sc_testAngle(Math.abs(testAngle), testAngle >= 0, targetAngle, 5), true, "If the angle, %@, is within the positive tolerance for target, %@°, the method returns".fmt(testAngle, targetAngle));

  testAngle = 180;
  equals(gesture._sc_testAngle(Math.abs(testAngle), testAngle >= 0, targetAngle, 5), true, "If the angle, %@, is equal to the target angle for target, %@°, the method returns".fmt(testAngle, targetAngle));

  testAngle = 176;
  equals(gesture._sc_testAngle(Math.abs(testAngle), testAngle >= 0, targetAngle, 5), true, "If the angle, %@, is within the negative tolerance for target, %@°, the method returns".fmt(testAngle, targetAngle));

  testAngle = 175;
  equals(gesture._sc_testAngle(Math.abs(testAngle), testAngle >= 0, targetAngle, 5), true, "If the angle, %@, is equal to the negative tolerance for target, %@°, the method returns".fmt(testAngle, targetAngle));

  testAngle = 174;
  equals(gesture._sc_testAngle(Math.abs(testAngle), testAngle >= 0, targetAngle, 5), false, "If the angle, %@, is outside of the negative tolerance for target, %@°, the method returns".fmt(testAngle, targetAngle));

  // Test the target angle 90°.
  targetAngle = 90;
  testAngle = 96;
  equals(gesture._sc_testAngle(Math.abs(testAngle), testAngle >= 0, targetAngle, 5), false, "If the angle, %@, is outside of the positive tolerance for target, %@°, the method returns".fmt(testAngle, targetAngle));

  testAngle = 95;
  equals(gesture._sc_testAngle(Math.abs(testAngle), testAngle >= 0, targetAngle, 5), true, "If the angle, %@, is equal to the positive tolerance for target, %@°, the method returns".fmt(testAngle, targetAngle));

  testAngle = 94;
  equals(gesture._sc_testAngle(Math.abs(testAngle), testAngle >= 0, targetAngle, 5), true, "If the angle, %@, is within the positive tolerance for target, %@°, the method returns".fmt(testAngle, targetAngle));

  testAngle = 90;
  equals(gesture._sc_testAngle(Math.abs(testAngle), testAngle >= 0, targetAngle, 5), true, "If the angle, %@, is equal to the target angle for target, %@°, the method returns".fmt(testAngle, targetAngle));

  testAngle = 86;
  equals(gesture._sc_testAngle(Math.abs(testAngle), testAngle >= 0, targetAngle, 5), true, "If the angle, %@, is within the negative tolerance for target, %@°, the method returns".fmt(testAngle, targetAngle));

  testAngle = 85;
  equals(gesture._sc_testAngle(Math.abs(testAngle), testAngle >= 0, targetAngle, 5), true, "If the angle, %@, is equal to the negative tolerance for target, %@°, the method returns".fmt(testAngle, targetAngle));

  testAngle = 84;
  equals(gesture._sc_testAngle(Math.abs(testAngle), testAngle >= 0, targetAngle, 5), false, "If the angle, %@, is outside of the negative tolerance for target, %@°, the method returns".fmt(testAngle, targetAngle));

  testAngle = -90;
  equals(gesture._sc_testAngle(Math.abs(testAngle), testAngle >= 0, targetAngle, 5), false, "If the angle, %@, is the inverse of the target, %@°, the method returns".fmt(testAngle, targetAngle));

  // Test the target angle -90°.
  targetAngle = -90;
  testAngle = -96;
  equals(gesture._sc_testAngle(Math.abs(testAngle), testAngle >= 0, targetAngle, 5), false, "If the angle, %@, is outside of the positive tolerance for target, %@°, the method returns".fmt(testAngle, targetAngle));

  testAngle = -95;
  equals(gesture._sc_testAngle(Math.abs(testAngle), testAngle >= 0, targetAngle, 5), true, "If the angle, %@, is equal to the positive tolerance for target, %@°, the method returns".fmt(testAngle, targetAngle));

  testAngle = -94;
  equals(gesture._sc_testAngle(Math.abs(testAngle), testAngle >= 0, targetAngle, 5), true, "If the angle, %@, is within the positive tolerance for target, %@°, the method returns".fmt(testAngle, targetAngle));

  testAngle = -90;
  equals(gesture._sc_testAngle(Math.abs(testAngle), testAngle >= 0, targetAngle, 5), true, "If the angle, %@, is equal to the target angle for target, %@°, the method returns".fmt(testAngle, targetAngle));

  testAngle = -86;
  equals(gesture._sc_testAngle(Math.abs(testAngle), testAngle >= 0, targetAngle, 5), true, "If the angle, %@, is within the negative tolerance for target, %@°, the method returns".fmt(testAngle, targetAngle));

  testAngle = -85;
  equals(gesture._sc_testAngle(Math.abs(testAngle), testAngle >= 0, targetAngle, 5), true, "If the angle, %@, is equal to the negative tolerance for target, %@°, the method returns".fmt(testAngle, targetAngle));

  testAngle = -84;
  equals(gesture._sc_testAngle(Math.abs(testAngle), testAngle >= 0, targetAngle, 5), false, "If the angle, %@, is outside of the negative tolerance for target, %@°, the method returns".fmt(testAngle, targetAngle));

  testAngle = 90;
  equals(gesture._sc_testAngle(Math.abs(testAngle), testAngle >= 0, targetAngle, 5), false, "If the angle, %@, is the inverse of the target, %@°, the method returns".fmt(testAngle, targetAngle));
});
