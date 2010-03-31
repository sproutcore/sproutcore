// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2010 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2010 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/**
  This platform object allows you to conditionally support certain HTML5
  features.
  
  Rather than relying on the user agent, it detects whether the given elements
  and events are supported by the browser, allowing you to create much more
  robust apps.
*/

SC.platform = {
  touch: ('createTouch' in document),
  
  input: {
    placeholder: (function() { return 'placeholder' in document.createElement('input'); })()
  }
};