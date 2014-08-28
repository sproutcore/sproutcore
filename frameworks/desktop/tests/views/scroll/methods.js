// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            portions copyright @2011 Apple Inc.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/*global module, test, ok, equals */

var pane, view, view2, view3, view4;
var appleURL = sc_static('images/sproutcore-512.png'); // 'http://photos4.meetupstatic.com/photos/event/4/6/9/9/600_4518073.jpeg';

module("SC.ScrollView", {
  setup: function () {
    SC.run(function () {
      pane = SC.MainPane.create({
        layout: { height: 114, width: 114 }, // Gives us 100x100 container views without worrying about scrollers (or resorting to horrible, counterproductive hacks)
        childViews: [
          // ScrollView with 4000x4000 contentView. "view" below.
          SC.ScrollView.extend({
            contentView: SC.ImageView.design({ value: appleURL, layout: { height: 4000, width: 4000 }})
          }),
          // ScrollView with 2000x2000 contentView. "view2" below.
          SC.ScrollView.extend({
            contentView: SC.ImageView.design({ value: appleURL, layout: { height: 2000, width: 2000 }})
          }),
          // ScrollView (view3 below) with nested ScrollView (view4 below).
          SC.ScrollView.extend({
            layout: { height: 400, width: 400 },
            contentView: SC.View.design({
              layout: { height: 500, width: 500 },
              childViews: [
                SC.ScrollView.design({
                  layout: { height: 200, width: 200, centerX: 0, centerY: 0 },
                  contentView: SC.ImageView.design({ value: appleURL, layout: { height: 300, width: 300 }})
                })
              ]
            })
          })
        ],

        expectedVertLine: function (line) {
          var ret = view.get('verticalLineScroll') * line;
          var alt = view.get('maximumVerticalScrollOffset');
          ret = (ret > alt) ? alt : ret;

          return ret;
        },

        expectedHorzLine: function (line) {
          var ret = view.get('horizontalLineScroll') * line;
          var alt = view.get('maximumHorizontalScrollOffset');
          ret = (ret > alt) ? alt : ret;

          return ret;
        },

        expectedVertPage: function (page) {
          var ret = view.get('verticalPageScroll') * page;
          var alt = view.get('maximumVerticalScrollOffset');
          ret = (ret > alt) ? alt : ret;

          return ret;
        },

        expectedHorzPage: function (page) {
          var ret = view.get('horizontalPageScroll') * page;
          var alt = view.get('maximumHorizontalScrollOffset');
          ret = (ret > alt) ? alt : ret;

          return ret;
        }
      });

      pane.append(); // make sure there is a layer...
    });

    view = pane.childViews[0];

    view2 = pane.childViews[1];

    view3 = pane.childViews[2];
    view4 = view3.get('contentView').get('childViews')[0];
  },

  teardown: function () {
    SC.run(function () {
      pane.destroy();
    });
    pane = view = null;
  }
});


// ------------------------------------
// scrollTo, scrollBy
//

test("Scrolling to a certain co-ordinate of the container view", function () {
  equals(view.get('horizontalScrollOffset'), 0, "Initial horizontal offset must be zero");
  equals(view.get('verticalScrollOffset'), 0, "Initial vertical offset must be zero");

  SC.run(function () {
    view.scrollTo(100, 100);
    equals(view.get('horizontalScrollOffset'), 100, "After scrolling to 100, horizontal offset must be");
    equals(view.get('verticalScrollOffset'), 100, "After scrolling to 100, vertical offset must be");
  });

  SC.run(function () {
    view.scrollTo(5000, 5000);
    equals(view.get('horizontalScrollOffset'), view.get('maximumHorizontalScrollOffset'), "After scrolling to 400, horizontal offset must be maximum");
    equals(view.get('verticalScrollOffset'), view.get('maximumVerticalScrollOffset'), "After scrolling to 400, vertical offset must be maximum");
  });
});

