// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            portions copyright @2011 Apple Inc.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/*global module, test, ok, equals */

var pane;
var imageUrl = sc_static('images/sproutcore-512.png'); // 'http://photos4.meetupstatic.com/photos/event/4/6/9/9/600_4518073.jpeg';

var scrollViewOriginalHeight = 1000;
var scrollViewOriginalWidth = 2000;

var contentViewOriginalHeight = 4000;
var contentViewOriginalWidth = 4000;

var pane = SC.ControlTestPane.design()
  .add("scrollView with content view of fixed height", SC.ScrollView.design({
    // ScrollView with 4000x4000 contentView
    layout: { top: 0, left: 0, height: scrollViewOriginalHeight, width: scrollViewOriginalWidth },
    contentView: SC.ImageView.design({ value: imageUrl, layout: { height: contentViewOriginalHeight, width: contentViewOriginalWidth }}),

    canScale: YES,
    minimumScale: 0.01,
    maximumScale: 100
  }))
  .add("scrollview with content view attached to top and bottom", SC.ScrollView.design({
    // ScrollView with 4000x4000 contentView
    layout: { top: 0, left: 0, height: scrollViewOriginalHeight, width: scrollViewOriginalWidth },
    contentView: SC.ImageView.design({ value: imageUrl, layout: { top: 0, bottom: 0, width: contentViewOriginalWidth }}),

    canScale: YES,
    minimumScale: 0.01,
    maximumScale: 100
  }))
  .add("scrollView with content view of fixed height center-center-aligned", SC.ScrollView.design({
    // ScrollView with 4000x4000 contentView
    layout: { top: 0, left: 0, height: scrollViewOriginalHeight, width: scrollViewOriginalWidth },
    contentView: SC.ImageView.design({ value: imageUrl, layout: { height: contentViewOriginalHeight, width: contentViewOriginalWidth }}),

    canScale: YES,
    minimumScale: 0.01,
    maximumScale: 100,

    horizontalAlign: SC.ALIGN_CENTER,
    verticalAlign: SC.ALIGN_MIDDLE
  }))
  .add("scrollView with content view of fixed height bottom-right-aligned", SC.ScrollView.design({
    // ScrollView with 4000x4000 contentView
    layout: { top: 0, left: 0, height: scrollViewOriginalHeight, width: scrollViewOriginalWidth },
    contentView: SC.ImageView.design({ value: imageUrl, layout: { height: contentViewOriginalHeight, width: contentViewOriginalWidth }}),

    canScale: YES,
    minimumScale: 0.01,
    maximumScale: 100,

    horizontalAlign: SC.ALIGN_RIGHT,
    verticalAlign: SC.ALIGN_BOTTOM
  }))
  .add("scrollView with content view of fixed height and bottom-right initial alignment", SC.ScrollView.design({
    // ScrollView with 4000x4000 contentView
    layout: { top: 0, left: 0, height: scrollViewOriginalHeight, width: scrollViewOriginalWidth },
    contentView: SC.ImageView.design({ value: imageUrl, layout: { height: contentViewOriginalHeight, width: contentViewOriginalWidth }}),

    canScale: YES,
    minimumScale: 0.01,
    maximumScale: 100,

    initialHorizontalAlign: SC.ALIGN_RIGHT,
    initialVerticalAlign: SC.ALIGN_BOTTOM
  }))

module("SC.ScrollView", {
  setup: function () {
    pane.standardSetup().setup();
  },

  teardown: function () {
    pane.standardSetup().teardown();
  }
});

// ------------------------------
// BASIC
// 

test('Initial values of scale and horizontal offsets are good', function () {
  var scrollView = pane.view('scrollView with content view of fixed height');

  equals(scrollView.get('scale'), 1, 'Initial scale is 1');

  equals(scrollView.get('horizontalScrollOffset'), 0, 'Initial horizontal offset must be zero');
  equals(scrollView.get('verticalScrollOffset'), 0, 'Initial vertical offset must be zero');
});

