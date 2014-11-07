// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Apple Inc. and contributors.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/*global module, test, equals, ok */

module("SC.View.prototype.layoutDidChange");

test("notifies layoutStyle & frame change", function () {

  var view = SC.View.create();
  var layoutStyleCallCount = 0, frameCallCount = 0;

  view.addObserver('layoutStyle', function () { layoutStyleCallCount++; });
  view.addObserver('frame', function () { frameCallCount++; });

  SC.run(function () {
    // Manually indicate a layout change.
    view.layoutDidChange();
  });

  equals(frameCallCount, 1, 'should trigger observers for frame');
  equals(layoutStyleCallCount, 0, 'should not trigger observers for layoutStyle');

  // Attach to the document.
  var parent = SC.Pane.create();
  parent.append();
  parent.appendChild(view);

  equals(frameCallCount, 2, 'should trigger observers for frame when attached to the document');
  equals(layoutStyleCallCount, 0, 'should still not trigger observers for layoutStyle');

  SC.run(function () {
    view.adjust('top', 20);
  });

  equals(frameCallCount, 3, 'should trigger observers for frame when attached to the document');
  equals(layoutStyleCallCount, 1, 'should trigger observers for layoutStyle');

  // Clean up.
  view.destroy();
  parent.destroy();
});

test("invokes layoutDidChangeFor() on layoutView each time it is called", function () {

  var callCount = 0;
  var layoutView = SC.View.create({
    layoutDidChangeFor: function (changedView) {
      equals(this.get('childViewsNeedLayout'), YES, 'should set childViewsNeedLayout to YES before calling layoutDidChangeFor()');

      equals(view, changedView, 'should pass view');
      callCount++;

      // Original
      var set = this._needLayoutViews;
      if (!set) set = this._needLayoutViews = SC.CoreSet.create();
      set.add(changedView);
    }
  });

  var view = SC.View.create({ layoutView: layoutView });

  SC.run(function () {
    view.layoutDidChange();
    view.layoutDidChange();
    view.layoutDidChange();
  });

  equals(callCount, 3, 'should call layoutView.layoutDidChangeFor each time');

  // Clean up.
  layoutView.destroy();
  view.destroy();
});

test("invokes layoutChildViewsIfNeeded() on layoutView once per runloop", function () {

  var callCount = 0;
  var layoutView = SC.View.create({
    layoutChildViewsIfNeeded: function () {
      callCount++;
    }
  });

  var view = SC.View.create({ layoutView: layoutView });

  SC.run(function () {
    view.layoutDidChange();
    view.layoutDidChange();
    view.layoutDidChange();
  });

  equals(callCount, 1, 'should call layoutView.layoutChildViewsIfNeeded one time');

  // Clean up.
  layoutView.destroy();
  view.destroy();
});


test("should not invoke layoutChildViewsIfNeeded() if layoutDidChangeFor() sets childViewsNeedLayout to NO each time", function () {

  var callCount = 0;
  var layoutView = SC.View.create({
    layoutDidChangeFor: function () {
      this.set('childViewsNeedLayout', NO);
    },

    layoutChildViewsIfNeeded: function () {
      callCount++;
    }
  });

  var view = SC.View.create({ layoutView: layoutView });

  SC.run(function () {
    view.layoutDidChange();
    view.layoutDidChange();
    view.layoutDidChange();
  });

  equals(callCount, 0, 'should not call layoutView.layoutChildViewsIfNeeded');

  // Clean up.
  layoutView.destroy();
  view.destroy();
});

test('returns receiver', function () {
  var view = SC.View.create();

  SC.run(function () {
    equals(view.layoutDidChange(), view, 'should return receiver');
  });

  // Clean up.
  view.destroy();
});

test("is invoked whenever layout property changes", function () {

  var callCount = 0;
  var layoutView = SC.View.create({
    layoutDidChangeFor: function (changedView) {
      callCount++;

      // Original
      var set = this._needLayoutViews;
      if (!set) set = this._needLayoutViews = SC.CoreSet.create();
      set.add(changedView);
    }
  });

  var view = SC.View.create({ layoutView: layoutView });

  SC.run(function () {
    view.set('layout', { top: 0, left: 10 });
  });
  equals(callCount, 1, 'should call layoutDidChangeFor when setting layout of child view');

  // Clean up.
  layoutView.destroy();
  view.destroy();
});

test("is invoked on parentView if no layoutView whenever layout property changes", function () {

  var callCount = 0;
  var parentView = SC.View.create({
    layoutDidChangeFor: function (changedView) {
      callCount++;

      // Original
      var set = this._needLayoutViews;
      if (!set) set = this._needLayoutViews = SC.CoreSet.create();
      set.add(changedView);
    }
  });

  var view = SC.View.create({});
  view.set('parentView', parentView);

  SC.run(function () {
    view.set('layout', { top: 0, left: 10 });
  });
  equals(callCount, 1, 'should call layoutDidChangeFor when setting layout of child view');

  // Clean up.
  parentView.destroy();
  view.destroy();
});

test("proxies rotate to rotateZ when 3D transforms are supported", function () {
  // Retain CSS support information so we can return to it.
  var actualSupport = SC.platform.get('supportsCSS3DTransforms'),
      view;

  // YES SUPPORT
  SC.platform.set('supportsCSS3DTransforms', YES);
  view = SC.View.create();
  SC.run(function () {
    view.set('layout', { rotate: 45 });
  });
  equals(view.get('layout').rotate, undefined, "should clear rotate");
  equals(view.get('layout').rotateZ, 45, "should set rotateZ");
  // Clean up.
  view.destroy();

  // NO SUPPORT
  SC.platform.set('supportsCSS3DTransforms', NO);
  view = SC.View.create();
  SC.run(function () {
    view.set('layout', { rotate: 45 });
  });
  equals(view.get('layout').rotate, 45, "should retain rotate");
  equals(view.get('layout').rotateZ, undefined, "should not set rotateZ");
  // Clean up.
  view.destroy();

  // Clean up bigger picture.
  SC.platform.set('supportsCSS3DTransforms', actualSupport);
});

test("rotateZ and rotate together", function () {
  var view = SC.View.create({});

  SC.run(function () {
    view.set('layout', { rotate: 45, rotateZ: 90 });
  });

  equals(view.get('layout').rotate, 45, "if both rotate and rotateZ values are present, both should be retained; rotate is");

  equals(view.get('layout').rotateZ, 90, "if both rotate and rotateZ values are present, both should be retained; rotateZ is");

  // Clean up.
  view.destroy();
});

// The default implementation for viewDidResize calls internal layout-related
// methods on child views. This test confirms that child views that do not
// support layout do not cause this process to explode.
test("Calling viewDidResize on a view notifies its child views", function () {
  var regularViewCounter = 0, coreViewCounter = 0;

  var view = SC.View.create({
    childViews: ['regular', 'core'],

    regular: SC.View.extend({
      viewDidResize: function () {
        regularViewCounter++;
        // Make sure we call the default implementation to
        // ensure potential blow-uppy behavior is invoked
        sc_super();
      }
    }),

    core: SC.CoreView.extend({
      viewDidResize: function () {
        coreViewCounter++;
        sc_super();
      }
    })
  });

  view.viewDidResize();

  equals(regularViewCounter, 1, "regular view's viewDidResize gets called");
  equals(coreViewCounter, 1, "core view's viewDidResize gets called");

  // Clean up.
  view.destroy();
});
