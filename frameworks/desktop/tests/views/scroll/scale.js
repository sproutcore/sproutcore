// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            portions copyright @2011 Apple Inc.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/*global module, test, ok, equals */

var pane, scrollView, containerView, contentView;
var imageUrl = sc_static('images/sproutcore-512.png'); // 'http://photos4.meetupstatic.com/photos/event/4/6/9/9/600_4518073.jpeg';

var scrollViewOriginalHeight = 1000;
var scrollViewOriginalWidth = 2000;

var contentViewOriginalHeight = 4000;
var contentViewOriginalWidth = 4000;

module("SC.ScrollView", {
  setup: function () {
    SC.run(function () {
      pane = SC.MainPane.create({
        childViews: [
          // ScrollView with 4000x4000 contentView. "view" below.
          SC.ScrollView.extend({
            layout: { top: 0, left: 0, height: scrollViewOriginalHeight, width: scrollViewOriginalWidth },
            contentView: SC.ImageView.design({ value: imageUrl, layout: { height: contentViewOriginalHeight, width: contentViewOriginalWidth }}),

            canScale: YES,

            minimumScale: 0.01,
            maximumScale: 100

          })
        ]
      });

      pane.append(); // make sure there is a layer...
    });

    scrollView = pane.childViews[0];
    containerView = scrollView.get('containerView');
    contentView = scrollView.get('contentView');
  },

  teardown: function () {
    SC.run(function () {
      pane.destroy();
    });
    pane = null;
  }
});


test('Initial values of scale and horizontal offsets are good', function () {
  equals(scrollView.get('scale'), 1, 'Initial scale is 1');

  equals(scrollView.get('horizontalScrollOffset'), 0, 'Initial horizontal offset must be zero');
  equals(scrollView.get('verticalScrollOffset'), 0, 'Initial vertical offset must be zero');
});

