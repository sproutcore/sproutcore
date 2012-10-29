// ==========================================================================
// Project:   SproutCore
// Copyright: @2012 7x7 Software, Inc.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================
/*globals R, CoreTest, module, test, equals*/


var pane1, pane2;


module("SC.RootResponder Design Mode Support", {
  setup: function() {
    pane1 = SC.Pane.create({
      updateDesignMode: CoreTest.stub('updateDesignMode', SC.Pane.prototype.updateDesignMode)
    }).append();

    pane2 = SC.Pane.create({
      updateDesignMode: CoreTest.stub('updateDesignMode', SC.Pane.prototype.updateDesignMode)
    }).append();
  },

  teardown: function() {
    pane1.remove();
    pane2.remove();
    pane1 = pane2 = null;
  }

});

test("When you set designModes on the root responder, it preps internal arrays.", function () {
  var currentWidth,
    designModes,
    responder = SC.RootResponder.responder;

  currentWidth = responder.get('currentWindowSize').width;

  equals(responder._designModeNames, undefined, "If no designModes value is set, there should not be any _designModeNames internal array.");
  equals(responder._designModeWidths, undefined, "If no designModes value is set, there should not be any _designModeNames internal array.");

  designModes = { small: currentWidth - 10, large: Infinity };

  responder.set('designModes', designModes);
  same(responder._designModeNames, ['small', 'large'], "If designModes value is set, there should be an ordered _designModeNames internal array.");
  same(responder._designModeWidths, [currentWidth - 10, Infinity], "If designModes value is set, there should be an ordered_designModeNames internal array.");

  designModes = { small: currentWidth - 10, medium: currentWidth + 10, large: Infinity };

  responder.set('designModes', designModes);
  same(responder._designModeNames, ['small', 'medium', 'large'], "If designModes value is set, there should be an ordered _designModeNames internal array.");
  same(responder._designModeWidths, [currentWidth - 10, currentWidth + 10, Infinity], "If designModes value is set, there should be an ordered_designModeNames internal array.");

  responder.set('designModes', null);
  equals(responder._designModeNames, undefined, "If no designModes value is set, there should not be any _designModeNames internal array.");
  equals(responder._designModeWidths, undefined, "If no designModes value is set, there should not be any _designModeNames internal array.");
});

test("When you set designModes on the root responder, it calls updateDesignMode on all its panes.", function () {
  var currentWidth,
    designModes,
    responder = SC.RootResponder.responder;

  currentWidth = responder.get('currentWindowSize').width;

  pane1.updateDesignMode.expect(1);
  pane2.updateDesignMode.expect(1);

  designModes = { small: currentWidth - 10, large: Infinity };

  responder.set('designModes', designModes);
  pane1.updateDesignMode.expect(2);
  pane2.updateDesignMode.expect(2);

  designModes = { small: currentWidth - 10, medium: currentWidth + 10, large: Infinity };

  responder.set('designModes', designModes);
  pane1.updateDesignMode.expect(3);
  pane2.updateDesignMode.expect(3);

  responder.set('designModes', null);
  pane1.updateDesignMode.expect(4);
  pane2.updateDesignMode.expect(4);
});
