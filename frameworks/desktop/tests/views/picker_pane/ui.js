// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            portions copyright @2009 Apple, Inc.
// License:   Licened under MIT license (see license.js)
// ==========================================================================

/*global module test htmlbody ok equals same stop start */

module("SC.PickerPane UI");

htmlbody('<style> .sc-static-layout { border: 1px red dotted; } </style>');

var anchor = SC.ControlTestPane.design()
  .add("anchor", SC.ButtonView, { 
     title: "Anchor Button" 
  });

anchor.show(); // add a test to show the test pane

var pane ;

test("verify picker pane content container is visible at correct location with right size", function() { 
  pane = SC.PickerPane.create({
    contentView: SC.View.extend({
      layout: { width: 300, height: 200 }
    })
  });
  pane.popup(anchor.view('anchor'));

	ok(pane.get('isVisibleInWindow'), 'pane.isVisibleInWindow should be YES');
	ok(pane.$().hasClass('sc-picker-pane'), 'pane should have sc-picker-pane class');
	ok(pane.childViews[0].get('isVisibleInWindow'), 'pane.div.isVisibleInWindow should be YES');
	ok(pane.childViews[0].$().hasClass('sc-view'), 'pane.div should have sc-view class');
	
  var ret = pane.childViews[0].layoutStyle();

	equals(ret.width, '300px', 'pane.div should have width 300px');
	equals(ret.height, '200px', 'pane.div should have height 200px');

  //pane.remove();
}) ;