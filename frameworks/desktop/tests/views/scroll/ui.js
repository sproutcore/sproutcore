// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            portions copyright @2009 Apple, Inc.
// License:   Licened under MIT license (see license.js)
// ==========================================================================

/*global module test htmlbody ok equals same stop start */

(function() {
    var appleURL=static_url('debug/apple-logo1');
    var iv=SC.ImageView.design({value: appleURL, layout: {height:400, width:400}});
    var pane = SC.ControlTestPane.design({ height: 100 })
    .add("basic", SC.ScrollView, {
  
    })

    .add("basic2", SC.ScrollView, {
        contentView: iv
    })

    .add("basic3", SC.ScrollView, {
      contentView: iv,
      isHorizontalScrollerVisible: NO
    })
    
    .add("disabled", SC.ScrollView, {
      isEnabled: NO
    });

    pane.show(); // add a test to show the test pane

  // ..........................................................
  // TEST VIEWS
  // 
  module('SC.ScrollView UI', pane.standardSetup());
  
  test("basic", function() {
    var view = pane.view('basic');
    ok(!view.$().hasClass('disabled'), 'should not have disabled class');
    ok(!view.$().hasClass('sel'), 'should not have sel class');
    
    equals(view.getPath('childViews.length'), 3, 'scroll view should have only three child views');

    var containerView = view.get('containerView') ;
    ok(containerView, 'scroll views should have a container view');
    ok(containerView.kindOf(SC.ContainerView), 'default containerView is a kind of SC.ContainerView');
    ok(containerView.get('contentView') === null, 'default containerView should have a null contentView itself');
    ok(view.get('contentView') === null, 'scroll view should have no contentView by default');
    equals(containerView.getPath('childViews.length'), 0, 'containerView should have no child views');
    
    var horizontalScrollerView = view.get('horizontalScrollerView');
    ok(view.get('hasHorizontalScroller'), 'default scroll view wants a horizontal scroller');
    ok(horizontalScrollerView, 'default scroll view has a horizontal scroller');
    
    var verticalScrollerView = view.get('verticalScrollerView');
    ok(view.get('hasVerticalScroller'), 'default scroll view wants a vertical scroller');
    ok(verticalScrollerView, 'default scroll view has a vertical scroller');
  });
  
  
  
  test("basic2", function() {
    var view = pane.view('basic2');
    ok(view.$().hasClass('sc-scroll-view'), 'should have sc-scroll-view class');    
        
    var horizontalScrollerView = view.get('horizontalScrollerView');
    ok(view.get('hasHorizontalScroller'), 'default scroll view wants a horizontal scroller');
    ok(horizontalScrollerView, 'default scroll view has a horizontal scroller');
    ok(horizontalScrollerView.$().hasClass('sc-horizontal'), 'should have sc-horizontal class');        
	  var maxHScroll = view.maximumHorizontalScrollOffset();    
	  ok((maxHScroll > 0), 'Max horizontal scroll should be greater than zero');
    
    var verticalScrollerView = view.get('verticalScrollerView');
    ok(view.get('hasVerticalScroller'), 'default scroll view wants a vertical scroller');
    ok(verticalScrollerView, 'default scroll view has a vertical scroller');
    ok(verticalScrollerView.$().hasClass('sc-vertical'), 'should have sc-vertical class');    
	  var maxVScroll = view.maximumVerticalScrollOffset();    
	  ok((maxVScroll > 0), 'Max vertical scroll should be greater than zero');
    
  });
   
  test("basic3", function() {
    var view = pane.view('basic3');
    view.set('isHorizontalScrollerVisible',NO);
    ok(!view.get('canScrollHorizontal'),'cannot scroll in horizontal direction');
    ok(view.$().hasClass('sc-scroll-view'), 'should have sc-scroll-view class');    
    var horizontalScrollerView = view.get('horizontalScrollerView');
    ok(view.get('hasHorizontalScroller'), 'default scroll view wants a horizontal scroller');
    ok(horizontalScrollerView, 'default scroll view has a horizontal scroller');
    ok(horizontalScrollerView.$().hasClass('sc-horizontal'), 'should have sc-horizontal class');        
    var maxHScroll = view.maximumHorizontalScrollOffset();    
    equals(maxHScroll , 0, 'Max horizontal scroll should be equal to zero');

    view.set('isVerticalScrollerVisible',NO);
    ok(!view.get('canScrollVertical'),'cannot scroll in vertical direction');
    var verticalScrollerView = view.get('verticalScrollerView');
    ok(view.get('hasVerticalScroller'), 'default scroll view wants a vertical scroller');
    ok(verticalScrollerView, 'default scroll view has a vertical scroller');
    ok(verticalScrollerView.$().hasClass('sc-vertical'), 'should have sc-vertical class');    
    var maxVScroll = view.maximumVerticalScrollOffset();    
    equals(maxVScroll ,0, 'Max vertical scroll should be equal to zero');
  });

  test("disabled", function() {
     var view = pane.view('disabled'); 
     ok(view.$().hasClass('disabled'), 'should have disabled class');
     ok(!view.$().hasClass('sel'), 'should not have sel class');
   });
   
})();
