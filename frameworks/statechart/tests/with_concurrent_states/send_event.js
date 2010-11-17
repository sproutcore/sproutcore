// ==========================================================================
// Ki.Statechart Unit Test
// ==========================================================================
/*globals Ki */

var statechart = null;

// ..........................................................
// CONTENT CHANGING
// 

module("Ki.Statechart: With Concurrent States - Send Event Tests", {
  setup: function() {

    statechart = Ki.Statechart.create({
      
      monitorIsActive: YES,
      
      rootState: Ki.State.design({
        
        initialSubstate: 'x',
        
        x: Ki.State.design({
          
          substatesAreConcurrent: YES,
          
          a: Ki.State.design({

            initialSubstate: 'c',

            eventAInvoked: NO,

            eventA: function() { this.set('eventAInvoked', YES); },

            c: Ki.State.design({
              eventB: function() { this.gotoState('d'); },
              eventD: function() { this.gotoState('y'); }
            }),

            d: Ki.State.design({
              eventC: function() { this.gotoState('c'); }
            })

          }),

          b: Ki.State.design({

            initialSubstate: 'e',

            eventAInvoked: NO,

            eventA: function() { this.set('eventAInvoked', YES); },

            e: Ki.State.design({
              eventB: function() { this.gotoState('f'); },
              eventD: function() { this.gotoState('y'); }
            }),

            f: Ki.State.design({
              eventC: function() { this.gotoState('e'); }
            })

          })
          
        }),
        
        y: Ki.State.design()
        
      })
      
    });
    
    statechart.initStatechart();
  },
  
  teardown: function() {
    statechart.destroy();
    statechart = null;
  }
});

test("send event eventA", function() {
  var monitor = statechart.get('monitor'),
      stateA = statechart.getState('a'),
      stateB = statechart.getState('b');
      
  monitor.reset();

  equals(stateA.get('eventAInvoked'), false);
  equals(stateB.get('eventAInvoked'), false);

  statechart.sendEvent('eventA');
  
  equals(monitor.get('length'), 0, 'state sequence should be of length 0');
  equals(statechart.stateIsCurrentState('c'), true, 'current state should be c');
  equals(statechart.stateIsCurrentState('e'), true, 'current state should be e');
  equals(stateA.get('eventAInvoked'), true);
  equals(stateB.get('eventAInvoked'), true);
});

test("send event eventB", function() {
  var monitor = statechart.get('monitor');
      
  monitor.reset();
  
  equals(statechart.stateIsCurrentState('c'), true, 'current state should be c');
  equals(statechart.stateIsCurrentState('e'), true, 'current state should be e');
  
  statechart.sendEvent('eventB');
  
  equals(statechart.get('currentStateCount'), 2, 'current state count should be 2');
  equals(statechart.stateIsCurrentState('d'), true, 'current state should be d');
  equals(statechart.stateIsCurrentState('f'), true, 'current state should be f');
  
  equals(monitor.get('length'), 4, 'state sequence should be of length 4');
  equals(monitor.matchSequence()
                .begin()
                .exited('c').entered('d')
                .exited('e').entered('f')
                .end(), 
          true, 'sequence should be exited[c], entered[d], exited[e], entered[f]');
});

test("send event eventB then eventC", function() {
  var monitor = statechart.get('monitor');

  statechart.sendEvent('eventB');
  
  equals(statechart.stateIsCurrentState('d'), true, 'current state should be d');
  equals(statechart.stateIsCurrentState('f'), true, 'current state should be f');

  monitor.reset();
  
  statechart.sendEvent('eventC');

  equals(statechart.stateIsCurrentState('c'), true, 'current state should be c');
  equals(statechart.stateIsCurrentState('e'), true, 'current state should be e');

  equals(monitor.get('length'), 4, 'state sequence should be of length 4');
  equals(monitor.matchSequence()
                .begin()
                .exited('d').entered('c')
                .exited('f').entered('e')
                .end(), 
          true, 'sequence should be exited[d], entered[c], exited[f], entered[e]');
});

test("send event eventD", function() {
  var monitor = statechart.get('monitor');
      
  monitor.reset();
  
  equals(statechart.stateIsCurrentState('c'), true, 'current state should be c');
  equals(statechart.stateIsCurrentState('e'), true, 'current state should be e');
  
  statechart.sendEvent('eventD');
  
  equals(monitor.get('length'), 6, 'state sequence should be of length 6');
  equals(monitor.matchSequence()
                .begin()
                .exited('c', 'a', 'e', 'b', 'x').entered('y')
                .end(), 
          true, 'sequence should be exited[c, a, e, b, x], entered[y]');
          
  equals(statechart.currentStateCount(), 1, 'statechart should only have 1 current state');
  equals(statechart.stateIsCurrentState('c'), false, 'current state not should be c');
  equals(statechart.stateIsCurrentState('e'), false, 'current state not should be e');
  equals(statechart.stateIsCurrentState('y'), true, 'current state should be y');
});

test("send event eventZ", function() {
  var monitor = statechart.get('monitor');
      
  monitor.reset();
  
  equals(statechart.stateIsCurrentState('c'), true, 'current state should be c');
  equals(statechart.stateIsCurrentState('e'), true, 'current state should be e');
  
  equals(monitor.get('length'), 0, 'state sequence should be of length 0');
  
  equals(statechart.stateIsCurrentState('c'), true, 'current state should be c');
  equals(statechart.stateIsCurrentState('e'), true, 'current state should be e');
});
