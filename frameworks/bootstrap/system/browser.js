// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple Inc. All rights reserved.
// License:   Licened under MIT license (see license.js)
// ==========================================================================

var SC = SC || { BUNDLE_INFO: {}, LAZY_INSTANTIATION: {} };

SC.browser = (function() {
  var userAgent = navigator.userAgent.toLowerCase();
  var version = (userAgent.match( /.+(?:rv|it|ra|ie)[\/: ]([\d.]+)/ ) || [])[1] ;

  var browser = {
    version: version,
    safari: (/webkit/).test( userAgent ) ? version : 0,
    opera: (/opera/).test( userAgent ) ? version : 0,
    msie: (/msie/).test( userAgent ) && !(/opera/).test( userAgent ) ? version : 0,
    mozilla: (/mozilla/).test( userAgent ) && !(/(compatible|webkit)/).test( userAgent ) ? version : 0,
    mobileSafari: (/apple.*mobile.*safari/).test(userAgent) ? version : 0,
    windows: !!(/(windows)/).test(userAgent),
    mac: !!((/(macintosh)/).test(userAgent) || (/(mac os x)/).test(userAgent)),
    language: (navigator.language || navigator.browserLanguage).split('-', 1)[0]
  };
  
    browser.current = browser.msie ? 'msie' : browser.mozilla ? 'mozilla' : browser.safari ? 'safari' : browser.opera ? 'opera' : 'unknown' ;
  return browser ;
})();
