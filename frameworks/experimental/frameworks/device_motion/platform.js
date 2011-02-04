// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2010 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

SC.mixin(SC.platform,
/** @scope SC.platform */ {

  /**
    YES if the ondeviceorientation event on window is supported.
    
    @property {Boolean}
    @default NO
  */
  supportsGyroscope: ('ondeviceorientation' in window),
  
  /**
    YES if the ondeviceorientation event on window has actually been
    fired. Some platforms have the event but will never fire it.
    
    @property {Boolean}
    @default NO
  */
  hasGyroscope: NO,
  
  /**
    YES if the ondevicemotion event on window is supported.
    
    @property {Boolean}
    @default NO
  */
  supportsAccelerometer: ('ondevicemotion' in window),
  
  /**
    YES if the ondevicemotion event on window has actually been
    fired. Some platforms have the event but will never fire it.
    
    @property {Boolean}
    @default NO
  */
  hasAccelerometer: NO,
  
  /*
    TODO [CC] Find out the actual values on a multitude of devices.
              We would want this to be a 'normal' use value...
  */
  /**
    @property {Number}
    @default -10
  */
  accelerationMinimum: function() {
    // we may want finer grained control of this by platform later
    return -10;
  }(),
  
  /**
    @property {Number}
    @default 10
  */
  accelerationMaximum: function() {
    // we may want finer grained control of this by platform later
    return 10;
  }()

});