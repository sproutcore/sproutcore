// ==========================================================================
// SC.Statechart Unit Test
// ==========================================================================
/*globals SC */

/**
  @author Michael Cohen
*/
var basic;
var advanced;
var sequence;

// ..........................................................
// CONTENT CHANGING
// 

module("SC.Statechart Mixin: Transient States", {
  setup: function() { 
    sequence = [];
    
    basic = SC.Object.create(SC.Statechart, {
      startStates: {'default': 'a'},
      startOnInit: NO,
      
      a: SC.Statechart.registerState({
        enterState: function() { sequence.push('enter:a'); },
        exitState: function() { sequence.push('exit:a'); },
        foo: function() { this.goState('b'); } 
      }),
      
      b: SC.Statechart.registerState({
        enterState: function() { sequence.push('enter:b'); this.goState('c'); },
        exitState: function() { sequence.push('exit:b'); }
      }),
      
      c: SC.Statechart.registerState({
        enterState: function() { sequence.push('enter:c'); this.goState('d'); },
        exitState: function() { sequence.push('exit:c'); }
      }),
      
      d: SC.Statechart.registerState({
        enterState: function() { sequence.push('enter:d'); },
        exitState: function() { sequence.push('exit:d'); }
      })
    });
    
    advanced = SC.Object.create(SC.Statechart, {
      startStates: {'default': 'a'},
      startOnInit: NO,
      
      a: SC.Statechart.registerState({
        initialSubState: 'b',
        enterState: function() { sequence.push('enter:a'); },
        exitState: function() { sequence.push('exit:a'); }
      }),
      
      b: SC.Statechart.registerState({
        parentState: 'a',
        initialSubState: 'c',
        enterState: function() { sequence.push('enter:b'); },
        exitState: function() { sequence.push('exit:b'); }
      }),
      
      c: SC.Statechart.registerState({
        parentState: 'b',
        enterState: function() { sequence.push('enter:c'); },
        exitState: function() { sequence.push('exit:c'); },
        foo: function() { this.goState('d'); }
      }),
      
      d: SC.Statechart.registerState({
        parentState: 'b',
        enterState: function() { sequence.push('enter:d'); this.goState('e'); },
        exitState: function() { sequence.push('exit:d'); }
      }),
      
      e: SC.Statechart.registerState({
        initialSubState: 'f',
        enterState: function() { sequence.push('enter:e'); },
        exitState: function() { sequence.push('exit:e'); }
      }),
      
      f: SC.Statechart.registerState({
        parentState: 'e',
        enterState: function() { sequence.push('enter:f'); this.goState('g'); },
        exitState: function() { sequence.push('exit:f'); }
      }),
      
      g: SC.Statechart.registerState({
        parentState: 'e',
        enterState: function() { sequence.push('enter:g'); },
        exitState: function() { sequence.push('exit:g'); }
      })
      
    });
  },
  
  teardown: function() {
    basic.destroy();
    advanced.destroy();
    sequence = null;
  }
});

test("basic state transition", function() {
  sequence = [];
  basic.startupStatechart();
  equals(basic.currentState(), basic.a, "current state should be a");
  equals(sequence.length, 1, "should be length 1");
  equals(sequence[0], 'enter:a', "should be 'enter:a'");
  
  sequence = [];
  basic.sendEvent('foo');
  equals(basic.currentState(), basic.d, "current state should be d");
  equals(sequence.length, 6, "should be length 6");
  equals(sequence[0], 'exit:a', "should be 'exit:a'");
  equals(sequence[1], 'enter:b', "should be 'enter:b'");
  equals(sequence[2], 'exit:b', "should be 'exit:b'");
  equals(sequence[3], 'enter:c', "should be 'enter:c'");
  equals(sequence[4], 'exit:c', "should be 'exit:c'");
  equals(sequence[5], 'enter:d', "should be 'enter:d'");
  console.log(sequence);
});

test("advanced state transition", function() {
  sequence = [];
  advanced.startupStatechart();
  equals(advanced.currentState(), advanced.c, "current state should be c");
  equals(sequence.length, 3, "should be length 3");
  equals(sequence[0], 'enter:a', "should be 'enter:a'");
  equals(sequence[1], 'enter:b', "should be 'enter:b'");
  equals(sequence[2], 'enter:c', "should be 'enter:c'");
  
  sequence = [];
  advanced.sendEvent('foo');
  equals(advanced.currentState(), advanced.g, "current state should be c");
  equals(sequence.length, 9, "should be length 9");
  equals(sequence[0], 'exit:c', "should be 'exit:c'");
  equals(sequence[1], 'enter:d', "should be 'enter:d'");
  equals(sequence[2], 'exit:d', "should be 'exit:d'");
  equals(sequence[3], 'exit:b', "should be 'exit:b'");
  equals(sequence[4], 'exit:a', "should be 'exit:a'");
  equals(sequence[5], 'enter:e', "should be 'enter:c'");
  equals(sequence[6], 'enter:f', "should be 'enter:f'");
  equals(sequence[7], 'exit:f', "should be 'exit:f'");
  equals(sequence[8], 'enter:g', "should be 'enter:g'");
  console.log(sequence);
});