test("Scrolling relative to the current possition of the container view", function () {
  equals(view.get('horizontalScrollOffset'), 0, "Initial horizontal offset must be zero");
  equals(view.get('verticalScrollOffset'), 0, "Initial vertical offset must be zero");

  SC.run(function () {
    view.scrollBy(100, 100);
    equals(view.get('horizontalScrollOffset'), 100, "After scrolling by 100, horizontal offset must be");
    equals(view.get('verticalScrollOffset'), 100, "After scrolling by 100, vertical offset must be");
  });

  SC.run(function () {
    view.scrollBy(100, 100);
    equals(view.get('horizontalScrollOffset'), 200, "After scrolling by 100, horizontal offset must be");
    equals(view.get('verticalScrollOffset'), 200, "After scrolling by 100, vertical offset must be");
  });

  SC.run(function () {
    view.scrollBy(5000, 5000);
    equals(view.get('horizontalScrollOffset'), view.get('maximumHorizontalScrollOffset'), "After scrolling by 400, horizontal offset must be maximum");
    equals(view.get('verticalScrollOffset'), view.get('maximumVerticalScrollOffset'), "After scrolling by 400, vertical offset must be maximum");
  });
});

// ----------------------------------------------
// scrollToRect, scrollToVisible, scrollDownLine
//

test("Scrolling to a rectangle", function () {
  equals(view.get('horizontalScrollOffset'), 0, "Initial horizontal offset must be zero");
  equals(view.get('verticalScrollOffset'), 0, "Initial vertical offset must be zero");

  SC.run(function () {
    view.scrollToRect({ x: 100, y: 100, width: 2000, height: 2000 });
    equals(view.get('horizontalScrollOffset'), 100, "After scrolling to rect, horizontal offset must be 100");
    equals(view.get('verticalScrollOffset'), 100, "After scrolling to rect, vertical offset must be 100");
  });
});

test("Scrolling to a view", function() {
  var pane = SC.MainPane.create({
    childViews: ['scrollView'],
    scrollView: SC.ScrollView.create({
      layout: { height: 100, width: 100 },
      canScale: YES,
      contentView: SC.View.create({
        layout: { height: 500, width: 500 },
        childViews: ['innerView1', 'innerView2'],
        innerView1: SC.View.create({
          layout: { height: 100, width: 100, top: 150, left: 150 }
        }),
        innerView2: SC.View.create({
          layout: { height: 100, width: 100, top: 200, left: 200 }
        })
      })
    })
  });

  var scrollView = pane.scrollView,
    contentView = scrollView.contentView,
    innerView1 = scrollView.contentView.innerView1,
    innerView2 = scrollView.contentView.innerView2;

  SC.run(function() { pane.append(); }); // make sure we have a layer...

  // Test scrolling to views.
  SC.run(function() {
    scrollView.scrollToVisible(innerView1);
  });
  equals(scrollView.get('verticalScrollOffset'), 150, "Scrolling to an inner view at top: 150 should offset the vertical scroll correctly");
  equals(scrollView.get('horizontalScrollOffset'), 150, "Scrolling to an inner view at left: 150 should offset the horizontal scroll correctly");

  SC.run(function() {
    scrollView.scrollToVisible(innerView2);
  });
  equals(scrollView.get('verticalScrollOffset'), 200, "Scrolling to an inner view at top: 200 should offset the vertical scroll correctly");
  equals(scrollView.get('horizontalScrollOffset'), 200, "Scrolling to an inner view at left: 200 should offset the horizontal scroll correctly");

  SC.run(function() {
    scrollView.scrollToVisible(contentView);
  });
  ok(!scrollView.get('horizontalScrollOffset') && !scrollView.get('verticalScrollOffset'), "Scrolling to the contentView itself should return to the upper left.");

  // Test scrolling to views with scale.
  SC.run(function() {
    scrollView.set('scale', 2);
  });
  
  SC.run(function() {
    scrollView.scrollToVisible(innerView1);
  });
  equals(scrollView.get('verticalScrollOffset'), 300, "Scrolling to an inner view at top: 150 with a content scale of 2 should offset the vertical scroll correctly");
  equals(scrollView.get('horizontalScrollOffset'), 300, "Scrolling to an inner view at left: 150 with a content scale of 2 should offset the horizontal scroll correctly");

  SC.run(function() {
    scrollView.scrollToVisible(innerView2);
  });
  equals(scrollView.get('verticalScrollOffset'), 400, "Scrolling to an inner view at top: 200 with a content scale of 2 should offset the vertical scroll correctly");
  equals(scrollView.get('horizontalScrollOffset'), 400, "Scrolling to an inner view at left: 200 with a content scale of 2 should offset the horizontal scroll correctly");

  SC.run(function() {
    scrollView.scrollToVisible(contentView);
  });
  ok(!scrollView.get('horizontalScrollOffset') && !scrollView.get('verticalScrollOffset'), "Scrolling to the contentView itself should return to the upper left (regardless of scale).");

  // Cleanup.
  pane.destroy();
});

