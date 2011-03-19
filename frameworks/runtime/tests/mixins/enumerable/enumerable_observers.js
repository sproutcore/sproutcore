(function() {
  var array, callCount, added, removed;
  module("Enumerable Observers", {
    setup: function() {
      array = [1, 2, 3];

      array.addEnumerableObserver(function(source, addedObjects, removedObjects) {
        callCount = callCount ? callCount++ : 1;
        added = addedObjects;
        removed = removedObjects;
      });
    }
  });

  var shouldAddAndRemove = function(add, remove) {
    if (!add) { add = []; }
    if (!remove) { remove = []; }

    var fmt = function(a,b) {
      var ret = '[';
      ret += a.join(', ');
      ret += '] equals [';
      ret += b.join(', ') + ']';

      return ret;
    };

    ok(add.isEqual(added), fmt(add, added));
    ok(remove.isEqual(removed), fmt(remove, removed));
  };

  test("should be called when an object is added to an enumerable", function() {
    array.pushObject(4);
    shouldAddAndRemove([4], []);
  });

  test("should not be called when the observer is removed", function() {
    var called;
    var observer = function() {
      called = true;
    };

    array.addEnumerableObserver(observer);

    array.pushObject(4);
    ok(called, "precond - observer fires when added");
    called = false;

    array.removeEnumerableObserver(observer);
    array.pushObject(5);
    ok(!called, "observer does not fire after being removed");
  });
})();
