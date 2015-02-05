// ==========================================================================
// SC Unit Test
// ==========================================================================
/*globals SC */

var statechart,
    TestState,
    context,
    monitor,
    root,
    stateA,
    stateB,
    stateC,
    stateD,
    stateE,
    stateF;

module("SC.Statechart: Supply Context Parameter gotoHistoryState - Without Concurrent States", {
  setup: function() {

    TestState = SC.State.extend({
      enterSubstateContext: null,
      exitSubstateContext: null,

      enterSubstate: function(context) {
        this.set('enterSubstateContext', context);
      },

      exitSubstate: function(context) {
        this.set('exitSubstateContext', context);
      }
    });

    statechart = SC.Statechart.create({

      monitorIsActive: YES,

      rootSubstate: TestState.design({

        initialSubstate: 'a',

        a: TestState.design({
          initialSubstate: 'c',
          c: TestState.design(),
          d: TestState.design()
        }),

        b: TestState.design({
          initialSubstate: 'e',
          e: TestState.design(),
          f: TestState.design()
        })
      })

    });

    statechart.initStatechart();

    statechart.gotoSubstate('d');

    context = { foo: 100 };

    monitor = statechart.get('monitor');
    root = statechart.get('rootSubstate');
    stateA = statechart.getState('a');
    stateB = statechart.getState('b');
    stateC = statechart.getState('c');
    stateD = statechart.getState('d');
    stateE = statechart.getState('e');
    stateF = statechart.getState('f');
  },

  teardown: function() {
    statechart = TestState = monitor = context = null;
    root = stateA = stateB = stateC = stateD = stateE = stateF;
  }
});

test("check statechart initialization", function() {
  equals(root.get('enterSubstateContext'), null);
  equals(stateA.get('enterSubstateContext'), null);
  equals(stateD.get('enterSubstateContext'), null);
});

test("pass no context when going to state a's history state using statechart", function() {
  statechart.gotoSubstate('f');
  statechart.gotoHistoryState('a');
  equals(stateD.get('isCurrentState'), true);
  equals(stateD.get('enterSubstateContext'), null);
  equals(stateA.get('enterSubstateContext'), null);
  equals(stateB.get('exitSubstateContext'), null);
  equals(stateF.get('exitSubstateContext'), null);
});

test("pass no context when going to state a's history state using state", function() {
  stateD.gotoSubstate('f');
  stateF.gotoHistoryState('a');
  equals(stateD.get('isCurrentState'), true);
  equals(stateD.get('enterSubstateContext'), null, "state D's enterSubstate method should not be passed a context value");
  equals(stateA.get('enterSubstateContext'), null, "state A's enterSubstate method should not be passed a context value");
  equals(stateB.get('exitSubstateContext'), null, "state B's enterSubstate method should not be passed a context value");
  equals(stateF.get('exitSubstateContext'), null, "state F's enterSubstate method should not be passed a context value");
});

test("pass context when going to state a's history state using statechart - gotoHistoryState('f', context)", function() {
  statechart.gotoSubstate('f');
  statechart.gotoHistoryState('a', context);
  equals(stateD.get('isCurrentState'), true);
  equals(stateD.get('enterSubstateContext'), context, 'state d should have context upon entering');
  equals(stateA.get('enterSubstateContext'), context, 'state a should have context upon entering');
  equals(stateB.get('exitSubstateContext'), context, 'state b should have context upon exiting');
  equals(stateF.get('exitSubstateContext'), context, 'state f should have context upon exiting');
});

test("pass context when going to state a's history state using state - gotoHistoryState('f', context)", function() {
  statechart.gotoSubstate('f');
  stateF.gotoHistoryState('a', context);
  equals(stateD.get('isCurrentState'), true);
  equals(stateD.get('enterSubstateContext'), context, 'state d should have context upon entering');
  equals(stateA.get('enterSubstateContext'), context, 'state a should have context upon entering');
  equals(stateB.get('exitSubstateContext'), context, 'state b should have context upon exiting');
  equals(stateF.get('exitSubstateContext'), context, 'state f should have context upon exiting');
});

test("pass context when going to state a's history state using statechart - gotoHistoryState('f', stateF, context)", function() {
  statechart.gotoSubstate('f');
  statechart.gotoHistoryState('a', stateF, context);
  equals(stateD.get('isCurrentState'), true);
  equals(stateD.get('enterSubstateContext'), context, 'state d should have context upon entering');
  equals(stateA.get('enterSubstateContext'), context, 'state a should have context upon entering');
  equals(stateB.get('exitSubstateContext'), context, 'state b should have context upon exiting');
  equals(stateF.get('exitSubstateContext'), context, 'state f should have context upon exiting');
});

test("pass context when going to state a's history state using statechart - gotoHistoryState('f', true, context)", function() {
  statechart.gotoSubstate('f');
  statechart.gotoHistoryState('a', true, context);
  equals(stateD.get('isCurrentState'), true);
  equals(stateD.get('enterSubstateContext'), context, 'state d should have context upon entering');
  equals(stateA.get('enterSubstateContext'), context, 'state a should have context upon entering');
  equals(stateB.get('exitSubstateContext'), context, 'state b should have context upon exiting');
  equals(stateF.get('exitSubstateContext'), context, 'state f should have context upon exiting');
});

test("pass context when going to state a's history state using statechart - gotoHistoryState('f', stateF, true, context)", function() {
  statechart.gotoSubstate('f');
  statechart.gotoHistoryState('a', stateF, true, context);
  equals(stateD.get('isCurrentState'), true);
  equals(stateD.get('enterSubstateContext'), context, 'state d should have context upon entering');
  equals(stateA.get('enterSubstateContext'), context, 'state a should have context upon entering');
  equals(stateB.get('exitSubstateContext'), context, 'state b should have context upon exiting');
  equals(stateF.get('exitSubstateContext'), context, 'state f should have context upon exiting');
});

test("pass context when going to state a's history state using state - gotoHistoryState('f', true, context)", function() {
  statechart.gotoSubstate('f');
  stateF.gotoHistoryState('a', true, context);
  equals(stateD.get('isCurrentState'), true);
  equals(stateD.get('enterSubstateContext'), context, 'state d should have context upon entering');
  equals(stateA.get('enterSubstateContext'), context, 'state a should have context upon entering');
  equals(stateB.get('exitSubstateContext'), context, 'state b should have context upon exiting');
  equals(stateF.get('exitSubstateContext'), context, 'state f should have context upon exiting');
});
