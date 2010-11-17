// ==========================================================================
// Ki.Statechart Unit Test
// ==========================================================================
/*globals Ki */

var statechart = null;

// ..........................................................
// CONTENT CHANGING
// 

module("Ki.Statechart: No Concurrent States - Goto State Tests", {
  setup: function() {

    statechart = Ki.Statechart.create({
      
      monitorIsActive: YES,
      
      rootState: Ki.State.design({
        
        initialSubstate: 'a',
        
        a: Ki.State.design({
        
          initialSubstate: 'c',
          
          c: Ki.State.design({
            initialSubstate: 'g',
            g: Ki.State.design(),
            h: Ki.State.design()
          }),
          
          d: Ki.State.design({
            initialSubstate: 'i',
            i: Ki.State.design(),
            j: Ki.State.design()
          })
          
        }),
        
        b: Ki.State.design({
          
          initialSubstate: 'e',
          
          e: Ki.State.design({
            initialSubstate: 'k',
            k: Ki.State.design(),
            l: Ki.State.design()
          }),
          
          f: Ki.State.design({
            initialSubstate: 'm',
            m: Ki.State.design(),
            n: Ki.State.design()
          })
          
        })
        
      })
      
    });
    
    statechart.initStatechart();
  },
  
  teardown: function() {
    statechart.destroy();
  }
});

test("check statechart state objects", function() {
  var stateG = statechart.getState('g');
  equals(SC.none(stateG), false, 'statechart should return a state object for state with name "g"');
  equals(stateG.get('name'), 'g', 'state g should have name "g"');
  equals(stateG.get('isCurrentState'), true, 'state G should be current state');
  equals(stateG.stateIsCurrentSubstate('g'), true, 'state g should have current substate g');
  equals(statechart.stateIsCurrentState('g'), true, 'statechart should have current state g');
  equals(statechart.stateIsCurrentState(stateG), true, 'statechart should have current state g');
  
  var stateM = statechart.getState('m');
  equals(SC.none(stateM), false, 'statechart should return a state object for state with name "m"');
  equals(stateM.get('name'), 'm', 'state m should have name "m"');
  equals(stateM.get('isCurrentState'), false, 'state m should not be current state');
  equals(stateG.stateIsCurrentSubstate('m'), false, 'state m should not have current substate m');
  equals(statechart.stateIsCurrentState('m'), false, 'statechart should not have current state m');
  equals(statechart.stateIsCurrentState(stateM), false, 'statechart should not have current state m');
  
  var stateA = statechart.getState('a');
  equals(SC.none(stateA), false, 'statechart should return a state object for state with name "a"');
  equals(stateA.get('isCurrentState'), false, 'state m should not be current state');
  equals(stateA.stateIsCurrentSubstate('a'), false, 'state a should not have current substate g');
  equals(stateA.stateIsCurrentSubstate('c'), false, 'state a should not have current substate c');
  equals(stateA.stateIsCurrentSubstate('g'), true, 'state a should have current substate g');
  equals(stateA.stateIsCurrentSubstate(stateG), true, 'state a should have current substate g');
  equals(stateA.stateIsCurrentSubstate(stateM), false, 'state a should not have current substate m');
  
  var stateX = statechart.getState('x');
  equals(SC.none(stateX), true, 'statechart should not have a state with name "x"');
});

test("check statechart initialization", function() {
  var monitor = statechart.get('monitor');
  var root = statechart.get('rootState');
  equals(monitor.get('length'), 4, 'initial state sequence should be of length 4');
  equals(monitor.matchSequence().begin().entered(root, 'a', 'c', 'g').end(), true, 'initial sequence should be entered[ROOT, a, c, g]');
  equals(monitor.matchSequence().begin().entered(root, 'a', 'c', 'h').end(), false, 'initial sequence should not be entered[ROOT, a, c, h]');
  equals(statechart.get('currentStateCount'), 1, 'current state count should be 1');
  equals(statechart.stateIsCurrentState('g'), true, 'current state should be g');
});

