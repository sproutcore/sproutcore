// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            portions copyright @2011 Apple Inc.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/* !!  these enable verbose logging, turn them on if you want to understand what's going on
   in this test case !! */
//SC.LOG_BINDINGS = YES ;
//SC.LOG_DEFERRED_CALLS = YES;

var view, content, pane ;

var renderFunc = CoreTest.stub("render", function() {
  SC.ListItemView.prototype.render.apply(this, arguments) ;
});

module("SC.ListView.render", {
  
  setup: function() {
          
    SC.RunLoop.begin();

    content = "1 2 3 4 5 6 7 8 9 10".w().map(function(x) {
      return SC.Object.create({ value: x });
    });
    
    view = SC.ListView.create({
      content: content, 
      
      layout: { top: 0, left: 0, width: 300, height: 500 },
      
      layoutForContentIndex: function(idx) {
        return { left: 0, right: 0, top: idx * 50, height: 50 };
      },
      
      _cv_nowShowingDidChange: CoreTest.stub("_cv_nowShowingDidChange", function() {
        SC.ListView.prototype._cv_nowShowingDidChange.apply(this, arguments) ;
      }),
      
      exampleView: SC.ListItemView.extend({
        render: renderFunc,
        contentValueKey: "value"
      }),
      
      // reset stubs
      reset: function() {
        this._cv_nowShowingDidChange.reset();
        renderFunc.reset();
      }
      
    });

    
    pane = SC.MainPane.create();

    pane.appendChild(view);
    pane.append();

    SC.RunLoop.end();

  },
  
  teardown: function() {
    SC.RunLoop.begin();
    
    view.reset();
    
    pane.remove();
    pane.destroy();
    
    SC.RunLoop.end();
  }
  
});

// ..........................................................
// BASIC TESTS
// 

test("in a static content array list item render() should only be called twice * item view", function() {
  // one call happens in the list view computeLayout() and one in mainpane layoutChildViewsIfNeeded
  // turn on debugging by uncommenting the lines at the top of this test to see it in action
  renderFunc.expect(20);
});


test("with a static content array _cv_nowShowingDidChange() should only be called 4 times", function() {
   view._cv_nowShowingDidChange.expect(4);
});
