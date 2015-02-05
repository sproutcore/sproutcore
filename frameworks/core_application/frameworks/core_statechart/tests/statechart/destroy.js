// ==========================================================================
// SC.Statechart Unit Test
// ==========================================================================
/*globals SC statechart State */

var obj, rootSubstate, stateA, stateB;

module("SC.Statechart: Destroy Statechart Tests", {
  setup: function() {

    obj = SC.Object.create(SC.StatechartManager, {

      initialState: 'stateA',

      stateA: SC.State.design(),

      stateB: SC.State.design()

    });

    obj.initStatechart();
    rootSubstate = obj.get('rootSubstate');
    stateA = obj.getState('stateA');
    stateB = obj.getState('stateB');
  },

  teardown: function() {
    obj = rootSubstate = stateA = stateB = null;
  }
});

test("check obj before and after destroy", function() {
  ok(!obj.get('isDestroyed'), "obj should not be destroyed");
  ok(obj.hasObserverFor('owner'), "obj should have observers for property owner");
  ok(obj.hasObserverFor('trace'), "obj should have observers for property trace");
  equals(obj.get('rootSubstate'), rootSubstate, "object should have a root state");

  ok(!rootSubstate.get('isDestroyed'), "root state should not be destoryed");
  equals(rootSubstate.getPath('substates.length'), 2, "root state should have two substates");
  equals(rootSubstate.getPath('currentSubstates.length'), 1, "root state should one current substate");
  equals(rootSubstate.get('historyState'), stateA, "root state should have history state of A");
  equals(rootSubstate.get('initialSubstate'), stateA, "root state should have initial substate of A");
  equals(rootSubstate.get('statechart'), obj, "root state's statechart should be obj");
  equals(rootSubstate.get('owner'), obj, "root state's owner should be obj");

  ok(!stateA.get('isDestroyed'), "state A should not be destoryed");
  equals(stateA.get('parentState'), rootSubstate, "state A should have a parent state of root state");

  ok(!stateB.get('isDestroyed'), "state B should not be destroyed");
  equals(stateB.get('parentState'), rootSubstate, "state B should have a parent state of root state");

  obj.destroy();

  ok(obj.get('isDestroyed'), "obj should be destroyed");
  ok(!obj.hasObserverFor('owner'), "obj should not have observers for property owner");
  ok(!obj.hasObserverFor('trace'), "obj should not have observers for property trace");
  equals(obj.get('rootSubstate'), null, "obj should not have a root state");

  ok(rootSubstate.get('isDestroyed'), "root state should be destroyed");
  equals(rootSubstate.get('substates'), null, "root state should not have substates");
  equals(rootSubstate.get('currentSubstates'), null, "root state should not have current substates");
  equals(rootSubstate.get('parentState'), null, "root state should not have a parent state");
  equals(rootSubstate.get('historyState'), null, "root state should not have a history state");
  equals(rootSubstate.get('initialSubstate'), null, "root state should not have an initial substate");
  equals(rootSubstate.get('statechart'), null, "root state's statechart should be null");
  equals(rootSubstate.get('owner'), null, "root state's owner should be null");

  ok(stateA.get('isDestroyed'), "state A should be destroyed");
  equals(stateA.get('parentState'), null, "state A should not have a parent state");

  ok(stateB.get('isDestroyed'), "state B should be destroyed");
  equals(stateB.get('parentState'), null, "state B should not have a parent state");
});