test("go to state h", function() {
  var monitor = statechart.get('monitor');
  monitor.reset();
  statechart.gotoState('h');
  
  equals(monitor.get('length'), 2, 'state sequence should be of length 2');
  equals(monitor.matchSequence().begin().exited('g').entered('h').end(), true, 'sequence should be exited[g], entered[h]');
  equals(monitor.matchSequence().begin().exited('h').entered('g').end(), false, 'sequence should not be exited[h], entered[g]');
  equals(statechart.get('currentStateCount'), 1, 'current state count should be 1');
  equals(statechart.stateIsCurrentState('h'), true, 'current state should be h');
});

test("go to states: h, d", function() {
  var monitor = statechart.get('monitor');
  statechart.gotoState('h');
  
  monitor.reset();
  statechart.gotoState('d');
  
  equals(monitor.get('length'), 4, 'state sequence should be of length 4');
  equals(monitor.matchSequence().begin().exited('h', 'c').entered('d', 'i').end(), true, 'sequence should be exited[h, c], entered[d, i]');
  equals(monitor.matchSequence().begin().exited('h', 'c').entered('d', 'f').end(), false, 'sequence should not be exited[h, c], entered[d, f]');
  equals(monitor.matchSequence().begin().exited('g', 'c').entered('d', 'i').end(), false, 'sequence should not be exited[g, c], entered[d, f]');
  equals(statechart.get('currentStateCount'), 1, 'current state count should be 1');
  equals(statechart.stateIsCurrentState('i'), true, 'current state should be i');
});

test("go to states: h, d, h", function() {
  var monitor = statechart.get('monitor');
  statechart.gotoState('h');
  statechart.gotoState('d');
  
  monitor.reset();
  statechart.gotoState('h');
  
  equals(monitor.get('length'), 4, 'state sequence should be of length 4');
  equals(monitor.matchSequence().begin().exited('i', 'd').entered('c', 'h').end(), true, 'sequence should be exited[i, d], entered[c, h]');
  equals(statechart.get('currentStateCount'), 1, 'current state count should be 1');
  equals(statechart.stateIsCurrentState('h'), true, 'current state should be h');
});

test("go to state b", function() {
  var monitor = statechart.get('monitor');
  monitor.reset();
  statechart.gotoState('b');
  
  equals(monitor.get('length'), 6, 'state sequence should be of length 6');
  equals(monitor.matchSequence().begin().exited('g', 'c', 'a').entered('b', 'e', 'k').end(), true, 'sequence should be exited[g, c, a], entered[b, e, k]');
  equals(monitor.matchSequence().begin().exited('g', 'a', 'c').entered('b', 'e', 'k').end(), false, 'sequence should not be exited[g, a, c], entered[b, e, k]');
  equals(monitor.matchSequence().begin().exited('g', 'c', 'a').entered('b', 'k', 'e').end(), false, 'sequence should not be exited[g, c, a], entered[b, k, e]');
  equals(statechart.get('currentStateCount'), 1, 'current state count should be 1');
  equals(statechart.stateIsCurrentState('k'), true, 'current state should be k');
});

test("go to state f", function() {
  var monitor = statechart.get('monitor');
  monitor.reset();
  statechart.gotoState('f');
  
  equals(monitor.get('length'), 6, 'state sequence should be of length 6');
  equals(monitor.matchSequence().begin().exited('g', 'c', 'a').entered('b', 'f', 'm').end(), true, 'sequence should be exited[g, c, a], entered[b, f, m]');
  equals(statechart.get('currentStateCount'), 1, 'current state count should be 1');
  equals(statechart.stateIsCurrentState('m'), true, 'current state should be m');
});

