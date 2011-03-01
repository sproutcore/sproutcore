// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            portions copyright @2009 Apple Inc.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/*global module test ok equals same stop start */

(function() {
    var appleURL="http://photos4.meetupstatic.com/photos/event/4/6/9/9/600_4518073.jpeg";
    var iv=SC.ImageView.design({value: appleURL, layout: {height:400, width:400}});
    var pane = SC.ControlTestPane.design({ height: 100 })
    .add("basic", SC.ScrollView, {
  
    })

    .add("basic2", SC.ScrollView, {
        contentView: iv
    })
    
    .add("basic3", SC.ScrollView, {
      contentView: iv,
      isHorizontalScrollerVisible: NO,
      autohidesHorizontalScroller: NO,
      autohidesVerticalScroller: NO
    })
    
    .add("disabled", SC.ScrollView, {
      isEnabled: NO
    })
    
    .add("verticalScrollerBottom",SC.ScrollView, {
      contentView: iv,
      hasHorizontalScroller : NO,
      verticalScrollerBottom: 16,
      isVerticalScrollerVisible: YES,
      autohidesVerticalScroller: NO
      
    })
    .add("aria-controls_attribute", SC.ScrollView, {
      contentView: iv
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

    view.scrollTo(0,100);
    SC.RunLoop.begin().end();
    var elem = view.get('containerView').$()[0];
    equals(elem.scrollTop, 100, 'vertical scrolling should adjust scrollTop of container view');
    
    view.scrollTo(50,0);
    SC.RunLoop.begin().end();
    elem = view.get('containerView').$()[0];
    equals(elem.scrollLeft, 50, 'horizontal scrolling should adjust scrollLeft of container view');
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

   test("non-zero bottom in vertical scrollbar", function() {
      var view = pane.view('verticalScrollerBottom'); 
      equals(view.get('verticalScrollerBottom'),16, "should have verticalScrollerBottom as ");
      var scroller = view.get('verticalScrollerView') ;
      ok(scroller, 'should have vertical scroller view ');
      equals(scroller.get('layout').bottom,16, 'should have layout.bottom of scroller as ');
      equals(scroller.$()[0].style.bottom,'16px', 'should have style.bottom of scroller as ');
    });
   
   test('ScrollView should readjust scrollTop/scrollLeft if layer changes', function() {
     var view = pane.view('basic2'), cv = view.get('contentView'), container = view.get('containerView') ;
     view.scrollTo(10, 10);
     SC.RunLoop.begin().end();
     equals(container.get('layer').scrollLeft, 10, 'precond - scrollLeft is set to 10');
     equals(container.get('layer').scrollTop, 10, 'precond- scrollTop is set to 10');
     cv.replaceLayer();
     SC.RunLoop.begin().end();
     equals(container.get('layer').scrollLeft, 10, 'scrollLeft should be readjusted to 10');
     equals(container.get('layer').scrollTop, 10, 'scrollTop should be readjust to 10');
   });

   test('Scroller views of scroll view should have aria-controls set to its content', function() {
     var view = pane.view("aria-controls_attribute"),
         horizontalScrollerView = view.get('horizontalScrollerView'),
         verticalScrollerView   = view.get('verticalScrollerView'),
         contentView            = view.get('contentView');

     equals(horizontalScrollerView.$().attr('aria-controls'), contentView, "horizontalScroller has aria-controls set");
     equals(verticalScrollerView.$().attr('aria-controls'), contentView, "verticalScroller has aria-controls set");
   });
})();
