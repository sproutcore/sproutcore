// ==========================================================================
// SC.UndoManager Unit Test
// ==========================================================================
/*globals SC */

module("SC.UndoManager");

test("register undo", function () {
  var undoManager = SC.UndoManager.create(),
    count = 0,
    undoFunc = function () {
      count++;
    };

  undoManager.registerUndo(undoFunc, 'group1');

  equals(undoManager.get('undoActionName'), 'group1', "The name of the undo stack should be 'group1'");

  undoManager.undo();
  equals(count, 1, "the action should have been undo");

  ok(undoManager.get('canRedo'), "We should be able to redo");
  ok(!undoManager.get('canUndo'), "We shouldn't be able to undo");
  equals(undoManager.get('redoActionName'), 'group1', "The name of the undo stack should be 'group1'");

  count = 0;
  undoManager.redo();
  equals(count, 1, "the action should have been redo");

  ok(undoManager.get('canUndo'), "We should be able to undo");
  ok(!undoManager.get('canRedo'), "We shouldn't be able to redo");

  count = 0;
  undoManager.registerUndo(undoFunc, 'group2');
  undoManager.registerUndo(undoFunc, 'group3');

  equals(undoManager.get('undoActionName'), 'group3', "The name of the undo stack should be 'group3'");

  undoManager.undo();

  equals(undoManager.get('redoActionName'), 'group3', "The name of the redo stack should be 'group3'");
  equals(undoManager.get('undoActionName'), 'group2', "The name of the undo stack should be 'group2'");

  undoManager.undo();

  equals(undoManager.get('redoActionName'), 'group2', "The name of the redo stack should be 'group2'");
  equals(undoManager.get('undoActionName'), 'group1', "The name of the undo stack should be 'group1'");

  undoManager.undo();
  undoManager.undo();

  equals(count, 3, "3 actions should have been undo");
  ok(!undoManager.get('canUndo'), "We shouldn't be able to undo");

  count = 0;
  undoManager.redo();
  undoManager.redo();
  undoManager.redo();

  equals(count, 3, "3 actions should have been redo");
  ok(!undoManager.get('canRedo'), "We shouldn't be able to redo");
});

test("register grouped undo", function () {
  var undoManager = SC.UndoManager.create(),
    count = 0,
    undoFunc = function () {
      count++;
    };

  undoManager.registerUndo(undoFunc, 'group1');
  undoManager.registerGroupedUndo(undoFunc);

  equals(undoManager.get('undoActionName'), 'group1', "The name of the undo stack should be 'group1'");

  undoManager.undo();
  equals(count, 2, "2 actions should have been undo");

  equals(undoManager.get('redoActionName'), 'group1', "The name of the redo stack should be 'group1'");

  count = 0;
  undoManager.redo();
  equals(count, 2, "2 actions should have been redo");
});

test("set action name", function () {
  var undoManager = SC.UndoManager.create();

  undoManager.setActionName('group1');
  undoManager.registerUndo();

  equals(undoManager.get('undoActionName'), null, "The name of the undo stack should be null");

  undoManager.setActionName('group1');

  equals(undoManager.get('undoActionName'), 'group1', "The name of the undo stack should be 'group1'");
});

test("reset", function () {
  var undoManager = SC.UndoManager.create();

  undoManager.registerUndo(function () {});
  undoManager.registerUndo(function () {});
  undoManager.undo();

  ok(undoManager.get('canUndo'), "We should be able to undo");
  ok(undoManager.get('canRedo'), "We should be able to redo");

  undoManager.reset();

  ok(!undoManager.get('canUndo'), "We shouldn't be able to undo");
  ok(!undoManager.get('canRedo'), "We shouldn't be able to redo");
});
