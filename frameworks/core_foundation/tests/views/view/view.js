// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/*globals module, test, equals, context, ok, same */

module("SC.View");

test("setting themeName should trigger a theme observer", function() {
  var count = 0;
  var view = SC.View.create({
    themeDidChange: function() {
      count++;
    }.observes('theme')
  });

  view.set('themeName', 'hello');
  equals(1, count, "theme observers should get called");
});

test("setting themeName should trigger a theme observer when extending", function() {
  var count = 0;
  var View = SC.View.extend({
    themeDidChange: function() {
      count++;
    }.observes('theme')
  });

  View.create().set('themeName', 'hello');
  equals(1, count, "theme observers should get called");
});

test("it still works with the backward compatible theme property", function() {
  var count = 0;
  var view = SC.View.create({
    theme: 'sc-base',
    themeDidChange: function() {
      count++;
    }.observes('theme')
  });

  equals(SC.Theme.find('sc-base'), view.get('theme'));
  view.set('themeName', 'hello');
  equals(1, count, "theme observers should get called");
});

test("it still works with the backward compatible theme property when extending", function() {
  var count = 0;
  var View = SC.View.extend({
    theme: 'sc-base',
    themeDidChange: function() {
      count++;
    }.observes('theme')
  });

  var view = View.create();
  equals(SC.Theme.find('sc-base'), view.get('theme'));
  view.set('themeName', 'hello');
  equals(1, count, "theme observers should get called");
});

var view;
module("SC.View methods", {
  setup: function () {
    view = SC.View.create({});
  },

  teardown: function () {
    view.destroy();
    view = null;
  }
});

test("_callOnChildViews", function () {
  var aContext = 'abc',
      callees = [],
      contexts = [],
      childView = SC.View.create({
        childViews: ['grandChildView'],
        calledFunction: function (context) {
          callees.push(this);
          if (context) { contexts.push(context); }
        },

        grandChildView: SC.View.extend({
          calledFunction: function (context) {
            callees.push(this);
            if (context) { contexts.push(context); }
          }
        })
      }),
      grandChildView;

  // Add the child view (and grandchild view).
  view.appendChild(childView);

  // Grab the grandchild view for easy reference.
  grandChildView = childView.get('childViews').objectAt(0);

  // Call the function by default (top-down).
  view._callOnChildViews('calledFunction');
  same(callees, [childView, grandChildView], "The child view function should be called top-down.");

  // Reset.
  callees.length = 0;
  contexts.length = 0;

  // Call the function top-down.
  view._callOnChildViews('calledFunction', true);
  same(callees, [childView, grandChildView], "The child view function should be called top-down.");

  // Reset.
  callees.length = 0;
  contexts.length = 0;

  // Call the function top-down with context.
  view._callOnChildViews('calledFunction', true, aContext);
  same(callees, [childView, grandChildView], "The child view function should be called top-down.");
  same(contexts, [aContext, aContext], "The child view function when called should receive the context.");

  // Reset.
  callees.length = 0;
  contexts.length = 0;

  // Call the function bottom-up.
  view._callOnChildViews('calledFunction', false);
  same(callees, [grandChildView, childView], "The child view function should be called bottom-up.");

  // Reset.
  callees.length = 0;
  contexts.length = 0;

  // Call the function bottom-up with context.
  view._callOnChildViews('calledFunction', false, aContext);
  same(callees, [grandChildView, childView], "The child view function should be called bottom-up.");
  same(contexts, [aContext, aContext], "The child view function when called should receive the context.");
});
