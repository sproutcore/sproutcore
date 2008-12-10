// ========================================================================
// SproutCore
// copyright 2006-2008 Sprout Systems, Inc.
// ========================================================================

require('core');

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
    mobileSafari: (/Apple.*Mobile.*Safari/).test(userAgent) ? version : 0,
    
    /** non-zero if we are on windows */
    windows: !!(/(Windows)/).test(userAgent),
    
    /** non-zero if we are on a max */
    mac: !!((/(Macintosh)/).test(userAgent) || (/(Mac OS X)/).test(userAgent)),
    
    language: ((navigator.language || navigator.browserLanguage).split('-', 1)[0])
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
    current: (browser.msie) ? 'msie' : (browser.mozilla) ? 'mozilla' : (browser.safari) ? 'safari' : (browser.opera) ? 'opera' : 'unknown'
    
  }) ;
  
  return browser ;

})();

