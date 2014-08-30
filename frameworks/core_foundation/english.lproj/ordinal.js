// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/**
 * Returns the ordinal associated for the current number.
 */
SC.methodForLocale('en', 'ordinalForNumber', function(number) {
  var d = number % 10;
  return (~~ (number % 100 / 10) === 1) ? 'th' :
         (d === 1) ? 'st' :
         (d === 2) ? 'nd' :
         (d === 3) ? 'rd' : 'th';
});