(function() {
  var array, callCount, added, removed, changeIndex;
  module("Enumerable Observers", {
    setup: function() {
      array = [1, 2, 3];

      array.addEnumerableObserver(function(addedObjects, removedObjects, index, source) {
        callCount = callCount ? callCount++ : 1;
        added = addedObjects;
        removed = removedObjects;
        changeIndex = index;
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

  test("should include both added and removed objects", function() {
    array.replace(1, 1, [6, 7, 8]);

    shouldAddAndRemove([6, 7, 8], [2]);
    equals(changeIndex, 1, "passes correct index of change");
  });

  test("should include enumerable as fourth parameter", function() {
    var testArray = ["John", "Paul", "Peter", "George"];

    testArray.addEnumerableObserver(function(added, removed, index, source) {
      equals(testArray, source, "passes correct enumerable as source parameter");
    });

    testArray.replace(2, 1, "Ringo");
  });

  test("should take target and action as callback", function() {
    var testArray = ["Davy", "Micky", "Peter"];
    var callbackCalled = false;
    var boyBandController = SC.Object.create({
      boyBandDidChange: function(added, removed, index, source, context) {
        callbackCalled = true;
        equals(context, "foo", "passes optional context parameter");
      }
    });

    testArray.addEnumerableObserver(boyBandController, "boyBandDidChange", "foo");
    testArray.pushObject("Michael");
    ok(callbackCalled, "calls callback on correct object");
  });

  test("should fire only once per mutation operation", function() {
      var boyBand, callbackCallCount;
      var boyBandController = SC.Object.create({
        boyBandDidChange: function(added, removed, index, source, context) {
          callbackCallCount++;
        }
      });

      function clearCallBackCountAndResetBoyBand(members) {
          callbackCallCount = 0;
          boyBand.removeEnumerableObserver(boyBandController);
          boyBand = members;
          boyBand.addEnumerableObserver(boyBandController, "boyBandDidChange");
      }

      clearCallBackCountAndResetBoyBand(["Davy", "Micky", "Peter"]);
      boyBand.pushObjects(["Michael", "Ricky", "Usher", "40cent"]);
      equals(callbackCallCount, 1, "fires only once when adding many objects");

      clearCallBackCountAndResetBoyBand(["Davy", "Micky", "Peter", "Michael", "Ricky", "Usher", "40cent"]);
      boyBand.removeObjects(["Michael", "Ricky", "Usher", "40cent"]);
      equals(callbackCallCount, 1, "fires only once when removing many objects");

      clearCallBackCountAndResetBoyBand(["Davy", "Micky", "Peter", "Michael", "Ricky", "Usher", "40cent"]);
      boyBand.removeAt(3, 4);
      equals(callbackCallCount, 1, "fires only once when removing many objects starting at a specific index");

      clearCallBackCountAndResetBoyBand(["Davy", "Micky", "Peter", "James"]);
      boyBand.replace(3, 0, ["Michael", "Ricky", "Usher", "40cent"]);
      equals(callbackCallCount, 1, "fires only once when replacing ZERO objects with multiple objects");

      clearCallBackCountAndResetBoyBand(["Davy", "Micky", "Peter", "James"]);
      boyBand.replace(3, 1, ["Michael", "Ricky", "Usher", "40cent"]);
      equals(callbackCallCount, 1, "fires only once when replacing ONE objects with multiple objects");

      clearCallBackCountAndResetBoyBand(["Davy", "Micky", "Peter", "James", "Pico", "Nano", "Micro"]);
      boyBand.replace(3, 3, ["Michael", "Ricky", "Usher", "40cent"]);
      equals(callbackCallCount, 1, "fires only once when replacing MANY objects with multiple objects");
   });
})();
