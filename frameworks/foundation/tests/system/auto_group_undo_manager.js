// ==========================================================================
// SC.AutoGroupUndoManager Unit Test
// ==========================================================================
/*globals SC */

module("SC.AutoGroupUndoManager");

test("group by time", function() {
  var undoManager = SC.AutoGroupUndoManager.create({
        groupLapse: 50
      }),
    obj = SC.Object.create({
      undoManager: undoManager,
      value: null,
      valDidChange: function() {
        var that = this,
          value = this._value;
        undoManager.registerUndo(function () { that.set('value', value); });
        this._value = this.get('value');
      }.observes('value')
    });

  obj.set('value', 'a');
  obj.set('value', 'ab');

  undoManager.undo();
  equals(obj.get('value'), null, "every registered actions should have been undo");

  undoManager.redo();
  equals(obj.get('value'), 'ab', "every registered actions should have been redo");



  obj.set('value', null);
  undoManager.reset();

  obj.set('value', 'a');

  setTimeout(function() {
    obj.set('value', 'ab');
    obj.set('value', 'abc');

    undoManager.undo();
    equals(obj.get('value'), null, "every registered actions should have been undo");

    undoManager.redo();
    equals(obj.get('value'), 'abc', "every registered actions should have been redo");
    
    start();
  }, 10);
  stop();
  
});


test("should not group by time", function() {
  var undoManager = SC.AutoGroupUndoManager.create({
      groupLapse: 50
    }),
    obj = SC.Object.create({
      undoManager: undoManager,
      value: null,
      valDidChange: function() {
        var that = this,
          value = this._value;
        undoManager.registerUndo(function () { that.set('value', value); });
        this._value = this.get('value');
      }.observes('value')
    });

  obj.set('value', 'a');

  setTimeout(function() {
    obj.set('value', 'ab');

    undoManager.undo();
    equals(obj.get('value'), 'a', "1 action should have been undo");

    undoManager.redo();
    equals(obj.get('value'), 'ab', "1 action should have been redo");
    
    start();
  }, 100);
  stop();
  
});

