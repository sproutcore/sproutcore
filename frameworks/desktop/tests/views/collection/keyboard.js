// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            portions copyright @2011 Apple Inc.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================


var controller = SC.ArrayController.create({
	content: "1 2 3 4 5 6 7 8 9 10".w().map(function(x) {
    return SC.Object.create({ value: x });
  })
});

var pane = SC.ControlTestPane.design();
pane.add('default', SC.CollectionView, {
	content: controller.get('arrangedObjects')
});

/**
  Simulates a key press on the specified view.

  @param {SC.View} view the view
  @param {Number} keyCode key to simulate
  @param {Boolean} [isKeyPress] simulate key press event
  @param {Boolean} [shiftKey] simulate shift key pressed
  @param {Boolean} [ctrlKey] simulate ctrlKey pressed
*/
function keyPressOn(view, keyCode, isKeyPress, shiftKey, ctrlKey) {
  var layer = view.get('layer'),
    opts = {
      shiftKey: !!shiftKey,
      ctrlKey: !!ctrlKey,
      keyCode: keyCode,
      charCode: isKeyPress ? keyCode : 0,
      which: keyCode
    },
    ev;

  ok(layer, 'keyPressOn() precond - view %@ should have layer'.fmt(view.toString()));

  ev = SC.Event.simulateEvent(layer, 'keydown', opts);
  SC.Event.trigger(layer, 'keydown', [ev]);

  if (isKeyPress) {
    ev = SC.Event.simulateEvent(layer, 'keypress', opts);
    SC.Event.trigger(layer, 'keypress', [ev]);
  }

  ev = SC.Event.simulateEvent(layer, 'keyup', opts);
  SC.Event.trigger(layer, 'keyup', [ev]);
  SC.RunLoop.begin().end();
  layer = null;
}

module("SC.CollectionView Keyboard events and handlers", {
	setup: function() {
    pane.standardSetup().setup();
	},
	teardown: function() {
		pane.standardSetup().teardown();
	}
});

test("selectAll (ctrl+a handler)", function() {
	SC.run(function() {
		pane.view('default').selectAll();
	});
	equals(pane.view('default').getPath('selection.length'), 10, "selectAll selects all when allowsMultipleSelection is YES (default)");
	SC.run(function() {
		controller.set('allowsMultipleSelection', NO);
		pane.view('default').set('selection', null);
		pane.view('default').selectAll();
	});
	ok(!pane.view('default').getPath('selection.length'), "selectAll has no effect when allowsMultipleSelection is not set");

	// Cleanup
	controller.set('allowsMultipleSelection', YES);
});

test("deselectAll", function() {
	var view = pane.view('default');
	SC.run(function() {
		view.selectAll();
	});
	equals(view.getPath('selection.length'), 10, "PRELIM: All items are selected");
	SC.run(function() {
		view.deselectAll();
	});
	equals(view.getPath('selection.length'), 0, "deselectAll clears the selection when allowsEmptySelection is YES (default)");
	SC.run(function() {
		view.selectAll();
	})
	equals(view.getPath('selection.length'), 10, "PRELIM: All items are re-selected");
	SC.run(function() {
		controller.set('allowsEmptySelection', NO);
		view.deselectAll();
	});
	equals(view.getPath('selection.length'), 10, "deselectAll has no effect when allowsEmptySelection is NO")
});

// There was a specific bug in which insertNewLine when no selection was set, but
// isEditable & canEditContent were true, that it would throw an exception.
test("insertNewline doesn't throw exception when no selection", function() {
	var collection = pane.view('default');

	// Prep.
	collection.set('isEditable', true);
	collection.set('canEditContent', true);

	SC.run(function() {
		try {
			collection.insertNewline();
			ok(true, "Calling insertNewline without a selection should not throw an exception.");
		} catch (ex) {
			ok(false, "Calling insertNewline without a selection should not throw an exception. %@".fmt(ex));
		}
	});
});

test("moveDownAndModifySelection", function () {
  var view = pane.view('default');

  SC.run(function () {
    pane.becomeKeyPane();
    view.set('acceptsFirstResponder', true);
    view.becomeFirstResponder();
    view.select(1);
  });
  equals(view.getPath('selection.length'), 1, 'Should have a single selected row');
  SC.run(function () {
    keyPressOn(view, SC.Event.KEY_DOWN, false, true, false);
  });
  equals(view.getPath('selection.length'), 2, 'Should have an additional selected row');
  SC.run(function () {
    view.select(1);
    controller.set('allowsMultipleSelection', false);
  });
  equals(view.getPath('selection.length'), 1, 'Should have a single selected row');
  SC.run(function () {
    keyPressOn(view, SC.Event.KEY_DOWN, false, true, false);
  });
  equals(view.getPath('selection.length'), 1, 'Should still have a single selected row');

  // Cleanup
  controller.set('allowsMultipleSelection', true);
});

test("moveUpAndModifySelection", function () {
  var view = pane.view('default');

  SC.run(function () {
    pane.becomeKeyPane();
    view.set('acceptsFirstResponder', true);
    view.becomeFirstResponder();
    view.select(1);
  });
  equals(view.getPath('selection.length'), 1, 'Should have a single selected row');
  SC.run(function () {
    keyPressOn(view, SC.Event.KEY_UP, false, true, false);
  });
  equals(view.getPath('selection.length'), 2, 'Should have an additional selected row');
  SC.run(function () {
    view.select(1);
    controller.set('allowsMultipleSelection', false);
  });
  equals(view.getPath('selection.length'), 1, 'Should have a single selected row');
  SC.run(function () {
    keyPressOn(view, SC.Event.KEY_UP, false, true, false);
  });
  equals(view.getPath('selection.length'), 1, 'Should still have a single selected row');

  // Cleanup
  controller.set('allowsMultipleSelection', true);
});

// TODO: yeah all the other keyboard stuff.