test("Scrolling through line by line", function () {
  var line = 3;
  equals(view.get('horizontalScrollOffset'), 0, "Initial horizontal offset must be zero");
  equals(view.get('verticalScrollOffset'), 0, "Initial vertical offset must be zero");
  SC.run(function () {
    view.scrollDownLine(line);
  });
  equals(view.get('horizontalScrollOffset'), 0, "After scrolling down by lines, horizontal offset is unchanged");
  equals(view.get('verticalScrollOffset'), pane.expectedVertLine(line), "After scrolling down by lines, vertical offset must be");
  SC.run(function () {
    view.scrollUpLine(line);
  });
});

// ------------------------------------
// maximum[Horizontal|Vertical]ScrollOffset
//

test("maximumHorizontalScrollOffset() returns the maximum horizontal scroll dimension", function () {
  var old_horizontalScrollOffset = 2;
  var old_verticalScrollOffset = 2;

  SC.run(function () {
    view2.set('horizontalScrollOffset', old_horizontalScrollOffset);
    view2.set('verticalScrollOffset', old_verticalScrollOffset);
    view2.scrollBy(5000, 0);
    equals(view2.get('horizontalScrollOffset'), 1900, 'maximum x coordinate should be 1900');
  });


  SC.run(function () {
    view2.set('horizontalScrollOffset', old_horizontalScrollOffset);
    view2.set('verticalScrollOffset', old_verticalScrollOffset);
    view2.scrollBy(-5000, 0);
    equals(view2.get('horizontalScrollOffset'), 0, 'minimum x coordinate should be 0');
  });

});

test("maximumVerticalScrollOffset() returns the maximum vertical scroll dimension", function () {
  var old_horizontalScrollOffset = 2;
  var old_verticalScrollOffset = 2;

  SC.run(function () {
    view2.set('horizontalScrollOffset', old_horizontalScrollOffset);
    view2.set('verticalScrollOffset', old_verticalScrollOffset);
    view2.scrollBy(0, 5000);
    equals(view2.get('verticalScrollOffset'), 1900, 'maximum y coordinate should be 1900');
  });

  SC.run(function () {
    view2.set('horizontalScrollOffset', old_horizontalScrollOffset);
    view2.set('verticalScrollOffset', old_verticalScrollOffset);
    view2.scrollBy(0, -5000);
  });
  equals(view2.get('verticalScrollOffset'), 0, 'The minimum y coordinate should be 0');

});

// ------------------------------------
// mouseWheel events
//

