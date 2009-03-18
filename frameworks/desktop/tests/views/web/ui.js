// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            portions copyright @2009 Apple, Inc.
// License:   Licened under MIT license (see license.js)
// ==========================================================================

/*global module test htmlbody ok equals same stop start v*/


(function() {
  var pane = SC.ControlTestPane.design()

    .add("basic", SC.WebView, {
      value : "/clock",
      layout:{width: 250, height: 150}
    })


    .add("/clock to /view_builder", SC.WebView, {
      value : "/clock",
      layout:{width: 250, height: 150}
    })
    
    
    // .add("autoResizeView", SC.WebView,{
    //   value : "/clock",
    //   shouldAutoResize: NO,
    //   layout: {width:250, height: 150}
    // });
  
  pane.show(); // add a test to show the test pane

  // ..........................................................
  // TEST VIEWS
  // 
  module('SC.WebView UI');

  test("attributes tests", function() {
    var view = pane.view('basic');
    var iframe = view.$iframe();
    ok(view,'view should exist');
    ok(view.get('value'),'should have value property');
    equals(view.get('shouldAutoResize'), NO, 'should have autoresize off by default, shouldAutoResize');
    var rootElement = view.$();
    ok(rootElement.hasClass('sc-view'), 'should have sc-view css class');
    ok(rootElement.hasClass('sc-iframe-view'), 'should have sc-iframe-view css class');
    equals(rootElement.height(), 150, 'should have height');
    equals(rootElement.width(), 250, 'should have width');
  
    ok(iframe,'should have iframe element');
    equals(iframe.attr('src'),"/clock", "should have source as /clock");
    ok(iframe[0].contentDocument, 'should have content document');
  
  });
  
  // test('auto resize tests', function(){
  //   var view = pane.view('autoResizeView');
  //   
  // });
  
  test('change src/value ', function() {
    var view = pane.view('/clock to /view_builder');
    var iFrame = view.$iframe();
    SC.RunLoop.begin();
    view.set('value', "/view_builder");
    SC.RunLoop.end();
    equals(view.get('value'),"/view_builder", "should have value property in view as \'\\view_builder\'");
    equals(iFrame.attr('src'),"/view_builder", "should have source in the iframe as \'\\view_builder\'");
  });
})();
