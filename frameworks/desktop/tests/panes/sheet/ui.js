// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            portions copyright @2011 Apple Inc.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/*globals module, test, ok, equals, stop, start */

module("SC.SheetPane UI");

test("verify sheet pane slide down works", function() {
  var slidePane = SC.SheetPane.create({
    layout: { width: 400, height: 200, centerX: 0 },
    contentView: SC.LabelView.extend({
      escapeHTML: NO,
      value: '<h1>Slide Down!</h1>'
    })
  });

  SC.run(function () {
    slidePane.append();
  });
  var f = function() {
    // make sure all fo the timers have had an opportunity to fire
    equals(slidePane.get('frame').y, 0, 'pane should be displayed at default position top after animating');
    ok(slidePane.get('isVisibleInWindow'), 'pane.isVisibleInWindow should be YES');
    ok(slidePane.$().hasClass('sc-sheet'), 'pane should have sc-sheet class');
    ok(slidePane.childViews[0].get('isVisibleInWindow'), 'pane.div.isVisibleInWindow should be YES');
    ok(slidePane.childViews[0].$().hasClass('sc-view'), 'pane.div should have sc-view class');

    SC.run(function () {
      slidePane.destroy();
    });

    start();
  };

  stop(1200);

  setTimeout(f, 800);

});