test("Mouse wheel events should only be captured if the scroll can scroll in the direction (both TOP-LEFT).", function () {
  // FIRST GROUP: everything scrolled all the way to the top left
  SC.run(function () {
    view3.scrollTo(0, 0);
    view4.scrollTo(0, 0);
  });

  // Scrolling further left is not captured by either scroll view
  ok(!view3.mouseWheel({ wheelDeltaX: -10, wheelDeltaY: 0 }), 'The inner scroll view should not capture the mousewheel event since it cannot scroll further.');
  ok(!view4.mouseWheel({ wheelDeltaX: -10, wheelDeltaY: 0 }), 'The outer scroll view should not capture the mousewheel event since it cannot scroll further.');

  // Scrolling further up is not captured by either scroll view
  ok(!view3.mouseWheel({ wheelDeltaX: 0, wheelDeltaY: -10 }), 'The inner scroll view should not capture the mousewheel event since it cannot scroll further.');
  ok(!view4.mouseWheel({ wheelDeltaX: 0, wheelDeltaY: -10 }), 'The outer scroll view should not capture the mousewheel event since it cannot scroll further.');

  // Scrolling down is captured by the target scroll view
  ok(view3.mouseWheel({ wheelDeltaX: 10, wheelDeltaY: 0 }), 'The inner scroll view should capture the mousewheel event since it can scroll further.');
  ok(view4.mouseWheel({ wheelDeltaX: 10, wheelDeltaY: 0 }), 'The outer scroll view should capture the mousewheel event since it can scroll further.');

  // Scrolling right is captured by the target scroll view
  ok(view3.mouseWheel({ wheelDeltaX: 0, wheelDeltaY: 10 }), 'The inner scroll view should capture the mousewheel event since it can scroll further.');
  ok(view4.mouseWheel({ wheelDeltaX: 0, wheelDeltaY: 10 }), 'The outer scroll view should capture the mousewheel event since it can scroll further.');
});

test("Mouse wheel events should only be captured if the scroll can scroll in the direction (both BOTTOM-RIGHT).", function () {
  SC.run(function () {
    view3.scrollTo(114, 114);
    view4.scrollTo(114, 114);
  });

    // Scrolling further right is not captured by either scroll view
  ok(!view3.mouseWheel({ wheelDeltaX: 10, wheelDeltaY: 0 }), 'The inner scroll view should not capture the mousewheel event since it cannot scroll further.');
  ok(!view4.mouseWheel({ wheelDeltaX: 10, wheelDeltaY: 0 }), 'The outer scroll view should not capture the mousewheel event since it cannot scroll further.');

  // Scrolling further down is not captured by either scroll view
  ok(!view3.mouseWheel({ wheelDeltaX: 0, wheelDeltaY: 10 }), 'The inner scroll view should not capture the mousewheel event since it cannot scroll further.');
  ok(!view4.mouseWheel({ wheelDeltaX: 0, wheelDeltaY: 10 }), 'The outer scroll view should not capture the mousewheel event since it cannot scroll further.');

  // Scrolling up is captured by the target scroll view
  ok(view3.mouseWheel({ wheelDeltaX: -10, wheelDeltaY: 0 }), 'The inner scroll view should capture the mousewheel event since it can scroll further.');
  ok(view4.mouseWheel({ wheelDeltaX: -10, wheelDeltaY: 0 }), 'The outer scroll view should capture the mousewheel event since it can scroll further.');

  // Scrolling left is captured by the target scroll view
  ok(view3.mouseWheel({ wheelDeltaX: 0, wheelDeltaY: -10 }), 'The inner scroll view should capture the mousewheel event since it can scroll further.');
  ok(view4.mouseWheel({ wheelDeltaX: 0, wheelDeltaY: -10 }), 'The outer scroll view should capture the mousewheel event since it can scroll further.');
});

test("Mouse wheel events not capturable by the inner scroll should bubble to the outer scroll (scroll right).", function () {
  var elem = view4.get('layer'),
      event;

  SC.run(function () {
    view3.scrollTo(0, 0);
    view4.scrollTo(114, 114);
  });

  window.stop();

  event = SC.Event.simulateEvent(elem, 'mousewheel', { wheelDeltaX: 10, wheelDeltaY: 0 });
  SC.Event.trigger(elem, 'mousewheel', event);

  SC.RunLoop.begin();
  SC.Timer.schedule({ target: this, action: function () {
    equals(view4.get('horizontalScrollOffset'), 114, 'The inner scroll view should still have horizontalScrollOffset');
    equals(view3.get('horizontalScrollOffset'), 10, 'The outer scroll view should now have horizontalScrollOffset');
    window.start();
  }, interval: 200});
  SC.RunLoop.end();
});

