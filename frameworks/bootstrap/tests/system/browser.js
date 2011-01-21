// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2010 Strobe Inc. All rights reserved.
// Author:    Peter Wagenet
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

function testUserAgent(userAgent, matchers) {
  var browser = SC._detectBrowser(userAgent), key;
  for (key in matchers) equals(browser[key], matchers[key], "'"+key+"' should be '"+matchers[key]+"'");
}

test("Chrome", function() {
  var userAgent = "Mozilla/5.0 (Macintosh; U; Intel Mac OS X 10_6_5; en-US) AppleWebKit/534.12 (KHTML, like Gecko) Chrome/9.0.572.1 Safari/534.12";
  testUserAgent(userAgent, { version: '9.0.572.1', chrome: '9.0.572.1', safari: '534.12', current: 'chrome' });
});

test("Safari", function() {
  var userAgent = "Mozilla/5.0 (Windows; U; Windows NT 6.1; zh-HK) AppleWebKit/533.18.1 (KHTML, like Gecko) Version/5.0.2 Safari/533.18.5";
  testUserAgent(userAgent, { version: '533.18.1', safari: '533.18.1', current: 'safari' });
});

test("Opera", function() {
  var userAgent;
  userAgent = "Opera/9.00 (X11; Linux i686; U; pl)";
  testUserAgent(userAgent, { version: '9.00', opera: '9.00', current: 'opera' });

  userAgent = "Mozilla/4.0 (compatible; MSIE 6.0; Windows NT 5.1; SV1) Opera 8.65 [en]";
  testUserAgent(userAgent, { version: '8.65', opera: '8.65', current: 'opera' });
});

test("MSIE", function() {
  var userAgent = "Mozilla/5.0 (Windows; U; MSIE 9.0; Windows NT 9.0; en-US))";
  testUserAgent(userAgent, { version: '9.0', msie: '9.0', current: 'msie' });
});

test("Mozilla", function() {
  var userAgent;
  userAgent = "Mozilla/5.0 (Windows; U; Windows NT 6.1; it; rv:2.0b4) Gecko/20100818";
  testUserAgent(userAgent, { version: '2.0b4', mozilla: '2.0b4', current: 'mozilla' });

  userAgent = "Mozilla/5.0 (Windows NT 6.1; rv:2.0b7pre) Gecko/20100921 Firefox/4.0b7pre";
  testUserAgent(userAgent, { version: '2.0b7pre', mozilla: '2.0b7pre', current: 'mozilla' });
});

test("Mobile Safari", function() {
  var userAgent = "Mozilla/5.0 (iPhone; U; CPU iPhone OS 4_0 like Mac OS X; en-us) AppleWebKit/532.9 (KHTML, like Gecko) Version/4.0.5 Mobile/8A293 Safari/6531.22.7";
  testUserAgent(userAgent, { version: '532.9', safari: '532.9', mobileSafari: '532.9', current: 'safari' });
});

test("Unknown", function() {
  var userAgent = "Mozilla/5.0 (compatible; Konqueror/4.4; Linux) KHTML/4.4.1 (like Gecko) Fedora/4.4.1-1.fc12";
  testUserAgent(userAgent, { version: undefined, current: 'unknown' });
});

test("Windows", function(){
  var userAgent = "Mozilla/5.0 (Windows; U; Windows NT 5.2; en-US) AppleWebKit/533.17.8 (KHTML, like Gecko) Version/5.0.1 Safari/533.17.8";
  testUserAgent(userAgent, { windows: true });
});

test("Mac", function(){
  var userAgent;
  userAgent = "Mozilla/5.0 (Macintosh; U; Intel Mac OS X 10_6_5; en-US) AppleWebKit/534.12 (KHTML, like Gecko) Chrome/9.0.572.1 Safari/534.12";
  testUserAgent(userAgent, { mac: true });

  userAgent = "Mozilla/5.0 (iPhone; U; CPU iPhone OS 4_0 like Mac OS X; en-us) AppleWebKit/532.9 (KHTML, like Gecko) Version/4.0.5 Mobile/8A293 Safari/6531.22.7";
  testUserAgent(userAgent, { mac: false });
});

test("Android", function() {
  var userAgent = "Mozilla/5.0 (Linux; U; Android 2.1-update1; en-us; SCH-I500 Build/ECLAIR) AppleWebKit/530.17 (KHTML, like Gecko) Version/4.0 Mobile Safari/530.17";
  testUserAgent(userAgent, {android: true});
});

test("Language", function(){
  equals(SC._detectBrowser(undefined, 'en-US').language, 'en', "should only show base language part");
});
