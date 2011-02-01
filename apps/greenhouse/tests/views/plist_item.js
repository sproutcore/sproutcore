// ==========================================================================
// Project:   Greenhouse.PlistItem Unit Test
// Copyright: ©2010 Mike Ball
// ==========================================================================
/*globals Greenhouse module test ok equals same stop start */



var pane = SC.ControlTestPane.design({ height: 32 })
  .add("basic", SC.PlistItemView.design({ 
    content: "List Item"
  }));

pane.show();

window.pane = pane ;

module("Greenhouse.PlistItem",pane.standardSetup());

test("basic", function() {
  var view = pane.view('basic');

});