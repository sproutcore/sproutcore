// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            portions copyright @2011 Apple Inc.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/*global module test htmlbody ok equals same stop start */

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
  
  pane.add("cleans-up-views", SC.ContainerView, {
    nowShowing: 'uninstantiatedView',
    
    uninstantiatedView: SC.View.design({})
  });

  pane.add("reuse-children", SC.ContainerView, {
    cacheViews: YES,
    isEnabled: YES
  });
    
  pane.show(); // add a test to show the test pane

  // ..........................................................
  // TEST VIEWS
  // 
  module('SC.ContainerView UI', pane.standardSetup());
  
  test("basic", function() {
    var view = pane.view('basic');
    ok(!view.$().hasClass('disabled'), 'should not have disabled class');
    ok(!view.$().hasClass('sel'), 'should not have sel class');
    
    var contentView = view.get('contentView') ;
    
    // ok(contentView.kindOf(SC.ContainerView), 'default contentView is an SC.ContainerView');
    // ok(contentView.get('contentView') === null, 'default contentView should have no contentView itself');
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
    view.awake();

    var contentView = view.get('contentView');

    // contentView should reflect nowShowing
    ok(contentView, "should have contentView");
    equals(contentView.get('value'), 'Start', 'contentView value should be "Start"');

  });
  
  test("Cleans up instantiated views", function() {
    var view = pane.view("cleans-up-views");
    view.awake();
    
    var contentView = view.get('contentView');
    SC.run(function() { view.set('nowShowing', SC.View.create()); });
    equals(contentView.isDestroyed, YES, "should have destroyed the view it instantiated (from path)");
    
    contentView = view.get('contentView');
    SC.run(function() { view.set('nowShowing', SC.View.design()); });
    equals(contentView.isDestroyed, NO, "should not have destroyed the view because it was already instantiated");
    
    contentView = view.get('contentView');
    SC.run(function() { view.set('nowShowing', null); });
    equals(contentView.isDestroyed, YES, "should have destroyed the view it instantiated (from class)");
  });

    test("Reuse instantiated children view for optimization", function () {
    var view = pane.view('reuse-children');
    view.awake();

    var viewToAdd1 = SC.View.create({value: 'View1'});
    SC.run(function () {view.set('nowShowing',viewToAdd1); });

    var children = view.get('childViews');
    equals(children.get('length'), 1, "should have one child view after setting nowShowing to viewToAdd1(instantiated)");

    var viewToAdd2 = SC.View.create({value: 'View2'});
    SC.run(function () { view.set('nowShowing',viewToAdd2); });
    equals(children.get('length'), 2, "should have two child views after setting nowShowing to viewToAdd2(instantiated)"); 

    var viewToAdd3 = SC.View.create({value: 'View3'});
    SC.run(function () { view.set('nowShowing',viewToAdd3); });
    equals(children.get('length'), 3, "should have three child views after setting nowShowing to viewToAdd3(instantiated)");

    SC.run(function () { view.set('nowShowing',viewToAdd2); });
    equals(children.get('length'), 3, "should have three child views after setting nowShowing to viewToAdd2(instantiated)");

    SC.run(function () { view.set('nowShowing',viewToAdd1); });
    equals(children.get('length'), 3, "should have three child views after setting nowShowing to viewToAdd1(instantiated)");
  });

  test("Destroy uninstantiated children views because they cannot be uniquely identified", function () {
    var view = pane.view('reuse-children');
    view.awake();

    var viewToAdd1 = SC.View.extend({value: 'View1'});
    SC.run(function () {view.set('nowShowing',viewToAdd1); });

    var children = view.get('childViews');
    equals(children.get('length'), 1, "should have one child view after setting nowShowing to view1(uninstantiated)");

    var viewToAdd2 = SC.View.extend({value: 'View2'});
    SC.run(function () { view.set('nowShowing',viewToAdd2); });
    equals(children.get('length'), 1, "should have one child views after setting nowShowing to view2(uninstantiated)"); 

    var viewToAdd3 = SC.View.extend({value: 'View3'});
    SC.run(function () { view.set('nowShowing',viewToAdd3); });
    equals(children.get('length'), 1, "should have one child views after setting nowShowing to view3(uninstantiated)");

    SC.run(function () { view.set('nowShowing',viewToAdd2); });
    equals(children.get('length'), 1, "should have one child views after setting nowShowing to view2(uninstantiated)");

    SC.run(function () { view.set('nowShowing',viewToAdd1); });
    equals(children.get('length'), 1, "should have one child views after setting nowShowing to view1(uninstantiated)");
  });


  test("Mix up instantiated views, uninstantied views, and string", function () {
    var view = pane.view('reuse-children');
    view.awake();

    var viewToAdd1 = SC.View.extend({value: 'View1'});
    SC.run(function () {view.set('nowShowing',viewToAdd1); });

    var children = view.get('childViews');
    equals(children.get('length'), 1, "should have one child view after setting nowShowing to view1(uninstantiated)");

    var viewToAdd2 = SC.View.extend({value: 'View2'});
    SC.run(function () { view.set('nowShowing',viewToAdd2); });
    equals(children.get('length'), 1, "should have one child views after setting nowShowing to view2(uninstantiated)"); 

    var viewToAdd3 = SC.View.create({value: 'View3'});
    SC.run(function () { view.set('nowShowing',viewToAdd3); });
    equals(children.get('length'), 2, "should have two child views after setting nowShowing to view3(instantiated)");

    SC.run(function () { view.set('nowShowing',viewToAdd2); });
    equals(children.get('length'), 2, "should have two child views after setting nowShowing to view2(uninstantiated)");

    SC.run(function () { view.set('nowShowing',viewToAdd1); });
    equals(children.get('length'), 2, "should have two child views after setting nowShowing to view1(uninstantiated)");

    var viewToAdd4 = SC.View.create({value: 'View4'});
    SC.run(function () { view.set('nowShowing',viewToAdd4); });
    equals(children.get('length'), 3, "should have three child views after setting nowShowing to view4(instantiated)");

    var viewForString = SC.LabelView.create({value: 'View3'});
    SC.run(function () {
      view.set('label', viewForString);
      view.set('nowShowing', 'label');  
    });
    equals(view.get('contentView').get('value'), 'View3', 'contentView changes as intended when an instantiated view is passed to nowShowing');
    equals(children.get('length'), 4, "should have four child views after setting nowShowing to viewForString(string)");

    // Set nowShowing to a nonexistent string.
    viewToAdd = 'NonexistentNamespace.NonexistentViewClass';
    view.set('nowShowing', viewToAdd);
    equals(view.get('contentView'), null, 'contentView changes to null when nowShowing is set to a string pointing at nothing');

    SC.run(function () { view.set('nowShowing',viewToAdd4); });
    equals(children.get('length'), 4, "should have four child views after setting nowShowing to view4(instantiated)");

    SC.run(function () { view.set('nowShowing',viewToAdd3); });
    equals(children.get('length'), 4, "should have four child views after setting nowShowing to view3(instantiated)");

    equals(children.get('length'), 4, "should have four child views after setting nowShowing to viewForString(string)");
  });
})();
