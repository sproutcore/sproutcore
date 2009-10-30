// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple Inc. All rights reserved.
// License:   Licened under MIT license (see license.js)
// ==========================================================================

SC.bundleDidLoad = function(bundle) {
  var info = this.BUNDLE_INFO[bundle] ;
  if (!info) info = this.BUNDLE_INFO[bundle] = {} ;
  info.loaded = true ;
};

SC.bundleIsLoaded = function(bundle) {
  var info = this.BUNDLE_INFO[bundle] ;
  return info ? !!info.loaded : false ;
};

SC.loadBundle = function() { throw "SC.loadBundle(): SproutCore is not loaded."; };

SC.setupBodyClassNames = function() {
  var el = document.body ;
  if (!el) return ;
  var browser, platform, shadows, borderRad, classNames, style;
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
  classNames.push(browser) ;
  classNames.push(platform) ;
  if (SC.browser.msie==7) classNames.push('ie7') ;
  if (SC.browser.mobileSafari) classNames.push('mobile-safari') ;
  el.className = classNames.join(' ') ;
} ;
