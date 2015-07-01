// ==========================================================================
// Project:   SC.MenuScrollView Unit Test
// Copyright: ©2006-2011 Strobe Inc. and contributors.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================
/*globals SC, module, test, ok, equals */

var view, pane;
module("Menu Scroll View", {
  setup: function () {
    SC.RunLoop.begin();

    var content = ['Dogfish Head',
                   'Delerium',
                   'Smuttynose',
                   'Harpoon',
                   'Bitburger',
                   'Goose Island',
                   'Old Speckled Hen',
                   'Fuller\'s',
                   'Anchor',
                   'Brooklyn',
                   'Lagunitas',
                   'Coney Island'];

    view = SC.MenuScrollView.create({
      layout: { top: 100, left: 20, height: 100, width: 100 },
      contentView: SC.SourceListView.design({
        content: content
      })
    });

    pane = SC.MainPane.create();
    pane.appendChild(view);
    pane.append();

    SC.RunLoop.end();
  },

  teardown: function () {
    SC.RunLoop.begin();
    pane.remove();
    pane.destroy();
    SC.RunLoop.end();
  }
});

test("menu scroll views cannot scroll horizontally", function () {
  ok(!view.get('hasHorizontalScroller'),
     "the horizontal scroller doesn't exist");
  ok(!view.get('canScrollHorizontal'), "The view cannot scroll horizontally.");
});

test("menu scrollers not visible when content doesn't fill the container", function () {
  SC.RunLoop.begin();
  view.setPath('contentView.content', []);
  SC.RunLoop.end();

  ok(view.get('hasVerticalScroller'), "the vertical scrollers should exist");
  equals(view.getPath('topScrollerView.isVisible'), NO,
         "the top vertical scroller shouldn't be visible");
  equals(view.getPath('bottomScrollerView.isVisible'), NO,
         "the bottom vertical scroller shouldn't be visible");
});

test("initially, only the bottom menu scroller should be visible", function () {
  equals(view.getPath('topScrollerView.isVisible'), NO,
         "the top scroller shouldn't be visible");
  equals(view.getPath('bottomScrollerView.isVisible'), YES,
         "the bottom scroller should be visible");
});

// ..........................................................
// autohidesVerticalScrollers => YES
//

// Top scroller visibility
test("when setting `verticalScrollOffset` to anywhere before the scroller thickness, the top scroller will become invisible", function () {
  SC.run(function () {
    view.scrollTo(0, 50);
  });

  ok(view.getPath('topScrollerView.isVisible'),
     "top scroller should be visible 1");

  SC.run(function () {
    view.scrollTo(0, view.getPath('topScrollerView.scrollerThickness'));
  });
  equals(view.get('verticalScrollOffset'), 0,
         "view should be at 0px scroll offset");
  ok(!view.getPath('topScrollerView.isVisible'),
     "top scroller should NOT be visible");

  SC.run(function () {
    view.scrollTo(0, 50);
  });
  ok(view.getPath('topScrollerView.isVisible'),
     "top scroller should be visible 2");

  SC.run(function () {
    view.scrollTo(0, view.getPath('topScrollerView.scrollerThickness') + 1);
  });
  ok(view.getPath('topScrollerView.isVisible'),
     "top scroller should be visible 3");

  SC.run(function () {
    view.scrollTo(0, 50);
  });
  ok(view.getPath('topScrollerView.isVisible'),
     "top scroller should be visible 4");

  SC.run(function () {
    view.scrollTo(0, view.getPath('topScrollerView.scrollerThickness') - 1);
  });
  ok(!view.getPath('topScrollerView.isVisible'),
     "top scroller should NOT be visible");
});

// Bottom scroller visibility
test("when setting `verticalScrollOffset` to anywhere before the scroller thickness, the bottom scroller will become invisible", function () {
  var max = view.get('maximumVerticalScrollOffset');
  ok(view.getPath('bottomScrollerView.isVisible'),
     "bottom scroller should be visible 1");

  // @ bottom
  SC.run(function () {
    view.scrollTo(0, max);
  });
  ok(!view.getPath('bottomScrollerView.isVisible'),
     "bottom scroller should NOT be visible");

  SC.run(function () {
    view.scrollTo(0, 0);
  });
  ok(view.getPath('bottomScrollerView.isVisible'),
     "bottom scroller should be visible 2");

  // just enough so bottom is invisible
  SC.run(function () {
    view.scrollTo(0, max - view.getPath('bottomScrollerView.scrollerThickness') - 1);
  });
  ok(view.getPath('bottomScrollerView.isVisible'),
     "bottom scroller should be visible 3");

  SC.run(function () {
    view.scrollTo(0, 0);
  });
  ok(view.getPath('bottomScrollerView.isVisible'),
     "bottom scroller should be visible 4");

  // exactly enough for bottom to be invisible
  SC.run(function () {
    view.scrollTo(0, max - view.getPath('bottomScrollerView.scrollerThickness'));
  });
  ok(!view.getPath('bottomScrollerView.isVisible'),
     "bottom scroller should NOT be visible");

  SC.run(function () {
    view.scrollTo(0, 0);
  });
  ok(view.getPath('bottomScrollerView.isVisible'),
     "bottom scroller should be visible 5");

  // more than enough for bottom to be invisible
  SC.run(function () {
    view.scrollTo(0, max - view.getPath('bottomScrollerView.scrollerThickness') + 1);
  });
  ok(!view.getPath('bottomScrollerView.isVisible'),
     "bottom scroller should NOT be visible");
});

test("when the top scroller becomes visible, the vertical scroll offset is adjusted by the scroller thickness", function () {
  SC.run(function () {
    view.scrollBy(0, 1);
  });

  var thickness = view.getPath('topScrollerView.scrollerThickness');

  // check for adjustment
  equals(view.get('verticalScrollOffset'),
         1 + thickness,
         "the offset should be the scroller thickness + 1");

  // shouldn't adjust this time
  SC.run(function () {
    view.scrollBy(0, 1);
  });
  equals(view.get('verticalScrollOffset'),
         2 + thickness,
         "the offset should be the scroller thickness + 2");

  // shouldn't adjust this time
  SC.run(function () {
    view.scrollBy(0, -1);
  });
  equals(view.get('verticalScrollOffset'),
         1 + thickness,
         "the offset should be the scroller thickness + 1");

  // check for adjustment
  SC.run(function () {
    view.scrollBy(0, -1);
  });
  equals(view.get('verticalScrollOffset'), 0,
         "the offset should be 0px");
});
