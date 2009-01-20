// ========================================================================
// SproutCore -- JavaScript Application Framework
// Copyright ©2006-2008, Sprout Systems, Inc. and contributors.
// Portions copyright ©2008 Apple, Inc.  All rights reserved.
// ========================================================================

require('system/browser');

/**
  @deprecated
  
  API for detecting the current browser and platform.  It is recommended that
  you use the new SC.browser object instead as it does not require a function
  call.
*/
SC.mixin({
  Platform: {
    /** The current IE version number or 0 if not IE. */
    IE: SC.browser.msie,
    /** The current Safari major version number of 0 if not Safari */
    Safari: SC.browser.safari,
    /** The current Firefox major version number or 0 if not Firefox */
    Firefox: SC.browser.mozilla,    
    isWindows: SC.browser.isWindows,
    isMac: SC.browser.isMac
  },

  // DEPRECATED.  here for compatibility only.
  /** @private */
  isIE: function() { 
    return SC.browser.msie > 0 ;
  },

  /** @private */
  isSafari: function() {
    return SC.browser.safari > 0 ;
  },

  /** @private */
  isSafari3: function() {
    return SC.browser.safari >= 3 ;
  },

  /** @private */
  isIE7: function() {
    return SC.browser.msie >= 7 ;
  },

  /** @private */
  isIE6: function() {
    return (SC.browser.msie >= 6) && (SC.browser.msie < 7) ;
  },

  /** @private */
  isWindows: function() {
    return SC.browser.isWindows;
  },

  /** @private */
  isMacOSX: function() {
    return SC.browser.isMac ;
  },

  /** @private */
  isFireFox: function() {
    return SC.browser.mozilla > 0 ;
  },

  /** @private */
  isFireFox2: function() {
    return SC.browser.mozilla >= 2 ;
  },
  
  // Save the Platform.Browser name.
  Browser: ((SC.browser.msie) ? "IE" : (SC.browser.safari) ? "Safari" : (SC.browser.mozilla) ? "Firefox" : null)
  
});
