// ==========================================================================
// SC Unit Test
// ==========================================================================
/*globals SC */

var sc, root, stateFoo, stateBar, stateA, stateB, stateX, stateY, stateA1, stateA2, stateB1, stateB2, stateX1, stateX2, stateY1, stateY2;

module("SC.State: findFirstRelativeCurrentState method Tests (without concurrent states)", {
  
  setup: function() {
    
    sc = SC.Statechart.create({
      
      initialState: 'foo',
    
      foo: SC.State.design({
        
        substatesAreConcurrent: YES,
        
        a: SC.State.design({
          initialSubstate: 'a1',
          a1: SC.State.design(),
          a2: SC.State.design()
        }),
        
        b: SC.State.design({
          initialSubstate: 'b1',
          b1: SC.State.design(),
          b2: SC.State.design()
        })
        
      }),
      
      bar: SC.State.design({
        
        substatesAreConcurrent: YES,
        
        x: SC.State.design({
          initialSubstate: 'x1',
          x1: SC.State.design(),
          x2: SC.State.design()
        }),
        
        y: SC.State.design({
          initialSubstate: 'y1',
          y1: SC.State.design(),
          y2: SC.State.design()
        })
        
      })
      
    });
    
    sc.initStatechart();
    
    root = sc.get('rootState');
    stateFoo = sc.getState('foo');
    stateBar = sc.getState('bar');
    stateA = sc.getState('a');
    stateB = sc.getState('b');
    stateX = sc.getState('x');
    stateY = sc.getState('y');
    stateA1 = sc.getState('a1');
    stateA2 = sc.getState('a2');
    stateB1 = sc.getState('b1');
    stateB2 = sc.getState('b2');
    stateX1 = sc.getState('x1');
    stateX2 = sc.getState('x2');
    stateY1 = sc.getState('y1');
    stateY2 = sc.getState('y2');
  },
  
  teardown: function() {
    sc = root = stateFoo = stateBar = null;
    stateA = stateB = stateX = stateY = null;
    stateA1 = stateA2 = stateB1 = stateB2 = null;
    stateX1 = stateX2 = stateY1 = stateY2 = null;
  }
  
});

test("check using state A1 with state foo entered", function() {
  equals(stateA1.findFirstRelativeCurrentState(), stateA1, "state should return state A1");
});

test("check using state A2 with state foo entered", function() {
  equals(stateA2.findFirstRelativeCurrentState(), stateA1, "state should return state A1");
});

test("check using state A with state foo entered", function() {
  equals(stateA.findFirstRelativeCurrentState(), stateA1, "state should return state A1");
});

test("check using state Foo with state foo entered", function() {
  equals(stateFoo.findFirstRelativeCurrentState(), null, "state should return null without anchor");
  equals(stateFoo.findFirstRelativeCurrentState(stateA), stateA1, "state should return A1 with anchor state A");
  equals(stateFoo.findFirstRelativeCurrentState('a'), stateA1, "state should return A1 with anchor state 'a'");
  equals(stateFoo.findFirstRelativeCurrentState(stateA1), stateA1, "state should return A1 with anchor state A1");
  equals(stateFoo.findFirstRelativeCurrentState('a1'), stateA1, "state should return A1 with anchor state 'a1'");
  equals(stateFoo.findFirstRelativeCurrentState('a.a1'), stateA1, "state should return A1 with anchor state 'a.a1'");
  equals(stateFoo.findFirstRelativeCurrentState(stateA2), stateA1, "state should return A1 with anchor state A2");
  equals(stateFoo.findFirstRelativeCurrentState('a2'), stateA1, "state should return A1 with anchor state 'a2'");
  equals(stateFoo.findFirstRelativeCurrentState('a.a2'), stateA1, "state should return A1 with anchor state 'a.a2'");
  
  equals(stateFoo.findFirstRelativeCurrentState(stateB), stateB1, "state should return B1 with anchor state B");
  equals(stateFoo.findFirstRelativeCurrentState('b'), stateB1, "state should return B1 with anchor state 'b'");
  equals(stateFoo.findFirstRelativeCurrentState(stateB1), stateB1, "state should return B1 with anchor state B1");
  equals(stateFoo.findFirstRelativeCurrentState('b1'), stateB1, "state should return B1 with anchor state 'b1'");
  equals(stateFoo.findFirstRelativeCurrentState('b.b1'), stateB1, "state should return B1 with anchor state 'b.b1'");
  equals(stateFoo.findFirstRelativeCurrentState(stateB2), stateB1, "state should return B1 with anchor state B2");
  equals(stateFoo.findFirstRelativeCurrentState('b2'), stateB1, "state should return B1 with anchor state 'b2'");
  equals(stateFoo.findFirstRelativeCurrentState('b.b2'), stateB1, "state should return B1 with anchor state 'b.b2'");
});

test("check using root state with state foo entered", function() {
  equals(root.findFirstRelativeCurrentState(), null, "state should return null without anchor");
  
  equals(root.findFirstRelativeCurrentState(stateFoo), null, "state should return null with anchor state Foo");
  equals(root.findFirstRelativeCurrentState(stateBar), null, "state should return null with anchor state Bar");
  
  equals(root.findFirstRelativeCurrentState(stateA), stateA1, "state should return state A1 with anchor state A");
  equals(root.findFirstRelativeCurrentState('a'), stateA1, "state should return state A1 with anchor state 'a'");
  equals(root.findFirstRelativeCurrentState('foo.a'), stateA1, "state should return state A1 with anchor state 'foo.a'");
  
  equals(root.findFirstRelativeCurrentState(stateB), stateB1, "state should return state B1 with anchor state B");
  equals(root.findFirstRelativeCurrentState('b'), stateB1, "state should return state B1 with anchor state 'b'");
  equals(root.findFirstRelativeCurrentState('foo.b'), stateB1, "state should return state B1 with anchor state 'foo.b'");
  
  equals(root.findFirstRelativeCurrentState(stateX), null, "state should return state null with anchor state X");
  equals(root.findFirstRelativeCurrentState(stateY), null, "state should return state null with anchor state Y");
});

test("check using root state with state bar entered", function() {
  sc.gotoState('bar');
  
  equals(root.findFirstRelativeCurrentState(), null, "state should return null without anchor");
  
  equals(root.findFirstRelativeCurrentState(stateFoo), null, "state should return null with anchor state Foo");
  equals(root.findFirstRelativeCurrentState(stateBar), null, "state should return null with anchor state Bar");
  
  equals(root.findFirstRelativeCurrentState(stateX), stateX1, "state should return state X1 with anchor state X");
  equals(root.findFirstRelativeCurrentState('x'), stateX1, "state should return state X1 with anchor state 'x'");
  equals(root.findFirstRelativeCurrentState('bar.x'), stateX1, "state should return state X1 with anchor state 'bar.x'");
  
  equals(root.findFirstRelativeCurrentState(stateY), stateY1, "state should return state Y1 with anchor state Y");
  equals(root.findFirstRelativeCurrentState('y'), stateY1, "state should return state Y1 with anchor state 'y'");
  equals(root.findFirstRelativeCurrentState('bar.y'), stateY1, "state should return state Y1 with anchor state 'bar.y'");
  
  equals(root.findFirstRelativeCurrentState(stateA), null, "state should return null with anchor state A");
  equals(root.findFirstRelativeCurrentState(stateB), null, "state should return null with anchor state B");
});