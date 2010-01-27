// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple Inc. All rights reserved.
// License:   Licened under MIT license (see license.js)
// ==========================================================================

/** Detects the current browser type. Borrowed from jQuery + prototype */
SC.browser = (function() {
  
  var userAgent = navigator.userAgent.toLowerCase();
  var version = (userAgent.match( /.+(?:rv|it|ra|ie)[\/: ]([\d.]+)/ ) || [])[1] ;

  var browser = /** @scope SC.browser */ {
    
    /** The current browser version */
    version: version,
    
    /** non-zero if webkit-based browser */
    safari: (/webkit/).test( userAgent ) ? version : 0,
    
    /** non-zero if this is an opera-based browser */
    opera: (/opera/).test( userAgent ) ? version : 0,
    
    /** non-zero if this is IE */
    msie: (/msie/).test( userAgent ) && !(/opera/).test( userAgent ) ? version : 0,
    
    /** non-zero if this is a miozilla based browser */
    mozilla: (/mozilla/).test( userAgent ) && !(/(compatible|webkit)/).test( userAgent ) ? version : 0,
    
    /** non-zero if this is mobile safari */
    mobileSafari: (/apple.*mobile.*safari/).test(userAgent) ? version : 0,
    
    /** non-zero if we are on windows */
    windows: !!(/(windows)/).test(userAgent),
    
    /** non-zero if we are on a mac */
    mac: !!((/(macintosh)/).test(userAgent) || (/(mac os x)/).test(userAgent)),
    
    language: (navigator.language || navigator.browserLanguage).split('-', 1)[0]
  };
  
  // Add more SC-like descriptions...
  SC.extend(browser, /** @scope SC.browser */ {
    
    isOpera: !!browser.opera,
    isIe: !!browser.msie,
    isIE: !!browser.msie,
    isSafari: !!browser.safari,
    isMobileSafari: !!browser.mobileSafari,
    isMozilla: !!browser.mozilla,
    isWindows: !!browser.windows,
    isMac: !!browser.mac,

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
        function coerce(part) {
          return Number(part.match(/^[0-9]+/))
        }
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

})();

