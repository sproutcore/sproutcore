// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            portions copyright @2009 Apple Inc.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/*
  This test evaluates data binding within the context of a scene view. 
*/

module('SC.SceneView - binding content of views in the scenes', {
  setup: function() {
    var theData = SC.ArrayController.create({
      content: [ 'Blackcurrant', 'Redcurrant', 'Gooseberry', 'Tomato', 'Eggplant', 'Guava']
    });

    TestNamespace = {
      theData: theData
    };    
  },

  teardown: function() {
    delete theData;
  }
});


var pane = SC.ControlTestPane.design().
  add('sceneView', SC.SceneView.design({
    layout: { left:0, top:0, right:0, bottom:0 },
    scenes: 'summaryView detailView'.w(),
    nowShowing: 'summaryView',

    summaryView: SC.View.design({}),
    detailView: SC.View.design({
      layout: { left:0, top:0, right:0, bottom:0 },
      childViews: ['viewWithSCBindingFrom', 'viewWithSimpleBindingExpression'],
      viewWithSimpleBindingExpression: SC.ListView.design({
        contentBinding: 'TestNamespace.theData.arrangedObjects'
      }),
      viewWithSCBindingFrom: SC.ListView.design({
        contentBinding: SC.Binding.from('TestNamespace.theData.arrangedObjects')
      })
    })
  }));

pane.show();
window.pane = pane;


test('test simple binding within scene', function() {
  var sceneView = pane.view('sceneView');

  // Switch to the detail view and check that all the data is shown by the list view
  
  sceneView.set('nowShowing', 'detailView');
  SC.Binding.flushPendingChanges();
  
  var detailView = sceneView.get('childViews')[0];  
  var dataCount = detailView.getPath('viewWithSimpleBindingExpression.content.length');
  ok(dataCount, TestNamespace.theData.length);

  
  // Switch to summary view and then back to the detail view and check that the list view
  // still shows all the data from the binding
  
  sceneView.set('nowShowing', 'summaryView');
  SC.Binding.flushPendingChanges();
  sceneView.set('nowShowing', 'detailView');
  SC.Binding.flushPendingChanges();

  detailView = sceneView.get('childViews')[0];
  dataCount = detailView.getPath('viewWithSimpleBindingExpression.content.length');
  ok(dataCount, TestNamespace.theData.length);
});


test('test SC.Binding.from binding within scene', function() {
  var sceneView = pane.view('sceneView');

  // Switch to the detail view and check that all the data is shown by the list view

  sceneView.set('nowShowing', 'detailView');
  SC.Binding.flushPendingChanges();

  var detailView = sceneView.get('childViews')[0];
  var dataCount = detailView.getPath('viewWithSCBindingFrom.content.length');
  ok(dataCount, TestNamespace.theData.length);


  // Switch to summary view and then back to detail view and check that the list view
  // still shows all the data from the binding

  sceneView.set('nowShowing', 'summaryView');
  SC.Binding.flushPendingChanges();
  sceneView.set('nowShowing', 'detailView');
  SC.Binding.flushPendingChanges();

  detailView = sceneView.get('childViews')[0];
  dataCount = detailView.getPath('viewWithSCBindingFrom.content.length');
  ok(dataCount, TestNamespace.theData.length);
});






