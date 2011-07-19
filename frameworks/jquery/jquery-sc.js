// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================
// sc_require("jquery-buffer");
jQuery.Buffer._flush = function() {
  jQuery.Buffer.flush();
};
jQuery.Buffer.scheduleFlushing = function() {
  SC.RunLoop.currentRunLoop.invokeOnce(jQuery.Buffer._flush);
  this.flushingScheduled = true;
};

//@if(debug)
jQuery.Buffer._flush.displayName           = "jQuery.Buffer._flush";
jQuery.Buffer.scheduleFlushing.displayName = "jQuery.Buffer.scheduleFlushing";
//@endif
