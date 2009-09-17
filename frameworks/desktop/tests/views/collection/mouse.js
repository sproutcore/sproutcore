// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            portions copyright @2009 Apple Inc.
// License:   Licened under MIT license (see license.js)
// ==========================================================================

var view, content, pane ;

module("SC.CollectionView Mouse Events", {
  setup: function() {
    
    SC.RunLoop.begin();
    
    content = "1 2 3 4 5 6 7 8 9 10".w().map(function(x) {
      return SC.Object.create({ value: x });
    });
    
    view = SC.CollectionView.create({
      content: content, 

      layout: { top: 0, left: 0, width: 300, height: 500 },
      
      layoutForContentIndex: function(idx) {
        return { left: 0, right: 0, top: idx * 50, height: 50 };
      },
      
      isVisibleInWindow: YES,
      acceptsFirstResponder: YES
    });
    
    pane = SC.MainPane.create();
    pane.appendChild(view);
    pane.append();

    SC.RunLoop.end();
  },
  
  teardown: function() {
    SC.RunLoop.begin();
    pane.remove();
    SC.RunLoop.end();
  }
});

/* 
  Simulates clicking on the specified index.  If you pass verify as YES or NO
  also verifies that the item view is subsequently selected or not.
  
  @param {SC.CollectionView} view the view
  @param {Number} index the index to click on
  @param {Boolean} shiftKey simulate shift key pressed 
  @param {Boolean} ctrlKey simulate ctrlKey pressed
  @param {IndexSet} expected expected selection
  @returns {void}
*/
function clickOn(view, index, shiftKey, ctrlKey, expected, delay) {
  var itemView = view.getPath('childViews.%@'.fmt(index)),
      layer    = itemView.get('layer'), 
      opts     = { shiftKey: shiftKey, ctrlKey: ctrlKey }, 
      sel, ev, modifiers;
      
  ok(layer, 'precond - itemView[%@] should have layer'.fmt(index));
  
  ev = SC.Event.simulateEvent(layer, 'mousedown', opts);
  SC.Event.trigger(layer, 'mousedown', [ev]);

  ev = SC.Event.simulateEvent(layer, 'mouseup', opts);
  SC.Event.trigger(layer, 'mouseup', [ev]);
  
  if (expected !== undefined) {
    var f = function() {
      SC.RunLoop.begin();
      sel = view.get('selection');
      
      modifiers = [];
      if (shiftKey) modifiers.push('shift');
      if (ctrlKey) modifiers.push('ctrl');
      modifiers = modifiers.length > 0 ? modifiers.join('+') : 'no modifiers';
      
      expected = SC.SelectionSet.create().add(view.get('content'), expected);
      
      ok(expected.isEqual(sel), 'should have selection: %@ after click with %@ on item[%@], actual: %@'.fmt(expected, modifiers, index, sel));
      SC.RunLoop.end();
      if (delay) window.start() ; // starts the test runner
    };
    
    if (delay) {
      stop() ; // stops the test runner
      setTimeout(f, delay) ;
    } else f() ;
  }
  
  layer = itemView = null ;
}

// ..........................................................
// basic click
// 

test("clicking on an item should select it", function() {
  clickOn(view, 3, NO, NO, SC.IndexSet.create(3));
});

test("clicking on a selected item should clear selection after 301ms and reselect it", function() {
  view.select(SC.IndexSet.create(1,5));
  SC.RootResponder.responder._lastMouseUpAt = null ; // HACK: don't want a doubleClick from previous tests
  clickOn(view, 3, NO, NO, SC.IndexSet.create(3), 301);
});

test("clicking on unselected item should clear selection and select it", function() {

  view.select(SC.IndexSet.create(1,5));
  clickOn(view, 7, NO, NO, SC.IndexSet.create(7));
});

test("first responder", function() {
  clickOn(view, 3);
  equals(view.get('isFirstResponder'), YES, 'view.isFirstResponder should be YES after mouse down');
});

// ..........................................................
// ctrl-click mouse down
// 

test("ctrl-clicking on unselected item should add to selection", function() {
  clickOn(view,3, NO, YES, SC.IndexSet.create(3));
  clickOn(view,5, NO, YES, SC.IndexSet.create(3).add(5));
});

test("ctrl-clicking on selected item should remove from selection", function() {
  clickOn(view,3, NO, YES, SC.IndexSet.create(3));
  clickOn(view,5, NO, YES, SC.IndexSet.create(3).add(5));
  clickOn(view,3, NO, YES, SC.IndexSet.create(5));
  clickOn(view,5, NO, YES, SC.IndexSet.create());
});

// ..........................................................
// shift-click mouse down
// 

test("shift-clicking on an item below should extend the selection", function() {
  clickOn(view, 3, NO, NO, SC.IndexSet.create(3));
  clickOn(view, 5, YES, NO, SC.IndexSet.create(3,3));
});


test("shift-clicking on an item above should extend the selection", function() {
  clickOn(view, 3, NO, NO, SC.IndexSet.create(3));
  clickOn(view, 1, YES, NO, SC.IndexSet.create(1,3));
});

test("shift-clicking inside selection first time should reduce selection from top", function() {
  view.select(SC.IndexSet.create(3,4));
  clickOn(view,4, YES, NO, SC.IndexSet.create(3,2));
});

test("shift-click below to extend selection down then shift-click inside selection should reduce selection", function() {
  clickOn(view, 3, NO, NO, SC.IndexSet.create(3));
  clickOn(view, 5, YES, NO, SC.IndexSet.create(3,3));
  clickOn(view,4, YES, NO, SC.IndexSet.create(3,2));
});

test("shift-click above to extend selection down then shift-click inside selection should reduce top of selection", function() {
  clickOn(view, 3, NO, NO, SC.IndexSet.create(3));
  clickOn(view, 1, YES, NO, SC.IndexSet.create(1,3));
  clickOn(view,2, YES, NO, SC.IndexSet.create(2,2));
});

test("shift-click below bottom of selection then shift click on top of selection should select only top item", function() {
  clickOn(view, 3, NO, NO, SC.IndexSet.create(3));
  clickOn(view, 5, YES, NO, SC.IndexSet.create(3,3));
  clickOn(view,3, YES, NO, SC.IndexSet.create(3));
});
