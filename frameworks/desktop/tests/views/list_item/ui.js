// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            portions copyright @2009 Apple, Inc.
// License:   Licened under MIT license (see license.js)
// ==========================================================================

/*global module test htmlbody ok equals same stop start */

var pane = SC.ControlTestPane.design()
  .add("basic", SC.ListItemView.design({ 
    content: "Basic List Item"
  })) ;

pane.show();

// ..........................................................
// Test Basic Setup
// 

module("SC.ListItemView UI");

test("foo", function() {
  ok(true, "hello");
});

