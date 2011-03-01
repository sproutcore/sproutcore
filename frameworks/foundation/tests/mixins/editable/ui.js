// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Apple Inc. and contributors.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/*global module test equals context ok same */

htmlbody('<style> .sc-static-layout { border: 1px red dotted; } </style>');


var pane = SC.ControlTestPane.design()
  .add("aria-role", SC.FieldView.extend(SC.StaticLayout, SC.Editable, 
    {
      localize: YES
    })
  )

  .add("aria-multiline", SC.FieldView.extend(SC.StaticLayout, SC.Editable, 
    {
      isTextArea: YES
    })
  );

pane.show();
module('SC.Editable ui', {
  setup: function() {
    var view = pane.view('aria-role');
  }
});

test("should have role as textbox", function() {
  var view = pane.view('aria-role');
  var label = view.$();  
  equals(label.attr('role'), 'textbox', 'role should be textbox');
});

test("should have aria-multiline as YES", function() {
  var view = pane.view('aria-multiline');
  var label = view.$();  
  equals(label.attr('aria-multiline'), 'true', 'aria-multiline should be true');
});