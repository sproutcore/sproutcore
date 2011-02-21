// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2010 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

var SC = SC || { MODULE_INFO: {}, LAZY_INSTANTIATION: {} };

SC._detectBrowser = function(userAgent, language) {
  var version, webkitVersion, browser = {};

  userAgent = (userAgent || navigator.userAgent).toLowerCase();
  language = language || navigator.language || navigator.browserLanguage;

  // Gibberish at the end is to determine when the browser version is done
  version = browser.version = (userAgent.match( /.*(?:rv|chrome|webkit|opera|ie)[\/: ](.+?)([ \);]|$)/ ) || [])[1];
  webkitVersion = (userAgent.match( /webkit\/(.+?) / ) || [])[1];

  // Platforms -- these should probably be moved to another object
  // We test for these first because it is helpful when determining browsers below
  browser.windows = !!/windows/.test(userAgent);
  browser.mac = !!/macintosh/.test(userAgent) || (/mac os x/.test(userAgent) && !/like mac os x/.test(userAgent));
  browser.iOS = !!/iphone|ipod|ipad/.test(userAgent);
  browser.android = !!/android/.test(userAgent);

  // IE-based browsers
  browser.opera = /opera/.test(userAgent) ? version : 0;
  browser.msie = /msie/.test(userAgent) && !browser.opera ? version : 0;

  // Mozilla browsers
  browser.mozilla = /mozilla/.test(userAgent) && !/(compatible|webkit|msie)/.test(userAgent) ? version : 0;

  // Webkit-based browsers
  browser.webkit = /webkit/.test(userAgent) ? webkitVersion : 0;
  browser.chrome = /chrome/.test(userAgent) ? version: 0;
  browser.mobileSafari = /apple.*mobile.*safari/.test(userAgent) && browser.iOS ? webkitVersion : 0;
  // this is a stupid test -- anything that aren't the following doesn't necessarily mean Safari
  browser.safari = browser.webkit && !browser.chrome && !browser.iOS && !browser.android ? webkitVersion : 0;

  // Language
  browser.language = language.split('-', 1)[0];
  
  
  browser.isIE8OrLower = !!(browser.msie && parseInt(browser.msie,10) <= 8);
  
  browser.current = browser.msie ? 'msie' : browser.mozilla ? 'mozilla' : browser.chrome ? 'chrome' : browser.safari ? 'safari' : browser.opera ? 'opera' : browser.mobileSafari ? 'mobile-safari' : 'unknown' ;
  return browser ;
};

SC.browser = SC._detectBrowser();
