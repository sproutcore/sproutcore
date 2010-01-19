// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple Inc. All rights reserved.
// License:   Licened under MIT license (see license.js)
// ==========================================================================

/**
  @namespace
  
  Implements some enhancements to the built-in Number object that makes it
  easier to handle rounding and display of numbers.
  
  @since SproutCore 1.0
  @author Colin Campbell
*/
SC.Number = /** @lends Number */ {
  
  /**
    Checks to see if the number is near the supplied parameter to a certain lambda.
    
    @param {Number} number Number to test for closeness
    @param {Number} lambda The closeness sufficient for a positive result. Default 0.00001
    @returns {Boolean}
  */
  near: function(number, lambda) {
    if (!lambda) lambda = 0.00001;
    return Math.abs(this.valueOf() - number) <= lambda;
  },
  
  /**
    Rounds the number to a given decimal place. If a negative decimalPlace
    parameter is provided, the number will be rounded outward (ie. providing
    -3 will round to the thousands).
    
    Function is insufficient for high negative values of decimalPlace parameter.
    For example, (123456.789).round(-5) should evaluate to 100000 but instead
    evaluates to 99999.999... 
    
    @param {Integer} decimalPlace
    @returns {Number}
  */
  round: function(decimalPlace) {
    if (!decimalPlace) decimalPlace = 0;
    var factor = Math.pow(10, decimalPlace);
    n = this.valueOf();
    return Math.round(n * factor) / factor;
  }
  
};

// Apply SC.Number mixin to built-in Number object
SC.supplement(Number.prototype, SC.Number) ;
