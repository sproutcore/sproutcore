// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            portions copyright @2011 Apple Inc.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/*global module, test, ok, equals, expect, stop, start */

(function () {
    var appleURL="http://photos4.meetupstatic.com/photos/event/4/6/9/9/600_4518073.jpeg";
    var iv = SC.ImageView.design({value: appleURL, layout: { height:400, width:400 }});
    var pane = SC.ControlTestPane.design({ height: 100 })
    .add("basic", SC.ScrollView, {

    })

    .add("basic2", SC.ScrollView, {
        contentView: SC.View.extend({
          layout: { height: 400, width: 400 },
          backgroundColor: 'lightblue',
          wantsAcceleratedLayer: true
        })
    })

    .add("basic3", SC.ScrollView, {
      contentView: iv,
      isHorizontalScrollerVisible: NO,
      autohidesHorizontalScroller: NO,
      autohidesVerticalScroller: NO
    })

    .add("basic same size content", SC.ScrollView, {
      horizontalOverlay: YES,
      verticalOverlay: YES,
      contentView: SC.View.extend({
        layout: { height: 100 },
        backgroundColor: 'lightblue'
      })
    })

    .add("disabled", SC.ScrollView, {
      isEnabled: NO
    })

    .add("verticalScrollerLayout",SC.ScrollView, {
      contentView: iv,
      hasHorizontalScroller : NO,
      verticalScrollerLayout: { right: 0, top: 0, bottom: 16 },
      isVerticalScrollerVisible: YES,
      autohidesVerticalScroller: NO

    })
    .add("aria-attributes", SC.ScrollView, {
      contentView: iv
    })

    .add("overlaidScrollers", SC.ScrollView, {
      verticalOverlay: YES,
      horizontalOverlay: YES
    })

    .add("overlaid touch scrollers", SC.ScrollView, {
      contentView: iv,
      verticalOverlay: YES,
      verticalScrollerView: SC.OverlayScrollerView,
      horizontalOverlay: YES,
      horizontalScrollerView: SC.OverlayScrollerView
    })

    .add("no fade scrollers", SC.ScrollView, {
      contentView: iv,
      verticalOverlay: YES,
      verticalScrollerView: SC.OverlayScrollerView,
      verticalFade: NO,
      horizontalOverlay: YES,
      horizontalScrollerView: SC.OverlayScrollerView,
      horizontalFade: NO
    });

  // ..........................................................
  // TEST VIEWS
  //
  module('SC.ScrollView UI', pane.standardSetup());

  test("Basic presence of child views.", function() {
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

  test("Basic class names, offsets and CSS transforms", function() {
    var view = pane.view('basic2'),
      contentView = view.get('contentView'),
      elem = contentView.getPath('layer'),
      transformAttr = 'transform',
      transformTemplate = 'translateX(%@px) translateY(%@px) translateZ(%@px) scale(%@)';

    // CLASS
    ok(view.$().hasClass('sc-scroll-view'), 'should have sc-scroll-view class');

    // HORIZONTAL SCROLLER
    var horizontalScrollerView = view.get('horizontalScrollerView');
    ok(view.get('hasHorizontalScroller'), 'default scroll view wants a horizontal scroller');
    ok(horizontalScrollerView, 'default scroll view has a horizontal scroller');
    ok(horizontalScrollerView.$().hasClass('sc-horizontal'), 'should have sc-horizontal class');
    var maxHScroll = view.get('maximumHorizontalScrollOffset');
    ok((maxHScroll > 0), 'Max horizontal scroll should be greater than zero');

    // VERTICAL SCROLLER
    var verticalScrollerView = view.get('verticalScrollerView');
    ok(view.get('hasVerticalScroller'), 'default scroll view wants a vertical scroller');
    ok(verticalScrollerView, 'default scroll view has a vertical scroller');
    ok(verticalScrollerView.$().hasClass('sc-vertical'), 'should have sc-vertical class');
    var maxVScroll = view.get('maximumVerticalScrollOffset');
    ok((maxVScroll > 0), 'Max vertical scroll should be greater than zero');

    // SCROLLING VERTICALLY
    SC.run(function() {
      view.scrollTo(0,100);
    });
    equals(view.get('verticalScrollOffset'), 100, 'Vertical scrolling should adjust verticalScrollOffset');
    equals(elem.style[transformAttr], transformTemplate.fmt(0, -100, 0, 1), 'Vertical scrolling should adjust transform on the contentView layer');

    // SCROLLING HORIZONTALLY
    SC.run(function() {
      view.scrollTo(50,0);
    });
    equals(view.get('horizontalScrollOffset'), 50, 'horizontal scrolling should adjust horizontalScrollOffset');
    equals(elem.style[transformAttr], transformTemplate.fmt(-50, 0, 0, 1), 'Horizontal scrolling should adjust transform on the contentView layer.');

    // ADJUSTING CONTENT LAYOUT WHILE SCROLLED SHOULD STAY CENTERED
    // Reproducing this bug requires that there be no adjustment already scheduled.
    SC.run(function() {
      contentView.adjust('height', 450);
    });

    equals(elem.style[transformAttr], transformTemplate.fmt(-50, 0, 0, 1), 'Adjusting content size should not affect scroll transform positioning');
  });

  test("Basic scroller visibility", function() {
    var view = pane.view('basic3');

    SC.run(function() { view.set('isHorizontalScrollerVisible', NO); });
    ok(!view.get('canScrollHorizontal'), 'cannot scroll in horizontal direction');
    var horizontalScrollerView = view.get('horizontalScrollerView');
    ok(view.get('hasHorizontalScroller'), 'default scroll view wants a horizontal scroller');
    ok(horizontalScrollerView, 'default scroll view has a horizontal scroller');
    ok(horizontalScrollerView.$().hasClass('sc-horizontal'), 'should have sc-horizontal class');
    // var maxHScroll = view.get('maximumHorizontalScrollOffset');
    // equals(maxHScroll , 0, 'Max horizontal scroll should be equal to zero');

    SC.run(function() { view.set('isVerticalScrollerVisible', NO); });
    ok(!view.get('canScrollVertical'),'cannot scroll in vertical direction');
    var verticalScrollerView = view.get('verticalScrollerView');
    ok(view.get('hasVerticalScroller'), 'default scroll view wants a vertical scroller');
    ok(verticalScrollerView, 'default scroll view has a vertical scroller');
    ok(verticalScrollerView.$().hasClass('sc-vertical'), 'should have sc-vertical class');
    // var maxVScroll = view.get('maximumVerticalScrollOffset');
    // equals(maxVScroll, 0, 'Max vertical scroll should be equal to zero');
  });

  test("disabled", function() {
    var view = pane.view('disabled');
    ok(view.$().hasClass('disabled'), 'should have disabled class');
    ok(!view.$().hasClass('sel'), 'should not have sel class');
  });

  test("non-zero bottom in vertical scrollbar", function() {
    var view = pane.view('verticalScrollerLayout');
    var scroller = view.get('verticalScrollerView') ;
    ok(scroller, 'should have vertical scroller view');
    equals(scroller.get('layout').bottom,16, 'should have layout.bottom of scroller as ');
    equals(scroller.$()[0].style.bottom,'16px', 'should have style.bottom of scroller as ');
  });

  test('ScrollView should readjust scroll transform if layer changes', function() {
    var view = pane.view('basic2'), cv = view.get('contentView'),
      prevTransform;

    // Get the previous style transform.
    SC.run(function() {
      view.scrollTo(10, 10);
      view._sc_repositionContentViewUnfiltered(); // This method is PRIVATE. (Called here to cheat, synchronously testing an asynchronous operation.)
    });
    prevTransform = cv.get('layer').style['transform'];

    SC.run(cv.replaceLayer, cv);

    equals(cv.get('layer').style['transform'],
      prevTransform,
      'The new layer has had the scroll transform style applied');
  });

  test('Scroller views of scroll view should have aria attributes set', function() {
    var view = pane.view("aria-attributes"),
        horizontalScrollerView = view.get('horizontalScrollerView'),
        verticalScrollerView   = view.get('verticalScrollerView'),
        contentView            = view.get('contentView');

    equals(horizontalScrollerView.$().attr('aria-controls'), contentView.get('layerId'), "horizontalScroller has aria-controls set");
    equals(verticalScrollerView.$().attr('aria-controls'), contentView.get('layerId'), "verticalScroller has aria-controls set");

    equals(horizontalScrollerView.$().attr('aria-orientation'), 'horizontal', "horizontalScroller has aria-orientation set");
    equals(verticalScrollerView.$().attr('aria-orientation'), 'vertical', "verticalScroller has aria-orientation set");

    equals(horizontalScrollerView.$().attr('aria-valuemin'), 0, "horizontalScroller has aria-valuemin set");
    equals(verticalScrollerView.$().attr('aria-valuemin'), 0, "verticalScroller has aria-valuemin set");

    equals(horizontalScrollerView.$().attr('aria-valuemax'), view.get('maximumHorizontalScrollOffset'), "horizontalScroller has aria-valuemax set");
    equals(verticalScrollerView.$().attr('aria-valuemax'), view.get('maximumVerticalScrollOffset'), "verticalScroller has aria-valuemax set");

    equals(horizontalScrollerView.$().attr('aria-valuenow'), view.get('horizontalScrollOffset'), "horizontalScroller has aria-valuenow set");
    equals(verticalScrollerView.$().attr('aria-valuenow'), view.get('verticalScrollOffset'), "verticalScroller has aria-valuenow set");

    // Aria max-value should change when the content's size is adjusted.
    var previousHeight = contentView.getPath('layout.height');
    SC.run(function() {
      contentView.adjust('height', previousHeight + 50);
    });
    equals(verticalScrollerView.$().attr('aria-valuemax'), view.get('maximumVerticalScrollOffset'), 'Changing the maximum scroll offset changes the aria-maxvalue');

  });

  test('Scroller fading', function() {
    var view = pane.view('overlaid touch scrollers'),
        verticalScroller = view.get('verticalScrollerView'),
        opac;

    stop(2000);
    expect(2);
    SC.RunLoop.begin();
    verticalScroller.fadeOut(0.1);
    SC.RunLoop.end();
    setTimeout(function() {
      opac = verticalScroller.$().css('opacity');
      equals(opac, '0', 'after fadeout, scroller opacity should equal zero');
      SC.RunLoop.begin();
      verticalScroller.fadeIn(0.1);
      view._sc_repositionContentViewUnfiltered(); // This method is PRIVATE. (Called here to cheat, synchronously testing an asynchronous operation.)
      SC.RunLoop.end();
      setTimeout(function() {
        opac = verticalScroller.$().css('opacity');
        equals(opac, '0.5', 'after fadein, scroller opacity should equal 0.5');
        start();
      }, 200);

    }, 1000);
  });

  test('ScrollView-directed scroller fading', function() {
    var view = pane.view('overlaid touch scrollers'),
        verticalScroller = view.get('verticalScrollerView'),
        opac;

    stop(2000);
    expect(2);
    SC.RunLoop.begin();
    view._sc_fadeOutHorizontalScroller();
    view._sc_fadeOutVerticalScroller();
    SC.RunLoop.end();
    setTimeout(function() {
      opac = verticalScroller.$().css('opacity');
      equals(opac, '0', 'after fadeout, scroller opacity should equal zero');
      SC.RunLoop.begin();
      view._sc_fadeInHorizontalScroller();
      view._sc_fadeInVerticalScroller();
      SC.RunLoop.end();
      setTimeout(function() {
        opac = verticalScroller.$().css('opacity');
        equals(opac, '0.5', 'after fadeout, scroller opacity should equal 0.5');
        start();
      }, 200);

    }, 1000);
  });

  test('Scrollers remain visible with horizontalFade: NO, verticalFade: NO', function() {
    var view = pane.view('no fade scrollers'),
        verticalScroller = view.get('verticalScrollerView'),
        horizontalScroller = view.get('horizontalScrollerView'),
        horizontalOpacity,
        verticalOpacity;

    stop(2000);
    expect(2);
    SC.RunLoop.begin();
    view._sc_fadeInHorizontalScroller();
    view._sc_fadeInVerticalScroller();
    SC.RunLoop.end();
    setTimeout(function() {
      verticalOpacity = verticalScroller.$().css('opacity');
      horizontalOpacity = horizontalScroller.$().css('opacity');

      equals(verticalOpacity, '0.5', 'after fadein, vertical scroller opacity should remain 0.5');
      equals(horizontalOpacity, '0.5', 'after fadein, horizontal scroller opacity should remain 0.5');
      start();
    }, 1000);
  });

  test('Adjusting contentView', function() {
    var view = pane.view('basic same size content');

    ok(!view.get('canScrollVertical'), "PRELIM: Can't scroll vertical.");

    SC.run(function() {
      view.contentView.adjust('height', 200);
    });

    ok(view.get('canScrollVertical'), "Can now scroll vertical.");
  });

  test('Replacing contentView', function() {
    var view = pane.view('basic2'),
      newContent;

    // Replacing the content view.
    SC.run(function() {
      newContent = SC.View.create({ backgroundColor: 'blue' });
    });
    equals(newContent.get('viewState'), SC.CoreView.UNRENDERED, 'PRELIM: New view is unrendered');

    SC.run(function() {
      view.set('contentView', newContent);
    });
    ok(view.getPath('containerView.contentView') === newContent, 'New content has been successfully loaded into the container view.');
    equals(newContent.get('viewState'), SC.CoreView.ATTACHED_SHOWN, 'New content has been rendered and attached.');

    // Replacing the content view on an unrendered view.
    SC.run(function() {
      view = SC.ScrollView.create();
      newContent = SC.View.create({ backgroundColor: 'pink' });
      view.set('contentView', newContent);
    });
    ok(view.getPath('containerView.contentView') === newContent, "New content has been successfully loaded into the unrendered view's container view.");

    SC.run(function() {
      view._doRender();
    });
    equals(newContent.get('viewState'), SC.CoreView.ATTACHED_PARTIAL, 'New content renders along with the rest of the view');
  });

})();