test("Content view is scaled based on scroll view's scale property", function() {
  var scrollView = pane.view('scrollView with content view of fixed height'),
    contentView = scrollView.get('contentView');

  SC.run(function() {
    scrollView.set('scale', 0.1);
  });

  equals(scrollView.get('scale'), 0.1, 'Scale has been updated to 0.1');

  equals(contentView.getPath('frame.width'), 0.1 * contentViewOriginalWidth, "Content view's width is scaled smaller based on scroll view's scale");
  equals(contentView.getPath('frame.height'), 0.1 * contentViewOriginalHeight, "Content view's height is scaled smaller based on scroll view's scale");

  SC.run(function() {
    scrollView.set('scale', 10);
  });

  equals(scrollView.get('scale'), 10, 'Scale has been updated to 10');

  equals(contentView.getPath('frame.width'), 10 * contentViewOriginalWidth, "Content view's width is scaled larger based on scroll view's scale");
  equals(contentView.getPath('frame.height'), 10 * contentViewOriginalHeight, "Content view's height is scaled larger based on scroll view's scale");

});

// ------------------------------
// Fully visible - static
// 

test('When contentView is fully visible, it is positioned according to horizontalAlign', function() {
  var scrollView = pane.view('scrollView with content view of fixed height'),
    containerView = scrollView.get('containerView'),
    contentView = scrollView.get('contentView');

  SC.run(function() {
    scrollView.set('scale', 0.1);
  });

  SC.run(function() {
    scrollView.set('horizontalAlign', SC.ALIGN_LEFT);
    scrollView._scsv_adjustElementScroll(); // This method is PRIVATE. (Called here to cheat, synchronously testing an asynchronous operation.)
  });

  equals(contentView.getPath('frame.x'), 0, "Content view's x offset is 0 when horizontalAlign is set to SC.ALIGN_LEFT");

  SC.run(function() {
    scrollView.set('horizontalAlign', SC.ALIGN_CENTER);
    scrollView._scsv_adjustElementScroll(); // This method is PRIVATE. (Called here to cheat, synchronously testing an asynchronous operation.)
  });

  var expectedContentViewOffsetX = (containerView.getPath('frame.width') - contentView.getPath('frame.width')) / 2;
  expectedContentViewOffsetX = Math.round(expectedContentViewOffsetX);

  equals(contentView.getPath('frame.x'), expectedContentViewOffsetX, "Content view is centered when horizontalAlign is set to SC.ALIGN_CENTER");

  SC.run(function() {
    scrollView.set('horizontalAlign', SC.ALIGN_RIGHT);
    scrollView._scsv_adjustElementScroll(); // This method is PRIVATE. (Called here to cheat, synchronously testing an asynchronous operation.)
  });

  expectedContentViewOffsetX = containerView.getPath('frame.width') - contentView.getPath('frame.width');
  expectedContentViewOffsetX = Math.round(expectedContentViewOffsetX);

  equals(contentView.getPath('frame.x'), expectedContentViewOffsetX, "Content view is aligned right when horizontalAlign is set to SC.ALIGN_RIGHT");
});

test('When contentView is fully visible, it is positioned according to verticalAlign', function() {
  var scrollView = pane.view('scrollView with content view of fixed height'),
    containerView = scrollView.get('containerView'),
    contentView = scrollView.get('contentView');

  SC.run(function() {
    scrollView.set('scale', 0.1);
  });

  SC.run(function() {
    scrollView.set('verticalAlign', SC.ALIGN_TOP);
    scrollView._scsv_adjustElementScroll(); // This method is PRIVATE. (Called here to cheat, synchronously testing an asynchronous operation.)
  });

  equals(contentView.getPath('frame.y'), 0, "Content view's y offset is 0 when verticalAlign is set to SC.ALIGN_TOP");

  SC.run(function() {
    scrollView.set('verticalAlign', SC.ALIGN_MIDDLE);
    scrollView._scsv_adjustElementScroll(); // This method is PRIVATE. (Called here to cheat, synchronously testing an asynchronous operation.)
  });

  var expectedContentViewOffsetX = (containerView.getPath('frame.height') - contentView.getPath('frame.height')) / 2;
  expectedContentViewOffsetX = Math.round(expectedContentViewOffsetX);

  equals(contentView.getPath('frame.y'), expectedContentViewOffsetX, "Content view is centered when verticalAlign is set to SC.ALIGN_MIDDLE");

  SC.run(function() {
    scrollView.set('verticalAlign', SC.ALIGN_BOTTOM);
    scrollView._scsv_adjustElementScroll(); // This method is PRIVATE. (Called here to cheat, synchronously testing an asynchronous operation.)
  });

  expectedContentViewOffsetX = containerView.getPath('frame.height') - contentView.getPath('frame.height');
  expectedContentViewOffsetX = Math.round(expectedContentViewOffsetX);

  equals(contentView.getPath('frame.y'), expectedContentViewOffsetX, "Content view is aligned to the bottom when verticalAlign is set to SC.ALIGN_BOTTOM");
});

