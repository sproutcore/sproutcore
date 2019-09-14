// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

// sc_require("system/browser");

SC.setupBodyClassNames = function() {
  var el = document.body, browser, platform, classNames;
  if (!el) return;

  browser = SC.browser.current;
  platform = SC.browser.isWindows ? 'windows' : SC.browser.isMac ? 'mac' : 'other-platform';
  style = document.documentElement.style;

  classNames = el.className ? el.className.split(' ') : [] ;
  classNames.push(browser, platform) ;

  if ('createTouch' in document) classNames.push('touch');
  el.className = classNames.join(' ') ;
} ;



