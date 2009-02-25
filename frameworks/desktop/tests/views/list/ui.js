// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            portions copyright @2009 Apple, Inc.
// License:   Licened under MIT license (see license.js)
// ==========================================================================

/*global module test htmlbody ok equals same stop start */

htmlbody('<style> .sc-static-layout { border: 1px red dotted; } </style>');

(function() {
  var content = []
  for (var idx=0, len=20; idx<len; ++idx) {
    content.push(SC.Record.create({
      id: 'item_'+idx,
      title: 'Item ' + idx
    }))
  }
  
  var singleSelection = [content[0]];
  var multiSelectionContiguous = [content[0], content[1], content[2]];
  var multiSelectionDiscontiguous = [content[0], content[2], content[4]];
  
  // var offScreenSingleSelection = [content[1]];
  // var offScreenMultiSelectionContiguous = [content[10], content[11], content[12]];
  // var offScreenMultiSelectionDiscontiguous = [content[10], content[12], content[14]];
  
  var pane = SC.ControlTestPane.design({ height: 100 })
    .add("basic", SC.ListView, {
      content: content,
      contentValueKey: 'title'
    })
    
    .add("disabled", SC.ListView, {
      isEnabled: NO,
      content: content,
      contentValueKey: 'title'
    })
    
    .add("disabled - single selection", SC.ListView, {
      isEnabled: NO,
      content: content,
      contentValueKey: 'title',
      selection: singleSelection
    })
    
    .add("single selection", SC.ListView, {
      content: content,
      contentValueKey: 'title',
      selection: singleSelection
    })
    
    .add("multiple selection, contiguous", SC.ListView, {
      content: content,
      contentValueKey: 'title',
      selection: multiSelectionContiguous
    })
    
    .add("multiple selection, discontiguous", SC.ListView, {
      content: content,
      contentValueKey: 'title',
      selection: multiSelectionDiscontiguous
    })
    
  pane.show(); // add a test to show the test pane

  // ..........................................................
  // TEST VIEWS
  // 
  module('SC.ListView UI', pane.standardSetup());
  
  test("basic", function() {
    var view = pane.view('basic');
    ok(!view.$().hasClass('disabled'), 'should not have disabled class');
    ok(!view.$().hasClass('sel'), 'should not have sel class');
    
    ok(SC.rangesEqual(view.get('nowShowingRange'), { start: 0, length: 5}), 'now showing range should be 0-4');
    
    for (var idx=0, len=20; idx<len; idx++) {
      var itemView = view.itemViewAtContentIndex(idx) ;
      if (idx < 5) {
        ok(itemView, 'should return an itemView for the visible record %@ displayed in the list'.fmt(idx));
        ok(itemView.get('isVisible'), 'itemViews for visible record %@ should have isVisible === YES'.fmt(idx));
        ok(itemView.get('layer'), 'itemViews for visible record %@ should have a layer'.fmt(idx));
      } else {
        ok(itemView, 'should return an itemView for the non-visible record %@ displayed in the list'.fmt(idx));
        ok(!itemView.get('isVisible'), 'itemViews for the non-visible record %@ should have isVisible === NO'.fmt(idx));
        ok(!itemView.get('layer'), 'itemViews for the non-visible record %@ should NOT have a layer'.fmt(idx));
      }
    }
  });
  
  test("disabled", function() {
    var view = pane.view('disabled');
    ok(view.$().hasClass('disabled'), 'should have disabled class');
    ok(!view.$().hasClass('sel'), 'should not have sel class');
  });
   
  test("disabled - single selection", function() {
    var view = pane.view('disabled - single selection');
    ok(view.$().hasClass('disabled'), 'should have disabled class');
    ok(view.itemViewAtContentIndex(0).$().hasClass('sel'), 'should have sel class');
   });

   test("single selection", function() {
     var view = pane.view('single selection');
     ok(view.itemViewAtContentIndex(0).$().hasClass('sc-collection-item'), 'should have sc-collection-item class');
     ok(view.itemViewAtContentIndex(0).$().hasClass('sel'), 'should have sel class');
    });

})();
