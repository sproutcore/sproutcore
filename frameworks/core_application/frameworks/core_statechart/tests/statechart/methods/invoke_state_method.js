// ==========================================================================
// SC.Statechart Unit Test
// ==========================================================================
/*globals SC statechart State */

var TestState;
var obj1, rootSubstate1, stateA, stateB;
var obj2, rootSubstate2, stateC, stateD;

module("SC.Statechart: invokeStateMethod method Tests", {
  setup: function() {
    TestState = SC.State.extend({
      testInvokedCount: 0,
      arg1: undefined,
      arg2: undefined,
      returnValue: undefined,

      testInvoked: function() {
        return this.get('testInvokedCount') > 0;
      }.property('testInvokedCount'),

      test: function(arg1, arg2) {
        this.set('testInvokedCount', this.get('testInvokedCount') + 1);
        this.set('arg1', arg1);
        this.set('arg2', arg2);
        if (this.get('returnValue') !== undefined) {
          return this.get('returnValue');
        }
      }
    });

    obj1 = SC.Object.extend(SC.StatechartManager, {

      initialState: 'stateA',

      rootSubstateExample: TestState.design({
        testX: function(arg1, arg2) {
          this.set('testInvokedCount', this.get('testInvokedCount') + 1);
          this.set('arg1', arg1);
          this.set('arg2', arg2);
          if (this.get('returnValue') !== undefined) {
            return this.get('returnValue');
          }
        }
      }),

      stateA: TestState.design(),

      stateB: TestState.design()

    });

    obj1 = obj1.create();
    rootSubstate1 = obj1.get('rootSubstate');
    stateA = obj1.getState('stateA');
    stateB = obj1.getState('stateB');

    obj2 = SC.Object.extend(SC.StatechartManager, {

      statesAreConcurrent: YES,

      rootSubstateExample: TestState.design({
        testX: function(arg1, arg2) {
          this.set('testInvokedCount', this.get('testInvokedCount') + 1);
          this.set('arg1', arg1);
          this.set('arg2', arg2);
          if (this.get('returnValue') !== undefined) {
            return this.get('returnValue');
          }
        }
      }),

      stateC: TestState.design(),

      stateD: TestState.design()

    });

    obj2 = obj2.create();
    rootSubstate2 = obj2.get('rootSubstate');
    stateC = obj2.getState('stateC');
    stateD = obj2.getState('stateD');
  },

  teardown: function() {
    TestState = obj1 = rootSubstate1 = stateA = stateB = null;
    obj2 = rootSubstate2 = stateC = stateD = null;
  }
});

test("check obj1 - invoke method test1", function() {
  var result = obj1.invokeStateMethod('test1');
  ok(!rootSubstate1.get('testInvoked'), "root state test method should not have been invoked");
  ok(!stateA.get('testInvoked'), "state A's test method should not have been invoked");
  ok(!stateB.get('testInvoked'), "state B's test method should not have been invoked");
});

test("check obj1 - invoke method test, current state A, no args, no return value", function() {
  var result = obj1.invokeStateMethod('test');
  equals(stateA.get('testInvokedCount'), 1, "state A's test method should have been invoked once");
  equals(stateA.get('arg1'), undefined, "state A's arg1 method should be undefined");
  equals(stateA.get('arg2'), undefined, "state A's arg2 method should be undefined");
  equals(result, undefined, "returned result should be undefined");
  ok(!rootSubstate1.get('testInvoked'), "root state's test method should not have been invoked");
  ok(!stateB.get('testInvoked'), "state B's test method should not have been invoked");
});

test("check obj1 - invoke method test, current state A, one args, no return value", function() {
  var result = obj1.invokeStateMethod('test', "frozen");
  ok(stateA.get('testInvoked'), "state A's test method should have been invoked");
  equals(stateA.get('arg1'), "frozen", "state A's arg1 method should be 'frozen'");
  equals(stateA.get('arg2'), undefined, "state A's arg2 method should be undefined");
  ok(!rootSubstate1.get('testInvoked'), "root state's test method should not have been invoked");
  ok(!stateB.get('testInvoked'), "state B's test method should not have been invoked");
});

test("check obj1 - invoke method test, current state A, two args, no return value", function() {
  var result = obj1.invokeStateMethod('test', 'frozen', 'canuck');
  ok(stateA.get('testInvoked'), "state A's test method should have been invoked");
  equals(stateA.get('arg1'), "frozen", "state A's arg1 method should be 'frozen'");
  equals(stateA.get('arg2'), "canuck", "state A's arg2 method should be undefined");
  ok(!rootSubstate1.get('testInvoked'), "root state's test method should not have been invoked");
  ok(!stateB.get('testInvoked'), "state B's test method should not have been invoked");
});

test("check obj1 - invoke method test, current state A, no args, return value", function() {
  stateA.set('returnValue', 100);
  var result = obj1.invokeStateMethod('test');
  ok(stateA.get('testInvoked'), "state A's test method should have been invoked");
  equals(result, 100, "returned result should be 100");
  ok(!rootSubstate1.get('testInvoked'), "root state's test method should not have been invoked");
  ok(!stateB.get('testInvoked'), "state B's test method should not have been invoked");
});

