// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            portions copyright @2009 Apple Inc.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

var view, content1, content2 ;


var pane = SC.ControlTestPane.design()
  .add("basic", SC.TableView, {
    layout: { width: 300, height: 200 },
    columns:[SC.TableColumn.create({label:'Title',key:'title',width:150})],
    useHeaders:YES,
    headerHeight:36
  });
  
pane.show();
window.pane = pane;

module("SC.TableView.content", {
  setup: function() {
    view = pane.view('basic');
    content1 = "a b c d e f".w().map(function(x) { 
      return SC.Object.create({ title: x }); 
    });
    
    content2 = "d e f x y z".w().map(function(x) { 
      return SC.Object.create({ title: x }); 
    });
    
  }
});

// ..........................................................
// BASIC EDITS
// 

test("setting content for first time", function() {
  view = pane.view('basic');
  equals(view.get('content'), null, 'precond - view.content should be null');
  
  SC.RunLoop.begin();
  view.set('content', content1);
  SC.RunLoop.end();
  equals(view._dataView.get('contentView').get('childViews').length,content1.length,"data view should have as many childviews as content items");
});

test("changing content with different size", function() {

  SC.RunLoop.begin();
  view.set('content', "j k".w().map(function(x) { 
    return SC.Object.create({ title: x }); 
  }));
  SC.RunLoop.end();
  
  equals(view._dataView.get('contentView').get('childViews').length,2,"data view should have 2 childViews");
  
  SC.RunLoop.begin();
  view.set('content', content2);
  SC.RunLoop.end();
  
  equals(view._dataView.get('contentView').get('childViews').length,content2.length,"data view should have 6 childViews");
});

test("changing content with same size", function() {
  SC.RunLoop.begin();
  view.set('content', content1);
  SC.RunLoop.end();
  equals(view._dataView.getPath('contentView.content'), content1, 'precond - DataView.content should be content1');
  
  SC.RunLoop.begin();
  view.set('content', content2);
  SC.RunLoop.end();
  
  equals(view._dataView.getPath('contentView.content'), content2, 'DataView.content should be content2');
  equals(view._dataView.get('contentView').get('childViews')[5].get('content'),content2[5],"Last content item of childViews should be last item of content2");
});

test("changing the content of a single item should reload that item", function() {
  
  SC.RunLoop.begin();
  view.set('content', content1);
  content1.replace(1,1, [SC.Object.create({ title: "X" })]);
  SC.RunLoop.end();
  
  equals(view._dataView.getPath('contentView.content'), content1, 'precond - DataView.content should be content1');
  equals(view._dataView.get('contentView').get('childViews')[1].get('childViews')[0].$('label').html(),content1[1].title,"innerHTML of cell for switched item should match value in content collection");
});

test("Removing an item should update the tableView", function() {
  
  SC.RunLoop.begin();
  view.set('content', content1);
  SC.RunLoop.end();
  
  equals(view._dataView.getPath('contentView.content'), content1, 'precond - DataView.content should be content1');
  equals(view._dataView.get('contentView').get('childViews')[1].get('childViews')[0].$('label').html(),"b","precond - innerHTML of cell for second row should be 'b'");
  
  SC.RunLoop.begin();
  content1.removeAt(1);
  SC.RunLoop.end();
  
  equals(view._dataView.get('contentView').get('childViews')[1].get('childViews')[0].$('label').html(),"c","after deletion, innerHTML of cell for second row should be 'c'");
  equals(view._dataView.get('contentView').get('childViews').length,content1.length,"data view should have as many childviews as content items");
});
