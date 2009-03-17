// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            portions copyright @2009 Apple, Inc.
// License:   Licened under MIT license (see license.js)
// ==========================================================================

/*global module test htmlbody ok equals same stop start */

module("SC.PalettePane UI");

var pane ;

test("verify palette pane content container is visible at correct location with right size", function() { 
  pane = SC.PalettePane.create({
	  layout: { width: 410, height: 211, right: 0, top: 0 },
    contentView: SC.View.extend({
      layout: { width: 400, height: 200, right: 5, top: 6 }
    })
  });
  pane.append();

	ok(pane.get('isVisibleInWindow'), 'pane.isVisibleInWindow should be YES');
	ok(pane.$().hasClass('sc-palette-pane'), 'pane should have sc-palette-pane class');
	ok(pane.childViews[0].get('isVisibleInWindow'), 'pane.div.isVisibleInWindow should be YES');
	ok(pane.childViews[0].$().hasClass('sc-view'), 'pane.div should have sc-view class');
	
  var ret = pane.childViews[0].layoutStyle();

	equals(ret.top, '6px', 'pane.div should be initiated at default position top including shadow');
	equals(ret.right, '5px', 'pane.div should be initiated at default position right including shadow');
	equals(ret.width, '400px', 'pane.div should have width 400px');
	equals(ret.height, '200px', 'pane.div should have height 200px');

  //pane.remove();
}) ;