// ------------------------------
// Zoomed in - static
// 

test('When zoomed into the contentView, the content view should be placed at the top left', function() {
  var scrollView = pane.view('scrollView with content view of fixed height'),
    contentView = scrollView.get('contentView');

  SC.run(function() {
    scrollView.set('scale', 10);
  });

  equals(contentView.getPath('frame.x'), 0, "Content view left offset is 0 when zoomed into contentView");
  equals(contentView.getPath('frame.y'), 0, "Content view top offset is 0 when zoomed into contentView");
});

// ------------------------------
// Zooming in
// 

test('When zoomed into the contentView, the horizontal offset should stick to minimum if it was previously set to minimum', function() {
  var scrollView = pane.view('scrollView with content view of fixed height');

  // first, zoom in a bit and set the horizontal offset to minimum
  SC.run(function() {
    scrollView.set('scale', 10);
    scrollView.set('horizontalScrollOffset', scrollView.get('minimumHorizontalScrollOffset'));
  });

  // verify that the horizontal offset is minimum

  equals(scrollView.get('horizontalScrollOffset'), scrollView.get('minimumHorizontalScrollOffset'), 'Horizontal offset is at minimum after setting it to be thus');

  // now, zoom in a bit more and make sure it's still minimum

  SC.run(function() {
    scrollView.set('scale', 11);
  });

  equals(scrollView.get('horizontalScrollOffset'), scrollView.get('minimumHorizontalScrollOffset'), 'Horizontal offset is still at minimum after scaling');
});

test('When zoomed into the contentView, the horizontal offset should stick to maximum if it was previously set to maximum', function() {
  var scrollView = pane.view('scrollView with content view of fixed height');

  // first, zoom in a bit and set the horizontal offset to maximum
  SC.run(function() {
    scrollView.set('scale', 10);
    scrollView.scrollTo(scrollView.get('maximumHorizontalScrollOffset'));
  });

  // verify that the horizontal offset is maximum

  equals(scrollView.get('horizontalScrollOffset'), scrollView.get('maximumHorizontalScrollOffset'), 'Horizontal offset is at maximum after setting it to be thus');

  // now, zoom in a bit more and make sure it's still maximum

  SC.run(function() {
    scrollView.set('scale', 11);
  });

  equals(scrollView.get('horizontalScrollOffset'), scrollView.get('maximumHorizontalScrollOffset'), 'Horizontal offset is still at maximum after scaling');
});

test('When zoomed into the contentView, the vertical offset should stick to minimum if it was previously set to minimum', function() {
  var scrollView = pane.view('scrollView with content view of fixed height');

  // first, zoom in a bit and set the vertical offset to minimum
  SC.run(function() {
    scrollView.set('scale', 10);
    scrollView.scrollTo(null, scrollView.get('minimumVerticalScrollOffset'));
  });

  // verify that the vertical offset is minimum

  equals(scrollView.get('verticalScrollOffset'), scrollView.get('minimumVerticalScrollOffset'), 'Vertical offset is at minimum after setting it to be thus');

  // now, zoom in a bit more and make sure it's still minimum

  SC.run(function() {
    scrollView.set('scale', 11);
  });

  equals(scrollView.get('verticalScrollOffset'), scrollView.get('minimumVerticalScrollOffset'), 'Vertical offset is still at minimum after scaling');
});

