// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

window.SC = window.SC || { MODULE_INFO: {}, LAZY_INSTANTIATION: {} };

SC._detectBrowser = function(userAgent, language) {
  var version, webkitVersion, browser = {};

  userAgent = (userAgent || navigator.userAgent).toLowerCase();
  language = language || navigator.language || navigator.browserLanguage;

  // Gibberish at the end is to determine when the browser version is done
  version = browser.version = (userAgent.match( /.*(?:rv|chrome|webkit|opera|ie)[\/: ](.+?)([ \);]|$)/ ) || [])[1];
  webkitVersion = (userAgent.match( /webkit\/(.+?) / ) || [])[1];

  browser.windows = browser.isWindows = !!/windows/.test(userAgent);
  browser.mac = browser.isMac = !!/macintosh/.test(userAgent) || (/mac os x/.test(userAgent) && !/like mac os x/.test(userAgent));
  browser.iPhone = browser.isiPhone = !!/iphone/.test(userAgent);
  browser.iPod = browser.isiPod = !!/ipod/.test(userAgent);
  browser.iPad = browser.isiPad = !!/ipad/.test(userAgent);
  browser.iOS = browser.isiOS = browser.iPhone || browser.iPod || browser.iPad;
  browser.android = browser.isAndroid = !!/android/.test(userAgent);

  browser.opera = /opera/.test(userAgent) ? version : 0;
  browser.isOpera = !!browser.opera;

  browser.msie = /msie/.test(userAgent) && !browser.opera ? version : 0;
  browser.isIE = !!browser.msie;
  browser.isIE8OrLower = !!(browser.msie && parseInt(browser.msie, 10) <= 8);

  browser.mozilla = /mozilla/.test(userAgent) && !/(compatible|webkit|msie)/.test(userAgent) ? version : 0;
  browser.isMozilla = !!browser.mozilla;

  browser.webkit = /webkit/.test(userAgent) ? webkitVersion : 0;
  browser.isWebkit = !!browser.webkit;

  browser.chrome = /chrome/.test(userAgent) ? version: 0;
  browser.isChrome = !!browser.chrome;

  browser.mobileSafari = /apple.*mobile.*safari/.test(userAgent) && browser.iOS ? webkitVersion : 0;
  browser.isMobileSafari = !!browser.mobileSafari;

  browser.iPadSafari = browser.iPad && browser.isMobileSafari ? webkitVersion : 0;
  browser.isiPadSafari = !!browser.iPadSafari;

  browser.iPhoneSafari = browser.iPhone && browser.isMobileSafari ? webkitVersion : 0;
  browser.isiPhoneSafari = !!browser.iphoneSafari;

  browser.iPodSafari = browser.iPod && browser.isMobileSafari ? webkitVersion : 0;
  browser.isiPodSafari = !!browser.iPodSafari;

  browser.safari = browser.webkit && !browser.chrome && !browser.iOS && !browser.android ? webkitVersion : 0;
  browser.isSafari = !!browser.safari;

  browser.language = language.split('-', 1)[0];
  
  browser.current = browser.msie ? 'msie' : browser.mozilla ? 'mozilla' : browser.chrome ? 'chrome' : browser.safari ? 'safari' : browser.opera ? 'opera' : browser.mobileSafari ? 'mobile-safari' : 'unknown';
  return browser;
};

SC.browser = SC._detectBrowser();
