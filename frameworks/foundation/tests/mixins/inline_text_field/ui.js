// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Apple Inc. and contributors.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/*global module test equals context ok same */


var pane = SC.ControlTestPane.design()
  .add("aria-role", SC.InlineTextFieldView.extend({
      localize: YES
    })
  )

  .add("aria-multiline", SC.InlineTextFieldView.extend({
      isTextArea: YES
    })
  )
  
  .add("aria-disabled", SC.InlineTextFieldView.extend({
      isEnabled: NO
    })
  )
  
  .add("aria-invalid", SC.InlineTextFieldView.extend({
      value: SC.Error.create({errorValue:'Error Message'})
    })
  );
pane.show();

module('SC.InlineTextFieldView ui', {
  setup: function() {
    htmlbody('<style> .sc-static-layout { border: 1px red dotted; } </style>');
    var view = pane.view('aria-role');
  },
  teardown: function(){
    clearHtmlbody();
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

test("should have aria-disabled as YES", function() {
  var view = pane.view('aria-disabled');
  var label = view.$();  
  equals(label.attr('aria-disabled'), 'true', 'aria-disabled should be true');
});

test("should have aria-invalid as YES", function() {
  var view = pane.view('aria-invalid');
  var label = view.$();
  equals(label.attr('aria-invalid'), 'true', 'aria-invalid should be true');
});