test('When zoomed into the contentView, the vertical offset should stick to maximum if it was previously set to maximum', function() {
  var scrollView = pane.view('scrollView with content view of fixed height');

  // first, zoom in a bit and set the vertical offset to maximum
  SC.run(function() {
    scrollView.set('scale', 10);
    scrollView.scrollTo(null, scrollView.get('maximumVerticalScrollOffset'));
  });

  // verify that the vertical offset is maximum

  equals(scrollView.get('verticalScrollOffset'), scrollView.get('maximumVerticalScrollOffset'), 'Vertical offset is at maximum after setting it to be thus');

  // now, zoom in a bit more and make sure it's still maximum

  SC.run(function() {
    scrollView.set('scale', 11);
  });

  equals(scrollView.get('verticalScrollOffset'), scrollView.get('maximumVerticalScrollOffset'), 'Vertical offset is still at maximum after scaling');
});

// ---------------------------------------------------
// Zooming in from fully-visible with fresh view
// 

test("Zooming from fully-visible to clipped with different alignments", function() {

  // TOP & LEFT
  var scrollView = pane.view('scrollView with content view of fixed height');

  SC.run(function() {
    scrollView.set('scale', 0.1);
  });
  SC.run(function() {
    scrollView.set('scale', 10);
  });
  equals(scrollView.get('horizontalScrollOffset'), 0, "Scaling a fresh left-aligned view in from fully-visible aligns it to the left");
  equals(scrollView.get('verticalScrollOffset'), 0, "Scaling a fresh top-aligned view in from fully-visible aligns it to the top")

  // CENTER
  scrollView = pane.view('scrollView with content view of fixed height center-center-aligned');

  SC.run(function() {
    scrollView.set('scale', 0.1);
  });
  SC.run(function() {
    scrollView.set('scale', 10);
  });
  equals(scrollView.get('horizontalScrollOffset'), (scrollView.get('maximumHorizontalScrollOffset')) / 2, "Scaling a fresh horizontally-center-aligned view in from fully-visible aligns it to the center");
  equals(scrollView.get('verticalScrollOffset'), (scrollView.get('maximumVerticalScrollOffset')) / 2, "Scaling a fresh vertically-middle-aligned view in from fully-visible aligns it to the center")

  // BOTTOM & RIGHT
  scrollView = pane.view('scrollView with content view of fixed height bottom-right-aligned');

  SC.run(function() {
    scrollView.set('scale', 0.1);
  });
  SC.run(function() {
    scrollView.set('scale', 10);
  });
  equals(scrollView.get('horizontalScrollOffset'), scrollView.get('maximumHorizontalScrollOffset'), "Scaling a fresh right-aligned view in from fully-visible aligns it to the right");
  equals(scrollView.get('verticalScrollOffset'), scrollView.get('maximumVerticalScrollOffset'), "Scaling a fresh bottom-aligned view in from fully-visible aligns it to the bottom")
});

test("Initial alignments different than alignments", function() {
  // This view is aligned top-left but with initial position at bottom-right. It should start at maximum offsets; when
  // scaled out it should instead pin to the minimum offsets.
  var view = pane.view('scrollView with content view of fixed height and bottom-right initial alignment');
  equals(view.get('horizontalScrollOffset'), view.get('maximumHorizontalScrollOffset'), "initialHorizontalAlign correctly informs initial position when not scaled out");
  equals(view.get('verticalScrollOffset'), view.get('maximumVerticalScrollOffset'), "initialVerticalAlign correctly informs initial position when not scaled out");

  SC.run(function() {
    view.set('scale', 0.1);
  });
  equals(view.get('horizontalScrollOffset'), view.get('minimumHorizontalScrollOffset'), "horizontalAlign correctly takes over from initialHorizontalAlign when scaled out");
  equals(view.get('verticalScrollOffset'), view.get('minimumVerticalScrollOffset'), "verticalAlign correctly takes over from initialVerticalAlign when scaled out");

});
