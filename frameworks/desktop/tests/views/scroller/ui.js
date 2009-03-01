// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            portions copyright @2009 Apple, Inc.
// License:   Licened under MIT license (see license.js)
// ==========================================================================

/*global module test htmlbody ok equals same stop start */

(function() {
  var pane = SC.ControlTestPane.design({ height: 100 })
    .add("basic horizontal", SC.ScrollerView, {
      layoutDirection: SC.LAYOUT_HORIZONTAL
    })
    
    .add("basic vertical", SC.ScrollerView, {
      layoutDirection: SC.LAYOUT_VERTICAL
    })
    
  pane.show(); // add a test to show the test pane
  
  // ..........................................................
  // TEST VIEWS
  // 
  module('SC.ScrollerView UI', pane.standardSetup());
  
  test("basic horizontal", function() {
    var view = pane.view('basic horizontal');
    ok(!view.$().hasClass('disabled'), 'should not have disabled class');
    ok(!view.$().hasClass('sel'), 'should not have sel class');
    
    ok(view.$().hasClass('sc-scroller-view'), 'should have sc-scroller-view class');
    ok(view.$().hasClass('sc-horizontal'), 'should have sc-horizontal class');
    ok(!view.$().hasClass('sc-vertical'), 'should not have sc-vertical class');
    
    equals(view.getPath('childViews.length'), 0, 'scroller views have no children');
  });
  
  test("basic vertical", function() {
    var view = pane.view('basic vertical');
    ok(!view.$().hasClass('disabled'), 'should not have disabled class');
    ok(!view.$().hasClass('sel'), 'should not have sel class');
    
    ok(view.$().hasClass('sc-scroller-view'), 'should have sc-scroller-view class');
    ok(!view.$().hasClass('sc-horizontal'), 'should not have sc-horizontal class');
    ok(view.$().hasClass('sc-vertical'), 'should have sc-vertical class');
    
    equals(view.getPath('childViews.length'), 0, 'scroller views have no children');
  });
  
})();