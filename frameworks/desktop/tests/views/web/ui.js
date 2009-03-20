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
  .add("change src/value", SC.WebView, {
    value : "/clock",
    layout:{width: 250, height: 150}
  })
  .add("autoResize", SC.WebView, {
    value: sc_static('iframe'),
    shouldAutoResize: YES,
    layout: { width: 250, height: 150}
  });

  pane.show(); // add a test to show the test pane
  // ..........................................................
  // TEST VIEWS
  // 
  module('SC.WebView UI');

  test("attributes tests", function() {
    var view = pane.view('basic');
    var iframe = view.$('iframe');
    ok(view,'view should exist');
    ok(view.get('value'),'should have value property');
    equals(view.get('shouldAutoResize'), NO, 
      'should have autoresize off by default, shouldAutoResize');
    var rootElement = view.$();
    ok(rootElement.hasClass('sc-view'), 'should have sc-view css class');
    ok(rootElement.hasClass('sc-web-view'), 'should have sc-web-view css class');
    equals(rootElement.height(), 150, 'should have height');
    equals(rootElement.width(), 250, 'should have width');
  
    ok(iframe,'should have iframe element');
    equals(iframe.attr('src'),"/clock", "should have source as /clock");
    ok(iframe[0].contentWindow, 
      'should have content window if src is from the same domain');
  
  });
  
  test('change src/value', function() {
    var view = pane.view('change src/value');
    var iframe = view.$('iframe');
    SC.RunLoop.begin();
    view.set('value', "/view_builder");
    SC.RunLoop.end();
    equals(view.get('value'),"/view_builder", 
      "should have value property in view as \'\\view_builder\'");
    equals(iframe.attr('src'),"/view_builder", 
      "should have source in the iframe as \'\\view_builder\'");
  });

  test('auto resize tests',
  function() {
    var view = pane.view('autoResize');
    //set the test wrapper element's overflow to auto so that you can see the resize magic'
    view.$()[0].parentNode.style.overflow="auto";
    equals(view.get('shouldAutoResize'), YES, 
      'should have auto resize flag as YES:');
    
    // Need a way to make this test run only after the iframe has loaded, know how?
    var height = view.$().height();
    ok(height > 150 , 
      "height of view should change based on content, NO RLY.. this test should work, it's the timing :(");
    
  });

})();