test("Mouse wheel events not capturable by the inner scroll should bubble to the outer scroll (scroll down).", function () {
  var elem = view4.get('layer'),
      event;

  SC.run(function () {
    view3.scrollTo(0, 0);
    view4.scrollTo(114, 114);
  });

  window.stop();

  event = SC.Event.simulateEvent(elem, 'mousewheel', { wheelDeltaX: 0, wheelDeltaY: 10 });
  SC.Event.trigger(elem, 'mousewheel', event);

  SC.RunLoop.begin();
  SC.Timer.schedule({ target: this, action: function () {
    equals(view4.get('verticalScrollOffset'), 114, 'The inner scroll view should still have verticalScrollOffset');
    equals(view3.get('verticalScrollOffset'), 10, 'The outer scroll view should now have verticalScrollOffset');
    window.start();
  }, interval: 200});
  SC.RunLoop.end();
});

test("Mouse wheel events not capturable by the inner scroll should bubble to the outer scroll (scroll left).", function () {
  var elem = view4.get('layer'),
      event;

  SC.run(function () {
    view3.scrollTo(114, 114);
    view4.scrollTo(0, 0);

    SC.Timer.schedule({ target: this, action: function () {
      equals(view4.get('horizontalScrollOffset'), 0, 'The inner scroll view should still have horizontalScrollOffset');
      equals(view3.get('horizontalScrollOffset'), 104, 'The outer scroll view should now have horizontalScrollOffset');
      window.start();
    }, interval: 200});
  });

  window.stop();

  event = SC.Event.simulateEvent(elem, 'mousewheel', { wheelDeltaX: -10, wheelDeltaY: 0 });
  SC.Event.trigger(elem, 'mousewheel', event);

});

test("Mouse wheel events not capturable by the inner scroll should bubble to the outer scroll (scroll up).", function () {
  var elem = view4.get('layer'),
      event;

  SC.run(function () {
    view3.scrollTo(114, 114);
    view4.scrollTo(0, 0);
  });

  window.stop();

  event = SC.Event.simulateEvent(elem, 'mousewheel', { wheelDeltaX: 0, wheelDeltaY: -10 });
  SC.Event.trigger(elem, 'mousewheel', event);

  SC.RunLoop.begin();
  SC.Timer.schedule({ target: this, action: function () {
    equals(view4.get('verticalScrollOffset'), 0, 'The inner scroll view should still have verticalScrollOffset');
    equals(view3.get('verticalScrollOffset'), 104, 'The outer scroll view should now have verticalScrollOffset');
    window.start();
  }, interval: 200 });
  SC.RunLoop.end();
});

test("Mouse wheel events capturable by the inner scroll should not bubble to the outer scroll (scroll right).", function () {
  var elem = view4.get('layer'),
      event;

  SC.run(function () {
    view3.scrollTo(0, 0);
    view4.scrollTo(0, 0);
  });

  window.stop();

  event = SC.Event.simulateEvent(elem, 'mousewheel', { wheelDeltaX: 10, wheelDeltaY: 0 });
  SC.Event.trigger(elem, 'mousewheel', event);

  SC.RunLoop.begin();
  SC.Timer.schedule({ target: this, action: function () {
    equals(view4.get('horizontalScrollOffset'), 10, 'The inner scroll view should now have horizontalScrollOffset');
    equals(view3.get('horizontalScrollOffset'), 0, 'The outer scroll view should still have horizontalScrollOffset');
    window.start();
  }, interval: 200 });
  SC.RunLoop.end();
});

