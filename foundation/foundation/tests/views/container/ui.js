// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            portions copyright @2009 Apple Inc.
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
    
    // .add("disabled - single selection", SC.ListView, {
    //   isEnabled: NO,
    //   content: content,
    //   contentValueKey: 'title',
    //   selection: singleSelection
    // })
    // 
    // .add("single selection", SC.ListView, {
    //   content: content,
    //   contentValueKey: 'title',
    //   selection: singleSelection
    // })
    // 
    // .add("multiple selection, contiguous", SC.ListView, {
    //   content: content,
    //   contentValueKey: 'title',
    //   selection: multiSelectionContiguous
    // })
    // 
    // .add("multiple selection, discontiguous", SC.ListView, {
    //   content: content,
    //   contentValueKey: 'title',
    //   selection: multiSelectionDiscontiguous
    // })
    
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
   
  // test("disabled - single selection", function() {
  //   var view = pane.view('disabled - single selection');
  //   ok(view.$().hasClass('disabled'), 'should have disabled class');
  //   ok(view.itemViewAtContentIndex(0).$().hasClass('sel'), 'should have sel class');
  //  });
  // 
  //  test("single selection", function() {
  //    var view = pane.view('single selection');
  //    ok(view.itemViewAtContentIndex(0).$().hasClass('sc-collection-item'), 'should have sc-collection-item class');
  //    ok(view.itemViewAtContentIndex(0).$().hasClass('sel'), 'should have sel class');
  //   });

  test("changing nowShowing", function() {
    var view = pane.view('basic');
    // Set nowShowing to an instantiated object.
    var viewToAdd = SC.LabelView.create({value: 'Test view.'});
    view.set('nowShowing', viewToAdd);
    ok(view.get('contentView') instanceof SC.View, 'contentView changes as intended when an instantiated view is passed to nowShowing');
    
    // Set nowShowing to an uninstantiated object.
    viewToAdd = SC.LabelView.design({value: 'Test view.'});
    view.set('nowShowing', viewToAdd);
    ok(view.get('contentView') instanceof SC.View, 'contentView changes as intended when an uninstantiated view (class) is passed to nowShowing');
    
    // Set nowShowing to a non-view object.
    viewToAdd = SC.Object;
    view.set('nowShowing', viewToAdd);
    equals(view.get('contentView'), null, 'contentView changes to null when nowShowing is set to a non-view');
    
    // Set nowShowing to a string.  (How, here?) (No idea.)
    
    // Set nowShowing to a nonexistent string.
    viewToAdd = 'NonexistentNamespace.NonexistentViewClass';
    view.set('nowShowing', viewToAdd);
    equals(view.get('contentView'), null, 'contentView changes to null when nowShowing is set to a string pointing at nothing');
    
    // Set nowShowing to null.
    viewToAdd = null;
    view.set('nowShowing', viewToAdd);
    equals(view.get('contentView'), null, 'contentView changes to null when nowShowing is set to null');
    
  });

})();
