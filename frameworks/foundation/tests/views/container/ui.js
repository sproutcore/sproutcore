// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            portions copyright @2011 Apple Inc.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================
/*globals module, test, htmlbody, ok, equals, same, stop, start*/


// htmlbody('<style> .sc-control-test-pane .wrapper { overflow: none; } </style>');

(function() {
  var pane = SC.ControlTestPane.design({ height: 100 });

  pane.add("basic", SC.ContainerView, {
    isEnabled: YES
  });

  pane.add("disabled", SC.ContainerView, {
    isEnabled: NO
  });

  pane.add("nowShowingDefault", SC.ContainerView, {
    nowShowing: 'start',

    start: SC.LabelView.design({
      value: 'Start'
    })

  });

  pane.add("deepNowShowing", SC.ContainerView, {
    viewPage: SC.Page.extend({
      view1: SC.View,
      view2: SC.View
    }),
    init: function() { sc_super(); this.viewPage = this.viewPage.create(); } // have to create page
  });

  pane.add("nestedContainer", SC.ContainerView, {
    nowShowing: 'container1',

    container1: SC.ContainerView.create({
      nowShowing: 'view1',

      view1: SC.View.create(),
      view2: SC.View.create()
    }),
    container2: SC.ContainerView.create({
      nowShowing: 'view3',

      view3: SC.View.create(),
      view4: SC.View.create()
    }),

    // prevent destroying containers on teardown
    destroy: function() {},
  });

  pane.add("cleans-up-views", SC.ContainerView, {
    nowShowing: 'uninstantiatedView',
    cacheInstanciatedViews: false,
    uninstantiatedView: SC.View
  });

  pane.add("cache-views", SC.ContainerView, {
    nowShowing: 'uninstantiatedView',
    cacheInstanciatedViews: true,
    uninstantiatedView: SC.View
  });


  // ..........................................................
  // TEST VIEWS
  //
  module('SC.ContainerView UI', pane.standardSetup());

  test("basic", function() {
    var view = pane.view('basic');
    ok(!view.$().hasClass('disabled'), 'should not have disabled class');
    ok(!view.$().hasClass('sel'), 'should not have sel class');

    ok(view.kindOf(SC.ContainerView), 'default contentView is an SC.ContainerView');
    ok(view.get('contentView') === null, 'default contentView should have no contentView itself');
  });

  test("disabled", function() {
    var view = pane.view('disabled');
    ok(view.$().hasClass('disabled'), 'should have disabled class');
    ok(!view.$().hasClass('sel'), 'should not have sel class');
  });

  test("changing nowShowing", function() {
    var view = pane.view('basic');
    // Set nowShowing to an instantiated object.
    var viewToAdd = SC.LabelView.create({value: 'View1'});
    view.set('nowShowing', viewToAdd);
    equals(view.get('contentView').get('value'), 'View1', 'contentView changes as intended when an instantiated view is passed to nowShowing');

    // Set nowShowing to an uninstantiated object.
    viewToAdd = SC.LabelView.design({value: 'View2'});
    view.set('nowShowing', viewToAdd);
    equals(view.get('contentView').get('value'), 'View2', 'contentView changes as intended when an uninstantiated view (class) is passed to nowShowing');

    // Set nowShowing to an SC.CoreView
    viewToAdd = SC.CoreView.design({value: 'View5'});
    view.set('nowShowing', viewToAdd);
    equals(view.get('contentView').get('value'), 'View5', 'contentView instantiates and inserts an SC.CoreView');

    // Set nowShowing to a non-view object.
    viewToAdd = SC.Object;
    view.set('nowShowing', viewToAdd);
    equals(view.get('contentView'), null, 'contentView changes to null when nowShowing is set to a non-view');

    // Set nowShowing to a string.
    var viewForString = SC.LabelView.create({value: 'View3'});
    view.set('label', viewForString);
    view.set('nowShowing', 'label');
    equals(view.get('contentView').get('value'), 'View3', 'contentView changes as intended when an instantiated view is passed to nowShowing');

    // Set nowShowing to a nonexistent string.
    viewToAdd = 'NonexistentNamespace.NonexistentViewClass';
    view.set('nowShowing', viewToAdd);
    equals(view.get('contentView'), null, 'contentView changes to null when nowShowing is set to a string pointing at nothing');

    // Set nowShowing to null.
    viewToAdd = null;
    view.set('nowShowing', viewToAdd);
    equals(view.get('contentView'), null, 'contentView changes to null when nowShowing is set to null');

  });

  test("default nowShowing", function(){
    var view = pane.view("nowShowingDefault");

    var contentView = view.get('contentView');

    // contentView should reflect nowShowing
    ok(contentView, "should have contentView");
    equals(contentView.get('value'), 'Start', 'contentView value should be "Start"');

  });

  test("nowShowing as local property path", function() {
    var view = pane.view('deepNowShowing');

    view.set("nowShowing", '.viewPage.view1');

    ok(view.get('contentView') === view.getPath('viewPage.view1'), "Setting nowShowing to a local property path correctly updates the contentView.");
  });

  test("Cleans up instantiated views", function() {
    var view = pane.view("cleans-up-views");

    var contentView = view.get('contentView');
    SC.run(function() { view.set('nowShowing', SC.View.create()); });
    equals(contentView.isDestroyed, YES, "should have destroyed the previous view it instantiated (from path)");

    contentView = view.get('contentView');
    SC.run(function() { view.set('nowShowing', SC.View.extend()); });
    equals(contentView.isDestroyed, NO, "should not have destroyed the previous view because it was already instantiated");

    contentView = view.get('contentView');
    SC.run(function() { view.set('nowShowing', null); });
    equals(contentView.isDestroyed, YES, "should have destroyed the previous view it instantiated (from class)");

    SC.run(function() { view.set('nowShowing', SC.View.create()); });
    contentView = view.get('contentView');
    equals(contentView.isDestroyed, NO, "The content view should not be destroyed");

    view.destroy();
    equals(contentView.isDestroyed, YES, "should have destroyed the content view");

  });

  test("Cache instantiated views", function() {
    var view = pane.view("cache-views");
    view.awake();

    var contentViewFromPath = view.get('contentView');
    SC.run(function() { view.set('nowShowing', SC.View.create()); });
    equals(contentViewFromPath.isDestroyed, NO, "should not have destroyed the previous view it instantiated (from path)");

    var contentView = view.get('contentView');
    SC.run(function() { view.set('nowShowing', SC.View.extend()); });
    equals(contentView.isDestroyed, NO, "should not have destroyed the previous view because it was already instantiated");

    var contentViewFromClass = view.get('contentView');
    SC.run(function() { view.set('nowShowing', null); });
    equals(contentViewFromClass.isDestroyed, NO, "should not have destroyed the previous view it instantiated (from class)");

    view.destroy();
    equals(view.isDestroyed, YES, "should have destroyed the container");
    equals(contentViewFromPath.isDestroyed, YES, "should have destroyed the view it instantiated (from path)");
    equals(contentView.isDestroyed, NO, "should not have destroyed the view that was already instantiated");
    equals(contentViewFromClass.isDestroyed, YES, "should have destroyed the view it instantiated (from class)");
  });

  test("Nested container view", function() {
    var view = pane.view('nestedContainer'),
      container1 = view.get('container1'),
      container2 = view.get('container2');

    equals(container1.get('isVisibleInWindow'), true, "nowShowing#view1: container1 visbility should be");
    equals(container1.getPath('view1.isVisibleInWindow'), true, "nowShowing#view1: view1 visbility should be");
    equals(container1.getPath('view2.isVisibleInWindow'), false, "nowShowing#view1: view2 visbility should be");
    equals(container2.get('isVisibleInWindow'), false, "nowShowing#view1: container2 visbility should be");
    equals(container2.getPath('view3.isVisibleInWindow'), false, "nowShowing#view1: view3 visbility should be");
    equals(container2.getPath('view4.isVisibleInWindow'), false, "nowShowing#view1: view4 visbility should be");

    equals(container1.getPath('frame.height'), 100, 'nowShowing#view1: container1 height should be');
    equals(container1.getPath('view1.frame.height'), 100, 'nowShowing#view1: view1 height should be');


    container1.set("nowShowing", 'view2');

    equals(container1.get('isVisibleInWindow'), true, "nowShowing#view2: container1 visbility should be");
    equals(container1.getPath('view1.isVisibleInWindow'), false, "nowShowing#view2: view1 visbility should be");
    equals(container1.getPath('view2.isVisibleInWindow'), true, "nowShowing#view2: view2 visbility should be");
    equals(container2.get('isVisibleInWindow'), false, "nowShowing#view2: container2 visbility should be");
    equals(container2.getPath('view3.isVisibleInWindow'), false, "nowShowing#view2: view3 visbility should be");
    equals(container2.getPath('view4.isVisibleInWindow'), false, "nowShowing#view2: view4 visbility should be");

    equals(container1.getPath('view2.frame.height'), 100, 'nowShowing#view2: view2 height should be');


    view.set("nowShowing", 'container2');

    equals(container1.get('isVisibleInWindow'), false, "nowShowing#view3: container1 visbility should be");
    equals(container1.getPath('view1.isVisibleInWindow'), false, "nowShowing#view3: view1 visbility should be");
    equals(container1.getPath('view2.isVisibleInWindow'), false, "nowShowing#view3: view2 visbility should be");
    equals(container2.get('isVisibleInWindow'), true, "nowShowing#view3: container2 visbility should be");
    equals(container2.getPath('view3.isVisibleInWindow'), true, "nowShowing#view3: view3 visbility should be");
    equals(container2.getPath('view4.isVisibleInWindow'), false, "nowShowing#view3: view4 visbility should be");

    equals(container2.getPath('frame.height'), 100, 'nowShowing#view3: container2 height should be');
    equals(container2.getPath('view3.frame.height'), 100, 'nowShowing#view3: view3 height should be');


    container2.set("nowShowing", 'view4');

    equals(container1.get('isVisibleInWindow'), false, "nowShowing#view4: container1 visbility should be");
    equals(container1.getPath('view1.isVisibleInWindow'), false, "nowShowing#view4: view1 visbility should be");
    equals(container1.getPath('view2.isVisibleInWindow'), false, "nowShowing#view4: view2 visbility should be");
    equals(container2.get('isVisibleInWindow'), true, "nowShowing#view4: container2 visbility should be");
    equals(container2.getPath('view3.isVisibleInWindow'), false, "nowShowing#view4: view3 visbility should be");
    equals(container2.getPath('view4.isVisibleInWindow'), true, "nowShowing#view4: view4 visbility should be");

    equals(container2.getPath('frame.height'), 100, 'nowShowing#view4: container2 height should be');
    equals(container2.getPath('view4.frame.height'), 100, 'nowShowing#view4: view4 height should be');


    container1.set("nowShowing", 'view1');
    view.set("nowShowing", 'container1');

    equals(container1.get('isVisibleInWindow'), true, "nowShowing#view1: container1 visbility should be");
    equals(container1.getPath('view1.isVisibleInWindow'), true, "nowShowing#view1: view1 visbility should be");
    equals(container1.getPath('view2.isVisibleInWindow'), false, "nowShowing#view1: view2 visbility should be");
    equals(container2.get('isVisibleInWindow'), false, "nowShowing#view1: container2 visbility should be");
    equals(container2.getPath('view3.isVisibleInWindow'), false, "nowShowing#view1: view3 visbility should be");
    equals(container2.getPath('view4.isVisibleInWindow'), false, "nowShowing#view1: view4 visbility should be");

    equals(container1.getPath('frame.height'), 100, 'nowShowing#view1: container1 height should be');
    equals(container1.getPath('view1.frame.height'), 100, 'nowShowing#view1: view1 height should be');


    container2.get('view4').adjust('top', 10);
    view.set("nowShowing", 'container2');

    equals(container1.get('isVisibleInWindow'), false, "nowShowing#view4: container1 visbility should be");
    equals(container1.getPath('view1.isVisibleInWindow'), false, "nowShowing#view4: view1 visbility should be");
    equals(container1.getPath('view2.isVisibleInWindow'), false, "nowShowing#view4: view2 visbility should be");
    equals(container2.get('isVisibleInWindow'), true, "nowShowing#view4: container2 visbility should be");
    equals(container2.getPath('view3.isVisibleInWindow'), false, "nowShowing#view4: view3 visbility should be");
    equals(container2.getPath('view4.isVisibleInWindow'), true, "nowShowing#view4: view4 visbility should be");

    equals(container2.getPath('frame.height'), 100, 'nowShowing#view4: container2 height should be');
    equals(container2.getPath('view4.frame.height'), 90, 'nowShowing#view4: view4 height should be');

  });

})();
