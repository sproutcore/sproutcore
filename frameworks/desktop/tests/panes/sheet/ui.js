// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            portions copyright @2009 Apple Inc.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/*global module test htmlbody ok equals same stop start */

module("SC.SheetPane UI");

var slidePane;

test("verify sheet pane slide down works", function() { 
  slidePane = SC.SheetPane.create({
    layout: { top: 60, width: 400, height: 200, centerX: 0 },
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

  slidePane.append();
  var f = function() {
    // make sure all fo the timers have had an opportunity to fire
    SC.RunLoop.begin().end();
    equals(slidePane.get('layout').top, 0, 'pane should be displayed at default position top after animating');
    ok(slidePane.get('isVisibleInWindow'), 'pane.isVisibleInWindow should be YES');
    ok(slidePane.$().hasClass('sc-sheet'), 'pane should have sc-sheet class');
    ok(slidePane.childViews[0].get('isVisibleInWindow'), 'pane.div.isVisibleInWindow should be YES');
    ok(slidePane.childViews[0].$().hasClass('sc-view'), 'pane.div should have sc-view class');
    window.start();
    slidePane.remove();
  };
  stop();
  setTimeout(f, 400);
}) ;