test("check obj1 - invoke method test, current state B, two args, return value", function() {
  stateB.set('returnValue', 100);
  obj1.gotoSubstate(stateB);
  ok(stateB.get('isCurrentState'), "state B should be curren state");
  var result = obj1.invokeStateMethod('test', 'frozen', 'canuck');
  ok(!stateA.get('testInvoked'), "state A's test method should not have been invoked");
  equals(stateB.get('testInvokedCount'), 1, "state B's test method should have been invoked once");
  equals(stateB.get('arg1'), 'frozen', "state B's arg1 method should be 'frozen'");
  equals(stateB.get('arg2'), 'canuck', "state B's arg2 method should be 'canuck'");
  equals(result, 100, "returned result should be 100");
  ok(!rootSubstate1.get('testInvoked'), "root state's test method should not have been invoked");
});

test("check obj1 - invoke method test, current state A, use callback", function() {
  var callbackState, callbackResult;
  obj1.invokeStateMethod('test', function(state, result) {
    callbackState = state;
    callbackResult = result;
  });
  ok(stateA.get('testInvoked'), "state A's test method should have been invoked");
  ok(!stateB.get('testInvoked'), "state B's test method should not have been invoked");
  equals(callbackState, stateA, "state should be state A");
  equals(callbackResult, undefined, "result should be undefined");
  ok(!rootSubstate1.get('testInvoked'), "root state's test method should not have been invoked");
});

test("check obj1- invoke method test, current state B, use callback", function() {
  var callbackState, callbackResult;
  obj1.gotoSubstate(stateB);
  stateB.set('returnValue', 100);
  obj1.invokeStateMethod('test', function(state, result) {
    callbackState = state;
    callbackResult = result;
  });
  ok(!stateA.get('testInvoked'), "state A's test method should not have been invoked");
  ok(stateB.get('testInvoked'), "state B's test method should have been invoked");
  equals(callbackState, stateB, "state should be state B");
  equals(callbackResult, 100, "result should be 100");
  ok(!rootSubstate1.get('testInvoked'), "root state's test method should not have been invoked");
});

test("check obj1 - invoke method testX", function() {
  rootSubstate1.set('returnValue', 100);
  var result = obj1.invokeStateMethod('testX');
  equals(rootSubstate1.get('testInvokedCount'), 1, "root state's testX method should not have been invoked once");
  equals(result, 100, "result should have value 100");
  ok(!stateA.get('testInvoked'), "state A's test method should have been invoked");
  ok(!stateB.get('testInvoked'), "state B's test method should not have been invoked");
});

test("check obj2 - invoke method test1", function() {
  var result = obj2.invokeStateMethod('test1');
  ok(!rootSubstate2.get('testInvoked'), "root state test method should not have been invoked");
  ok(!stateC.get('testInvoked'), "state A's test method should not have been invoked");
  ok(!stateD.get('testInvoked'), "state B's test method should not have been invoked");
});

test("check obj2 - invoke test, no args, no return value", function() {
  var result = obj2.invokeStateMethod('test');
  equals(stateC.get('testInvokedCount'), 1, "state C's test method should have been invoked once");
  equals(stateD.get('testInvokedCount'), 1, "state D's test method should have been invoked once");
  ok(!rootSubstate1.get('testInvoked'), "root state test method should not have been invoked");
  equals(stateC.get('arg1'), undefined, "state C's arg1 method should be undefined");
  equals(stateC.get('arg2'), undefined, "state C's arg2 method should be undefined");
  equals(stateD.get('arg1'), undefined, "state D's arg1 method should be undefined");
  equals(stateD.get('arg2'), undefined, "state D's arg2 method should be undefined");
  equals(result, undefined, "returned result should be undefined");
});

test("check obj2 - invoke test, two args, return value, callback", function() {
  var numCallbacks = 0,
      callbackInfo = {};
  stateC.set('returnValue', 100);
  stateD.set('returnValue', 200);
  var result = obj2.invokeStateMethod('test', 'frozen', 'canuck', function(state, result) {
    numCallbacks += 1;
    callbackInfo['state' + numCallbacks] = state;
    callbackInfo['result' + numCallbacks] = result;
  });

  ok(!rootSubstate1.get('testInvoked'), "root state test method should not have been invoked");
  equals(stateC.get('testInvokedCount'), 1, "state C's test method should have been invoked once");
  equals(stateD.get('testInvokedCount'), 1, "state D's test method should have been invoked once");

  equals(stateC.get('arg1'), 'frozen', "state C's arg1 method should be 'frozen'");
  equals(stateC.get('arg2'), 'canuck', "state C's arg2 method should be 'canuck'");

  equals(stateD.get('arg1'), 'frozen', "state D's arg1 method should be 'frozen'");
  equals(stateD.get('arg2'), 'canuck', "state D's arg2 method should be 'canuck'");

  equals(numCallbacks, 2, "callback should have been invoked twice");
  equals(callbackInfo['state1'], stateC, "first callback state arg should be state C");
  equals(callbackInfo['result1'], 100, "first callback result arg should be 100");
  equals(callbackInfo['state2'], stateD, "second callback state arg should be state D");
  equals(callbackInfo['result2'], 200, "second callback result arg should be 200");

  equals(result, undefined, "returned result should be undefined");
});

test("check obj2 - invoke method testX", function() {
  rootSubstate2.set('returnValue', 100);
  var result = obj2.invokeStateMethod('testX');
  equals(rootSubstate2.get('testInvokedCount'), 1, "root state's testX method should not have been invoked once");
  equals(result, 100, "result should have value 100");
  ok(!stateA.get('testInvoked'), "state A's test method should have been invoked");
  ok(!stateB.get('testInvoked'), "state B's test method should not have been invoked");
});
