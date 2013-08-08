// ==========================================================================
// SC.AutoGroupUndoManager Unit Test
// ==========================================================================
/*globals SC */

module("SC.AutoGroupUndoManager");

test("group by time", function() {
  var undoManager = SC.AutoGroupUndoManager.create({
        groupLapse: 50
      }),
      count = 0,
      undoFunc = function() {
        count++;
      };

  undoManager.registerUndo(undoFunc);
  undoManager.registerUndo(undoFunc);

  undoManager.undo();
  equals(count, 2, "every registered actions should have been undo");

  count = 0;
  undoManager.redo();
  equals(count, 2, "every registered actions should have been redo");



  undoManager.reset();
  count = 0;

  undoManager.registerUndo(undoFunc);

  setTimeout(function() {
    undoManager.registerUndo(undoFunc);console.log('1');  

    undoManager.undo();
    equals(count, 2, "2 action should have been undo");

    count = 0;
    undoManager.redo();
    equals(count, 2, "2 action should have been redo");
    
    start();
  }, 10);
  stop();
  
});


test("should not group by time", function() {
  var undoManager = SC.AutoGroupUndoManager.create({
        groupLapse: 50
      }),
      count = 0,
      undoFunc = function() {
        count++;
      };

  undoManager.registerUndo(undoFunc);

  setTimeout(function() {
    undoManager.registerUndo(undoFunc);

    undoManager.undo();
    equals(count, 1, "1 action should have been undo");

    count = 0;
    undoManager.redo();
    equals(count, 1, "1 action should have been redo");
    
    start();
  }, 100);
  stop();
  
});

