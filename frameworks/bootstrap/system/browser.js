// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2010 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2010 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

var SC = SC || { MODULE_INFO: {}, LAZY_INSTANTIATION: {} };

SC._detectBrowser = function(rawUserAgent, language) {
  if (rawUserAgent === undefined) rawUserAgent = navigator.userAgent;
  if (language === undefined) language = navigator.language || navigator.browserLanguage;

  var userAgent = rawUserAgent.toLowerCase(),
      // Gibberish at the end is to determine when the browser version is done
      version = (userAgent.match( /.*(?:rv|chrome|webkit|opera|ie)[\/: ](.+?)([ \);]|$)/ ) || [])[1],
      webkitVersion = (userAgent.match( /webkit\/(.+?) / ) || [])[1];

  var browser = {
    version:      version,
    safari:       /webkit/.test(userAgent) ? webkitVersion : 0,
    opera:        /opera/.test(userAgent) ? version : 0,
    msie:         /msie/.test(userAgent) && !/opera/.test(userAgent) ? version : 0,
    mozilla:      /mozilla/.test( userAgent ) && !/(compatible|webkit)/.test(userAgent) ? version : 0,
    mobileSafari: /apple.*mobile.*safari/.test(userAgent) ? version : 0,
    chrome:       /chrome/.test( userAgent ) ? version : 0,
    windows:      !!/windows/.test(userAgent),
    mac:          !!/macintosh/.test(userAgent) || (/mac os x/.test(userAgent) && !/like mac os x/.test(userAgent)),
    android:      !!/android/.test(userAgent),
    language:     language.split('-', 1)[0]
  };

  browser.current = browser.msie ? 'msie' : browser.mozilla ? 'mozilla' : browser.chrome ? 'chrome' : browser.safari ? 'safari' : browser.opera ? 'opera' : 'unknown' ;
  return browser ;
};

SC.browser = SC._detectBrowser();
