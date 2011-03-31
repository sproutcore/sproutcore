// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Apple Inc. and contributors.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/*global module test equals context ok same */

module("SC.View#layoutDidChange");

test("notifies layoutStyle & frame change", function() {

  var view = SC.View.create();
  var callCount = 0;

  view.addObserver('layoutStyle', function() { callCount++; });
  view.addObserver('frame', function() { callCount++; });

  view.layoutDidChange();
  equals(callCount,2,'should trigger observers for layoutStyle + frame');
});

test("invokes layoutDidChangeFor() on layoutView each time it is called", function() {

  var callCount = 0 ;
  var layoutView = SC.View.create({
    layoutDidChangeFor: function(changedView){
      equals(this.get('childViewsNeedLayout'), YES, 'should set childViewsNeedLayout to YES before calling layoutDidChangeFor()');

      equals(view, changedView, 'should pass view');
      callCount++;
    }
  });

  var view = SC.View.create({ layoutView: layoutView });

  view.layoutDidChange();
  view.layoutDidChange();
  view.layoutDidChange();

  equals(callCount, 3, 'should call layoutView.layoutDidChangeFor each time');
});

test("invokes layoutChildViewsIfNeeded() on layoutView once per runloop", function() {

  var callCount = 0 ;
  var layoutView = SC.View.create({
    layoutChildViewsIfNeeded: function(){
      callCount++;
    }
  });

  var view = SC.View.create({ layoutView: layoutView });

  SC.RunLoop.begin();
  view.layoutDidChange();
  view.layoutDidChange();
  view.layoutDidChange();
  SC.RunLoop.end();

  equals(callCount, 1, 'should call layoutView.layoutChildViewsIfNeeded one time');
});


test("should not invoke layoutChildViewsIfNeeded() if layoutDidChangeFor() sets childViewsNeedLayout to NO each time", function() {

  var callCount = 0 ;
  var layoutView = SC.View.create({
    layoutDidChangeFor: function() {
      this.set('childViewsNeedLayout', NO);
    },

    layoutChildViewsIfNeeded: function(){
      callCount++;
    }
  });

  var view = SC.View.create({ layoutView: layoutView });

  SC.RunLoop.begin();
  view.layoutDidChange();
  view.layoutDidChange();
  view.layoutDidChange();
  SC.RunLoop.end();

  equals(callCount, 0, 'should not call layoutView.layoutChildViewsIfNeeded');
});

test('returns receiver', function() {
  var view = SC.View.create();
  equals(view.layoutDidChange(), view, 'should return receiver');
});

test("is invoked whenever layout property changes", function() {

  var callCount = 0 ;
  var layoutView = SC.View.create({
    layoutDidChangeFor: function(changedView){
      callCount++;
    }
  });

  var view = SC.View.create({ layoutView: layoutView });

  view.set('layout', { top: 0, left: 10 });
  equals(callCount, 1, 'should call layoutDidChangeFor when setting layout of child view');


});

test("is invoked on parentView if no layoutView whenever layout property changes", function() {

  var callCount = 0 ;
  var parentView = SC.View.create({
    layoutDidChangeFor: function(changedView){
      callCount++;
    }
  });

  var view = SC.View.create({});
  view.set('parentView', parentView);

  view.set('layout', { top: 0, left: 10 });
  equals(callCount, 1, 'should call layoutDidChangeFor when setting layout of child view');

});

test("sets rotateX when rotate is set", function() {
  var view = SC.View.create({});
  view.set('layout', { rotate: 45 });

  equals(view.get('layout').rotateX, 45, "should set rotateX");
});

test("sets rotate when rotateX is set", function(){
  var view = SC.View.create({});
  view.set('layout', { rotateX: 45 });
  equals(view.get('layout').rotate, 45, "should set rotate");

  view.set('layout', { rotateX: 0 });
  equals(view.get('layout').rotate, 0, "should also work with 0");
});

test("rotateX overrides rotate", function(){
  var view = SC.View.create({});
  view.set('layout', { rotate: 45, rotateX: 90 });
  equals(view.get('layout').rotate, 90, "should set rotate to rotateX");
});

// The default implementation for viewDidResize calls internal layout-related
// methods on child views. This test confirms that child views that do not
// support layout do not cause this process to explode.
test("Calling viewDidResize on a view notifies its child views", function() {
  var regularViewCounter = 0, coreViewCounter = 0;

  var view = SC.View.create({
    childViews: ['regular', 'core'],

    regular: SC.View.create({
      viewDidResize: function() {
        regularViewCounter++;
        // Make sure we call the default implementation to
        // ensure potential blow-uppy behavior is invoked
        sc_super();
      }
    }),

    core: SC.CoreView.create({
      viewDidResize: function() {
        coreViewCounter++;
        sc_super();
      }
    })
  });

  view.viewDidResize();

  equals(regularViewCounter, 1, "regular view's viewDidResize gets called");
  equals(coreViewCounter, 1, "core view's viewDidResize gets called");
});
