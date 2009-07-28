// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            portions copyright @2009 Apple Inc.
// License:   Licened under MIT license (see license.js)
// ==========================================================================

/*global module test htmlbody ok equals same stop start */

// htmlbody('<style> .sc-control-test-pane .wrapper { overflow: none; } </style>');

(function() {
  var pane = SC.ControlTestPane.design({ height: 100 })
  
  pane.add("basic", SC.ContainerView, {
      isEnabled: YES
    })
    
  pane.add("disabled", SC.ContainerView, {
      isEnabled: NO
    })
    
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
    
    // var contentView = view.get('contentView') ;
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

})();
