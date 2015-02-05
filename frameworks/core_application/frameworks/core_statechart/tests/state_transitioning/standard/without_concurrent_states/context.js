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

module("SC.Statechart: Supply Context Parameter to gotoSubstate - Without Concurrent States", {
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
  equals(stateC.get('enterSubstateContext'), null);
});

test("pass no context when going to state f using statechart", function() {
  statechart.gotoSubstate('f');
  equals(stateF.get('isCurrentState'), true);
  equals(stateC.get('exitSubstateContext'), null);
  equals(stateA.get('exitSubstateContext'), null);
  equals(stateB.get('enterSubstateContext'), null);
  equals(stateF.get('enterSubstateContext'), null);
});

test("pass no context when going to state f using state", function() {
  stateC.gotoSubstate('f');
  equals(stateF.get('isCurrentState'), true);
  equals(stateC.get('exitSubstateContext'), null);
  equals(stateA.get('exitSubstateContext'), null);
  equals(stateB.get('enterSubstateContext'), null);
  equals(stateF.get('enterSubstateContext'), null);
});

test("pass context when going to state f using statechart - gotoSubstate('f', context)", function() {
  statechart.gotoSubstate('f', context);
  equals(stateF.get('isCurrentState'), true);
  equals(stateC.get('exitSubstateContext'), context, 'state c should have context upon exiting');
  equals(stateA.get('exitSubstateContext'), context, 'state a should have context upon exiting');
  equals(stateB.get('enterSubstateContext'), context, 'state b should have context upon entering');
  equals(stateF.get('enterSubstateContext'), context, 'state f should have context upon entering');
});

test("pass context when going to state f using state - gotoSubstate('f', context)", function() {
  stateC.gotoSubstate('f', context);
  equals(stateF.get('isCurrentState'), true);
  equals(stateC.get('exitSubstateContext'), context, 'state c should have context upon exiting');
  equals(stateA.get('exitSubstateContext'), context, 'state a should have context upon exiting');
  equals(stateB.get('enterSubstateContext'), context, 'state b should have context upon entering');
  equals(stateF.get('enterSubstateContext'), context, 'state f should have context upon entering');
});

test("pass context when going to state f using statechart - gotoSubstate('f', stateC, context) ", function() {
  statechart.gotoSubstate('f', stateC, context);
  equals(stateF.get('isCurrentState'), true);
  equals(stateC.get('exitSubstateContext'), context, 'state c should have context upon exiting');
  equals(stateA.get('exitSubstateContext'), context, 'state a should have context upon exiting');
  equals(stateB.get('enterSubstateContext'), context, 'state b should have context upon entering');
  equals(stateF.get('enterSubstateContext'), context, 'state f should have context upon entering');
});

test("pass context when going to state f using statechart - gotoSubstate('f', false, context) ", function() {
  statechart.gotoSubstate('f', false, context);
  equals(stateF.get('isCurrentState'), true);
  equals(stateC.get('exitSubstateContext'), context, 'state c should have context upon exiting');
  equals(stateA.get('exitSubstateContext'), context, 'state a should have context upon exiting');
  equals(stateB.get('enterSubstateContext'), context, 'state b should have context upon entering');
  equals(stateF.get('enterSubstateContext'), context, 'state f should have context upon entering');
});

test("pass context when going to state f using statechart - gotoSubstate('f', stateC, false, context) ", function() {
  statechart.gotoSubstate('f', stateC, false, context);
  equals(stateF.get('isCurrentState'), true);
  equals(stateC.get('exitSubstateContext'), context, 'state c should have context upon exiting');
  equals(stateA.get('exitSubstateContext'), context, 'state a should have context upon exiting');
  equals(stateB.get('enterSubstateContext'), context, 'state b should have context upon entering');
  equals(stateF.get('enterSubstateContext'), context, 'state f should have context upon entering');
});
