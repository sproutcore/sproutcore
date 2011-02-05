// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2010 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/** Detects the current browser type. Borrowed from jQuery + prototype */
SC.mixin(SC.browser, (function() {
  var viewport  = window.innerWidth,
      browser = SC.browser,
      standalone = navigator.standalone;

  // Add more SC-like descriptions...
  SC.extend(browser, /** @scope SC.browser */ {

    isOpera: !!browser.opera,
    isIe: !!browser.msie,
    isIE: !!browser.msie,
    isSafari: !!browser.safari,
    isMobileSafari: (!!browser.mobileSafari || !!browser.standalone),
    isMozilla: !!browser.mozilla,
    isWindows: !!browser.windows,
    isMac: !!browser.mac,
    isAndroid: !!browser.android,
    isiPhone: ((!!browser.mobileSafari || !!browser.standalone) && (viewport == 320 || viewport == 480)),

    /**
      The current browser name.  This is useful for switch statements. */
    current: browser.msie ? 'msie' : browser.mozilla ? 'mozilla' : browser.safari ? 'safari' : browser.opera ? 'opera' : 'unknown',

    /**
      Pass any number of arguments, and this will check them against the browser
      version split on ".".  If any of them are not equal, return the inequality.
      If as many arguments as were passed in are equal, return 0.  If something
      is NaN, return 0. */
    compareVersion: function () {
      if (this._versionSplit === undefined) {
        var coerce = function (part) {
          return Number(part.match(/^[0-9]+/));
        };
        this._versionSplit = SC.A(this.version.split('.')).map(coerce);
      }

      var tests = SC.A(arguments).map(Number);
      for (var i = 0; i < tests.length; i++) {
        var check = this._versionSplit[i] - tests[i];
        if (isNaN(check)) return 0;
        if (check !== 0) return check;
      }

      return 0;
    }

  }) ;

  return browser ;

})() );