test("Mouse wheel events capturable by the inner scroll should not bubble to the outer scroll (scroll up).", function () {
  var elem = view4.get('layer'),
      event;

  SC.run(function () {
    view3.scrollTo(114, 114);
    view4.scrollTo(114, 114);
  });

  window.stop();

  event = SC.Event.simulateEvent(elem, 'mousewheel', { wheelDeltaX: 0, wheelDeltaY: -10 });
  SC.Event.trigger(elem, 'mousewheel', event);

  SC.RunLoop.begin();
  SC.Timer.schedule({ target: this, action: function () {
    equals(view4.get('verticalScrollOffset'), 104, 'The inner scroll view should now have verticalScrollOffset');
    equals(view3.get('verticalScrollOffset'), 114, 'The outer scroll view should still have verticalScrollOffset');
    window.start();
  }, interval: 200 });
  SC.RunLoop.end();
});

test("Mouse wheel events capturable by the inner scroll should not bubble to the outer scroll (scroll left).", function () {
  var elem = view4.get('layer'),
      event;

  SC.run(function () {
    view3.scrollTo(114,  114);
    view4.scrollTo(114,  114);
  });

  window.stop();

  event = SC.Event.simulateEvent(elem, 'mousewheel', { wheelDeltaX: -10, wheelDeltaY: 0 });
  SC.Event.trigger(elem, 'mousewheel', event);

  SC.RunLoop.begin();
  SC.Timer.schedule({ target: this, action: function () {
    equals(view4.get('horizontalScrollOffset'), 104, 'The inner scroll view should now have horizontalScrollOffset');
    equals(view3.get('horizontalScrollOffset'), 114, 'The outer scroll view should still have horizontalScrollOffset');
    window.start();
  }, interval: 200 });
  SC.RunLoop.end();
});

test("Mouse wheel events capturable by the inner scroll should not bubble to the outer scroll (scroll down).", function () {
  var elem = view4.get('layer'),
      event;

  SC.run(function () {
    view3.scrollTo(0, 0);
    view4.scrollTo(0, 0);
  });

  window.stop();

  event = SC.Event.simulateEvent(elem, 'mousewheel', { wheelDeltaX: 0, wheelDeltaY: 10 });
  SC.Event.trigger(elem, 'mousewheel', event);

  SC.RunLoop.begin();
  SC.Timer.schedule({ target: this, action: function () {
    equals(view4.get('verticalScrollOffset'), 10, 'The inner scroll view should now have verticalScrollOffset');
    equals(view3.get('verticalScrollOffset'), 0, 'The outer scroll view should still have verticalScrollOffset');
    window.start();
  }, interval: 200 });
  SC.RunLoop.end();
});

// ------------------------------------
// scale
//

test("Setting scale on ScrollView", function() {
  // canScale: NO
  SC.run(function() {
    view.set('scale', 0.8);
  });
  equals(view.get('scale'), 1, "Setting scale on a ScrollView with canScale: NO doesn't change scale.");

  // canScale: YES
  SC.run(function() {
    view.set('canScale', YES);
    view.set('scale', 0.8);
  });
  equals(view.get('scale'), 0.8, "Setting scale on a ScrollView with canScale: YES changes scale");

  // Exceeding min
  SC.run(function() {
    view.set('scale', -100);
  });
  equals(view.get('scale'), view.get('minimumScale'), "Scale is constrained by minimumScale");

  // Exceeding max
  SC.run(function() {
    view.set('scale', 100);
  });
  equals(view.get('scale'), view.get('maximumScale'), "Scale is constrained by maximumScale");

});

test("Setting scale on ScrollView with SC.Scalable contentView", function() {
  var contentView = view.get('contentView'),
      didCall, withScale;

  // Patch in SC.Scalable support.
  contentView.isScalable = YES;
  contentView.applyScale = function(scale) {
    didCall = YES;
    withScale = scale;
  };

  SC.run(function() {
    view.set('canScale', YES);
    view.set('scale', 0.8);
  });
  ok(didCall, "Setting scale on ScrollView with SC.Scalable contentView calls contentView.applyScale.");
  equals(withScale, 0.8, "Setting scale on ScrollView with SC.Scalable contentView passes the correct scale to contentView.applyScale");
});


