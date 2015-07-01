// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2014 7x7 Software Inc. All rights reserved.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/** @private Kept private until fully fleshed out.
  A cubic bezier equation. Used by the SC.easingCurve function.
 */
SC.CubicBezierEquation = function (C1, C2, C3, C4) {

  var B1 = function (t) { return (1 - t) * (1 - t) * (1 - t); };
  var B2 = function (t) { return 3 * t * (1 - t) * (1 - t); };
  var B3 = function (t) { return 3 * t * t * (1 - t); };
  var B4 = function (t) { return t * t * t; };

  this.position = function (percent) {
    var pos = {};

    pos.x = C1.x * B1(percent) + C2.x * B2(percent) + C3.x * B3(percent) + C4.x * B4(percent);
    pos.y = C1.y * B1(percent) + C2.y * B2(percent) + C3.y * B3(percent) + C4.y * B4(percent);

    return pos;
  };

};

/** @private Kept private until fully fleshed out (name change?).
  A specialized bezier curve with fixed start at 0,0 and fixed end at 1,1.

  */
SC.easingCurve = function (C2x, C2y, C3x, C3y) {

  var C1 = { x: 0, y: 0 },
    C2 = { x: C2x, y: C2y },
    C3 = { x: C3x, y: C3y },
    C4 = { x: 1, y: 1 };

  var equation = new SC.CubicBezierEquation(C1, C2, C3, C4);

  equation.value = function (percent) {
    percent = Math.max(0, Math.min(percent, 1));
    return this.position(percent).y;
  };

  equation.toString = function () {
    return "cubic-bezier(%@, %@, %@, %@)".fmt(C2x, C2y, C3x, C3y);
  };

  return equation;
};