test("Content view is scaled based on scroll view's scale property", function() {
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

test('When contentView is fully visible, it is positioned according to horizontalAlign', function() {
  SC.run(function() {
    scrollView.set('scale', 0.1);
  });

  SC.run(function() {
    scrollView.set('horizontalAlign', SC.ALIGN_LEFT);
  });

  equals(contentView.getPath('frame.x'), 0, "Content view's x offset is 0 when horizontalAlign is set to SC.ALIGN_LEFT");

  SC.run(function() {
    scrollView.set('horizontalAlign', SC.ALIGN_CENTER);
  });

  var expectedContentViewOffsetX = (containerView.getPath('frame.width') - contentView.getPath('frame.width')) / 2;
  expectedContentViewOffsetX = Math.round(expectedContentViewOffsetX);

  equals(contentView.getPath('frame.x'), expectedContentViewOffsetX, "Content view is centered when horizontalAlign is set to SC.ALIGN_CENTER");

  SC.run(function() {
    scrollView.set('horizontalAlign', SC.ALIGN_RIGHT);
  });

  expectedContentViewOffsetX = containerView.getPath('frame.width') - contentView.getPath('frame.width');
  expectedContentViewOffsetX = Math.round(expectedContentViewOffsetX);

  equals(contentView.getPath('frame.x'), expectedContentViewOffsetX, "Content view is aligned right when horizontalAlign is set to SC.ALIGN_RIGHT");
});

test('When contentView is fully visible, it is positioned according to verticalAlign', function() {
  SC.run(function() {
    scrollView.set('scale', 0.1);
  });

  SC.run(function() {
    scrollView.set('verticalAlign', SC.ALIGN_TOP);
  });

  equals(contentView.getPath('frame.y'), 0, "Content view's y offset is 0 when verticalAlign is set to SC.ALIGN_TOP");

  SC.run(function() {
    scrollView.set('verticalAlign', SC.ALIGN_MIDDLE);
  });

  var expectedContentViewOffsetX = (containerView.getPath('frame.height') - contentView.getPath('frame.height')) / 2;
  expectedContentViewOffsetX = Math.round(expectedContentViewOffsetX);

  equals(contentView.getPath('frame.y'), expectedContentViewOffsetX, "Content view is centered when verticalAlign is set to SC.ALIGN_MIDDLE");

  SC.run(function() {
    scrollView.set('verticalAlign', SC.ALIGN_BOTTOM);
  });

  expectedContentViewOffsetX = containerView.getPath('frame.height') - contentView.getPath('frame.height');
  expectedContentViewOffsetX = Math.round(expectedContentViewOffsetX);

  equals(contentView.getPath('frame.y'), expectedContentViewOffsetX, "Content view is aligned to the bottom when verticalAlign is set to SC.ALIGN_BOTTOM");
});

test('When zoomed into the contentView, the content view should be placed at the top left', function() {
  SC.run(function() {
    scrollView.set('scale', 10);
  });

  equals(contentView.getPath('frame.x'), 0, "Content view left offset is 0 when zoomed into contentView");
  equals(contentView.getPath('frame.y'), 0, "Content view top offset is 0 when zoomed into contentView");
});

test('When zoomed into the contentView, the horizontal offset should stick to minimum if it was previously set to minimum', function() {
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
  // first, zoom in a bit and set the horizontal offset to maximum
  SC.run(function() {
    scrollView.set('scale', 10);
    scrollView.set('horizontalScrollOffset', scrollView.get('maximumHorizontalScrollOffset'));
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
  // first, zoom in a bit and set the vertical offset to minimum
  SC.run(function() {
    scrollView.set('scale', 10);
    scrollView.set('verticalScrollOffset', scrollView.get('minimumVerticalScrollOffset'));
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
  // first, zoom in a bit and set the vertical offset to maximum
  SC.run(function() {
    scrollView.set('scale', 10);
    scrollView.set('verticalScrollOffset', scrollView.get('maximumVerticalScrollOffset'));
  });

  // verify that the vertical offset is maximum

  equals(scrollView.get('verticalScrollOffset'), scrollView.get('maximumVerticalScrollOffset'), 'Vertical offset is at maximum after setting it to be thus');

  // now, zoom in a bit more and make sure it's still maximum

  SC.run(function() {
    scrollView.set('scale', 11);
  });

  equals(scrollView.get('verticalScrollOffset'), scrollView.get('maximumVerticalScrollOffset'), 'Vertical offset is still at maximum after scaling');
});

test('When zooming out from the contentView being fully visible to only partially visible, the center of the contentView should be displayed', function() {
  // first, set to the scale to be pretty low, so that all of the content view is visible
  SC.run(function() {
    scrollView.set('scale', 0.1);
  });

  SC.run(function() {
    scrollView.set('scale', 10);
  });

  // the center of the contentView be the same the center of the container view frame (visible area)
  equals(SC.midX(contentView.get('frame')), SC.midX(containerView.get('frame')), 'The center X of the content view is at the center of the container view');
  equals(SC.midY(contentView.get('frame')), SC.midY(containerView.get('frame')), 'The center Y of the content view is at the center of the container view');
});

test('When zooming out, the center of the contentView should be displayed', function() {
  // first, set to the scale to be pretty low, so that all of the content view is visible
  SC.run(function() {
    scrollView.set('scale', 10);
    scrollView.set('horizontalScrollOffset', 2100);
    scrollView.set('verticalScrollOffset', 2100);
  });

  // Figure out the "middle" of the currently visible part of the contentView.
  // This is done by getting the middle of the container frame, and determining percentage of this
  // middle relative to the content view.
  var contentViewFrame = contentView.get('frame');
  var containerViewFrameInContentView = contentView.convertFrameFromView(containerView.get('frame'), containerView.get('parentView'));

  var oldHorizontalScrollMidpointPercent = SC.midX(containerViewFrameInContentView) / contentViewFrame.width;
  var oldVerticalScrollMidpointPercent = SC.midY(containerViewFrameInContentView) / contentViewFrame.height;

  SC.run(function() {
    scrollView.set('scale', 20);
  });

  // Compute the new "middle" of the currently visible part of the contentView.
  contentViewFrame = contentView.get('frame');
  containerViewFrameInContentView = contentView.convertFrameFromView(containerView.get('frame'), containerView.get('parentView'));

  var newHorizontalScrollMidpointPercent = SC.midX(containerViewFrameInContentView) / contentViewFrame.width;
  var newVerticalScrollMidpointPercent = SC.midY(containerViewFrameInContentView) / contentViewFrame.height;

  // the values should've remained the same
  equals(newHorizontalScrollMidpointPercent, oldHorizontalScrollMidpointPercent, 'The center X of the horizontal scroll remained the same');
  equals(newVerticalScrollMidpointPercent, oldVerticalScrollMidpointPercent, 'The center Y of the horizontal scroll remained the same');

});
