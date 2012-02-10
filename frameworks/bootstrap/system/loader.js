// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

// sc_require("system/browser");

SC.setupBodyClassNames = function() {
  var el = document.body,
      browser, platform, shadows, borderRad, classNames, style, ieVersion;
  if (!el) return ;

  browser = SC.browser.current ;
  platform = SC.browser.windows ? 'windows' : SC.browser.mac ? 'mac' : 'other-platform' ;
  style = document.documentElement.style;
  shadows = (style.MozBoxShadow !== undefined) ||
                (style.webkitBoxShadow !== undefined) ||
                (style.oBoxShadow !== undefined) ||
                (style.boxShadow !== undefined);

  borderRad = (style.MozBorderRadius !== undefined) ||
              (style.webkitBorderRadius !== undefined) ||
              (style.oBorderRadius !== undefined) ||
              (style.borderRadius !== undefined);

  classNames = el.className ? el.className.split(' ') : [] ;
  if(shadows) classNames.push('box-shadow');
  if(borderRad) classNames.push('border-rad');
  classNames.push(browser, platform) ;

  // This isn't a perfectly correct way to compare versions, but should be okay
  // in practical usage.
  ieVersion = parseInt(SC.browser.version, 10);
  if (SC.browser.isIE) {
    if (ieVersion === 7) {
      classNames.push('ie7');
    }
    else if (ieVersion === 8) {
      classNames.push('ie8');
    }
    else if (ieVersion === 9) {
      classNames.push('ie9');
    }
  }

  if(browser==="safari" || browser==="chrome") classNames.push('webkit');
  if (SC.browser.mobileSafari) classNames.push('mobile-safari') ;
  if ('createTouch' in document) classNames.push('touch');
  el.className = classNames.join(' ') ;
} ;