test("go to state m", function() {
  var monitor = statechart.get('monitor');
  monitor.reset();
  statechart.gotoState('n');
  
  equals(monitor.get('length'), 6, 'state sequence should be of length 6');
  equals(monitor.matchSequence().begin().exited('g', 'c', 'a').entered('b', 'f', 'n').end(), true, 'sequence should be exited[g, c, a], entered[b, f, n]');
  equals(statechart.get('currentStateCount'), 1, 'current state count should be 1');
  equals(statechart.stateIsCurrentState('n'), true, 'current state should be n');
});

test("re-enter state g", function() {
  var monitor = statechart.get('monitor');
  monitor.reset();
  statechart.gotoState('g');
  
  equals(monitor.get('length'), 2, 'state sequence should be of length 2');
  equals(monitor.matchSequence().begin().exited('g').entered('g').end(), true, 'sequence should be exited[g], entered[g]');
  equals(statechart.get('currentStateCount'), 1, 'current state count should be 1');
  equals(statechart.stateIsCurrentState('g'), true, 'current state should be g');
  
  monitor.reset();
  equals(monitor.get('length'), 0, 'state sequence should be of length 0 after monitor reset');
  
  var state = statechart.getState('g');
  state.reenter();
  
  equals(monitor.get('length'), 2, 'state sequence should be of length 2');
  equals(monitor.matchSequence().begin().exited('g').entered('g').end(), true, 'sequence should be exited[g], entered[g]');
  equals(statechart.get('currentStateCount'), 1, 'current state count should be 1');
  equals(statechart.stateIsCurrentState('g'), true, 'current state should be g');
}); 

test("go to g state's ancestor state a", function() {
  var monitor = statechart.get('monitor');
  monitor.reset();
  statechart.gotoState('a');
  
  equals(monitor.get('length'), 6, 'initial state sequence should be of length 6');
  equals(monitor.matchSequence().begin().exited('g', 'c', 'a').entered('a', 'c', 'g').end(), true, 'sequence should be exited[g, c, a], entered[a, c, g]');
  equals(statechart.get('currentStateCount'), 1, 'current state count should be 1');
  equals(statechart.stateIsCurrentState('g'), true, 'current state should be g');
});

test("go to state b and then go to root state", function() {
  var monitor = statechart.get('monitor');
  statechart.gotoState('b');
  equals(statechart.get('currentStateCount'), 1, 'current state count should be 1');
  equals(statechart.stateIsCurrentState('k'), true, 'current state should be k');
  
  monitor.reset();
  statechart.gotoState(statechart.get('rootState'));
  
  var root = statechart.get('rootState');
  equals(monitor.get('length'), 8, 'initial state sequence should be of length 6');
  equals(monitor.matchSequence().begin().exited('k', 'e', 'b', root).entered(root, 'a', 'c', 'g').end(), 
        true, 'sequence should be exited[k, e, b, ROOT], entered[ROOT, a, c, g]');
  equals(statechart.get('currentStateCount'), 1, 'current state count should be 1');
  equals(statechart.stateIsCurrentState('g'), true, 'current state should be g');
});

test("from state g, go to state m calling state g\'s gotoState", function() {
  var monitor = statechart.get('monitor');
  var stateG = statechart.getState('g'),
      stateM = statechart.getState('m');
  
  equals(stateG.get('isCurrentState'), true, 'state g should be current state');
  equals(stateM.get('isCurrentState'), false, 'state m should not be current state');
  
  monitor.reset();
  stateG.gotoState('m');
  
  equals(monitor.get('length'), 6, 'initial state sequence should be of length 6');
  equals(monitor.matchSequence().begin().exited('g', 'c', 'a').entered('b', 'f', 'm').end(), 
        true, 'sequence should be exited[g, c, a], entered[b, f, m]');
  equals(statechart.get('currentStateCount'), 1, 'current state count should be 1');
  equals(statechart.stateIsCurrentState('m'), true, 'current state should be m');
  
  equals(stateG.get('isCurrentState'), false, 'state g should not be current state');
  equals(stateM.get('isCurrentState'), true, 'state m should be current state');
});