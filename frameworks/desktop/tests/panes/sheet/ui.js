// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            portions copyright @2009 Apple, Inc.
// License:   Licened under MIT license (see license.js)
// ==========================================================================

/*global module test htmlbody ok equals same stop start */

module("SC.SheetPane UI");

var pane ;

test("verify sheet pane content container is visible at correct location with right size", function() { 
  pane = SC.SheetPane.create({
    layout: { width: 400, height: 200, centerX: 0 },
    contentView: SC.View.extend({
    })
  });
  pane.append();

  ok(pane.get('isVisibleInWindow'), 'pane.isVisibleInWindow should be YES');
  ok(pane.$().hasClass('sc-sheet'), 'pane should have sc-sheet class');
  ok(pane.childViews[0].get('isVisibleInWindow'), 'pane.div.isVisibleInWindow should be YES');
  ok(pane.childViews[0].$().hasClass('sc-view'), 'pane.div should have sc-view class');
  
  var pw = pane.layout.width;
  var ph = pane.layout.height;
  var ret = pane.layoutStyle();

  equals(ret.top, '0px', 'pane should be displayed at default position top');
  equals(ret.left, '50%', 'pane should center horizontally');
  equals(ret.width, '400px', 'pane should have width 400px');
  equals(ret.height, '200px', 'pane should have height 200px');
  equals(ret.marginLeft, -pw/2+'px', 'pane should shift-left %@ px'.fmt(-pw/2));

  pane.remove();
}) ;