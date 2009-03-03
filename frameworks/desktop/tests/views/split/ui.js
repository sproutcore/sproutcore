// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            portions copyright @2009 Apple, Inc.
// License:   Licened under MIT license (see license.js)
// ==========================================================================

/*global module test htmlbody ok equals same stop start */

(function() {
  var pane = SC.ControlTestPane.design()
  .add("empty", SC.SplitView, { 
	layout: { height: 300 },
	topLeftView:SC.TextFieldView,
  	dividerView: SC.SplitDividerView,
  	bottomRightView: SC.TextFieldView
  });
pane.show(); 


module("TODO: Test SC.SplitView UI", pane.standardSetup());
module("TODO: Test SC.SplitDividerView UI");
module("TODO: Test SC.ThumbView UI");
})();