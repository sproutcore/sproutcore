// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================
// sc_require("jquery-buffer");
jQuery.Buffer.scheduleFlushing = function() {
  SC.RunLoop.currentRunLoop.invokeOnce(function() {
    jQuery.Buffer.flush()
  });
  this.flushingScheduled = true;
};
