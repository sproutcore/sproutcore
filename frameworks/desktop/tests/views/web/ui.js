// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            portions copyright @2009 Apple, Inc.
// License:   Licened under MIT license (see license.js)
// ==========================================================================

/*global module test htmlbody ok equals same stop start */


(function() {
  var pane = SC.ControlTestPane.design()

    .add("basic", SC.WebView, {
      content : "http://www.sproutcore.com",
      layout:{width: 250, height: 150}
    });
  
  pane.show(); // add a test to show the test pane

  // ..........................................................
  // TEST VIEWS
  // 
  module('SC.WebView UI', pane.standardSetup());

  test("basic", function() {
    var view = pane.view('basic');
    var iFrame = view.$('iframe');
    equals(iFrame.attr('src'),"http://www.sproutcore.com", "should have source as http://www.sproutcore.com");
  });
  
  test('set content to google.com', function() {
    var view = pane.view('basic');
    var iFrame = view.$('iframe');
    console.log(iFrame.attr('src'));
    console.log('setting content to google.com, current value: '+ view.get('content'));
    SC.RunLoop.begin();
    view.set('content', "http://www.google.com");
    SC.RunLoop.end();
    console.log(iFrame.attr('src'));
    equals(iFrame.attr('src'),"http://www.google.com", "should have source as http://www.google.com");
  });
})();
