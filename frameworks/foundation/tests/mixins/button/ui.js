// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2010 Apple Inc. and contributors.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/*global module test equals context ok same */

htmlbody('<style> .sc-static-layout { border: 1px red dotted; } </style>');


var pane = SC.ControlTestPane.design()
  .add("basic", SC.View.extend(SC.Control, SC.Button, 
    {
      localize: YES,
      displayProperties: ['title'],
      render: function(context, firstTime) {
        this.renderTitle(context, firstTime);
      },
      title: "Hello World"
    })
  );

pane.show();

module('SC.Button ui', {
  setup: function() {
    var view = pane.view('basic');
  }
});

test("should set the innerHTML to the title", function() {
  var view = pane.view('basic');
  
  ok(view.$('label'), 'button has no label');
  var label = view.$('label');
  
  ok(label[0], 'label has no html node');
  var htmlNode = label[0];
  
  equals(htmlNode.innerHTML, 'Hello World', 'innerHTML should be set to title');
});

test("should modify the innerHTML if the title changes", function() {
  var view = pane.view('basic');
  
  SC.RunLoop.begin();
  view.set('title', 'Goodbye World');
  SC.RunLoop.end();
  
  var label = view.$('label');
  var htmlNode = label[0];
  
  equals(htmlNode.innerHTML, 'Goodbye World', 'innerHTML should be modified when title changes');
});

test("should still modify the innerHTML if the title changes and then changes back to previous value", function() {
  var view = pane.view('basic');
  
  SC.RunLoop.begin();
  view.set('title', 'Hello World');
  SC.RunLoop.end();
  
  var label = view.$('label');
  var htmlNode = label[0];
  
  equals(htmlNode.innerHTML, 'Hello World', 'innerHTML should be modified when title changes and then changes back to original value');
});
