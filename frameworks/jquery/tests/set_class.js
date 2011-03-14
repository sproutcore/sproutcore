// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

module("jQuery Buffer -- setClass");

// Buffered jQuery tries to call runloop, so we need a dummy runloop.
SC = {};
SC.RunLoop = {};
SC.RunLoop.currentRunLoop = {};
SC.RunLoop.currentRunLoop.invokeOnce = function(){};

test("Setting class on an element", function() {
  var sel = $.bufferedJQuery("<div></div>");
  sel.setClass('abc', true);
  jQuery.Buffer.flush();

  ok(sel[0].className.indexOf("abc") > -1, "Set the class name");

  sel.setClass('abc', false);
  jQuery.Buffer.flush();

  ok(sel[0].className.indexOf("abc") == -1, "Unset the class name");
});

test("Setting to undefined unsets", function() {
  var sel = $.bufferedJQuery("<div></div>");
  sel.setClass('abc', true);
  jQuery.Buffer.flush();

  ok(sel[0].className.indexOf("abc") > -1, "Set the class name");

  sel.setClass('abc');
  jQuery.Buffer.flush();

  ok(sel[0].className.indexOf("abc") == -1, "Unset the class name");
});
