// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            portions copyright @2009 Apple Inc.
// License:   Licened under MIT license (see license.js)
// ==========================================================================

/*global module test htmlbody ok equals same stop start */

module("SC.SheetPane UI");

var slidePane, blindPane ;

test("verify sheet pane slide down works", function() { 
  slidePane = SC.SheetPane.create({
    layout: { top: 0, left: 100, width: 400, height: 200 },
    contentView: SC.LabelView.extend({
      escapeHTML: NO,
      value: '<h1>Slide Down!</h1>'
    })
  });
  
  var layout = slidePane.get('layout');
  var pt = layout.top;
  var pl = layout.left;
  var pw = layout.width;
  var ph = layout.height;
  var ret = slidePane.layoutStyle();

  equals(ret.top, '0px', 'pane should be displayed at default position top');
  equals(ret.left, '500px', 'pane should center horizontally');
  equals(ret.width, '400px', 'pane should have width 400px');
  equals(ret.height, '200px', 'pane should have height 200px');
  
  slidePane.slideDown();
  
  ok(slidePane.get('isVisibleInWindow'), 'pane.isVisibleInWindow should be YES');
  ok(slidePane.$().hasClass('sc-sheet'), 'pane should have sc-sheet class');
  ok(slidePane.childViews[0].get('isVisibleInWindow'), 'pane.div.isVisibleInWindow should be YES');
  ok(slidePane.childViews[0].$().hasClass('sc-view'), 'pane.div should have sc-view class');
  
  slidePane.slideUp();
}) ;

test("verify sheet pane blind down works", function() { 
  blindPane = SC.SheetPane.create({
    layout: { top: 50, right: 100, width: 400, height: 200 },
    contentView: SC.LabelView.extend({
      escapeHTML: NO,
      value: '<h1>Blind Down!</h1>'
    })
  });
  
  var layout = blindPane.get('layout');
  var pt = layout.top;
  var pl = layout.left;
  var pw = layout.width;
  var ph = layout.height;
  var ret = blindPane.layoutStyle();

  equals(ret.top, '0px', 'pane should be displayed at default position top');
  equals(ret.left, '500px', 'pane should center horizontally');
  equals(ret.width, '400px', 'pane should have width 400px');
  equals(ret.height, '0px', 'pane should have height 0px');
  
  blindPane.blindDown();
  
  ok(blindPane.get('isVisibleInWindow'), 'pane.isVisibleInWindow should be YES');
  ok(blindPane.$().hasClass('sc-sheet'), 'pane should have sc-sheet class');
  ok(blindPane.childViews[0].get('isVisibleInWindow'), 'pane.div.isVisibleInWindow should be YES');
  ok(blindPane.childViews[0].$().hasClass('sc-view'), 'pane.div should have sc-view class');
  
  blindPane.blindUp();
}) ;