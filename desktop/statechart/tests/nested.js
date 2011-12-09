// ==========================================================================
// SC.Statechart Unit Test
// ==========================================================================
/**
  @author Mike Ball
*/
var nested, exitTotal, enterTotal;

// ..........................................................
// CONTENT CHANGING
// 

module("SC.Statechart Mixin Nested Statechart", {
  setup: function() {
    enterTotal = exitTotal = 0;
    nested = SC.Object.create(SC.Statechart,{
      startStates: {'default': 'a', 'other': 'f'},
      startOnInit: YES,
      
      a: SC.Statechart.registerState({initialSubState: 'b', enterState: function(){ enterTotal+=1; }, exitState: function(){ exitTotal+=1; }}),
      b: SC.Statechart.registerState({parentState: 'a', initialSubState: 'c', enterState: function(){ enterTotal+=1; }, exitState: function(){ exitTotal+=1; }}),
      c: SC.Statechart.registerState({parentState: 'b', enterState: function(){ enterTotal+=1; }, exitState: function(){ exitTotal+=1; }}),
      d: SC.Statechart.registerState({parentState: 'b', enterState: function(){ enterTotal+=1; }, exitState: function(){ exitTotal+=1; }}),
      e: SC.Statechart.registerState({enterState: function(){ enterTotal+=1; }, exitState: function(){ exitTotal+=1; }}),
      f: SC.Statechart.registerState({parallelStatechart:'other'}),
      g: SC.Statechart.registerState({parallelStatechart:'other'})
      
    
    });
  },
  
  teardown: function() {
    nested.destroy();
    exitTotal = enterTotal = 0;
  }
});

test("nested state initialization", function() {
  equals(nested.get('c'), nested.get('c').state(), "c state should be the current state for default statechart");
  equals(nested.get('f'), nested.get('f').state(), "f state should be the current state for other statechart");
});

test("nested state transition", function() {
  var c = nested.get('c');
  equals(c, c.state(), "c state should be the current state for default statechart");
  equals(enterTotal, 3, "should have entered 3 states");
  equals(exitTotal, 0, "should have exited 0 states");
  
  enterTotal = exitTotal = 0;

  c.goState('e');
  equals(nested.get('e'), nested.get('e').state(), "e state should be the current state for other statechart");
  equals(enterTotal, 1, "should have entered 1 state after transition");
  equals(exitTotal, 3, "should have exited 3 states after transition");
  
  
});


