// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            portions copyright @2009 Apple Inc.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

// SC.LOG_BINDINGS = YES ;

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
      
      didReload: CoreTest.stub("didReload"),
      
      _cv_isVisibleInWindowDidChange: CoreTest.stub("_cv_isVisibleInWindowDidChange", function() {
        SC.ListView.prototype._cv_isVisibleInWindowDidChange.apply(this, arguments) ;
      }),
      
      _cv_nowShowingDidChange: CoreTest.stub("_cv_nowShowingDidChange", function() {
        SC.ListView.prototype._cv_nowShowingDidChange.apply(this, arguments) ;
      }),
      
      exampleView: SC.ListItemView.extend({
        render: renderFunc
      }),
      
      // reset stubs
      reset: function() {
        this.didReload.reset();
        this._cv_isVisibleInWindowDidChange.reset();
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
    pane.remove();
    SC.RunLoop.end();
    view.reset();
  }
  
});

// ..........................................................
// BASIC TESTS
// 

test("didReload() should only be called once with a static content array", function() {
  view.didReload.expect(1);
});

test("_cv_isVisibleInWindowDidChange() should only be called once with a static content array", function() {
  view._cv_isVisibleInWindowDidChange.expect(1);
});

test("list item render() should only be called once per item view a static content array", function() {
  renderFunc.expect(10);
});

// test("_cv_nowShowingDidChange() should only be called once with a static content array", function() {
//   view._cv_nowShowingDidChange.expect(1); // currently is 3...
// });
