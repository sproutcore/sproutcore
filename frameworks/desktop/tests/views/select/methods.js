// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            portions copyright @2011 Apple Inc.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/*global module test htmlbody ok equals same stop start */

var pane, view , view1, view2, view3, view4 ;

module("SC.SelectView",{

  //setup
  setup: function() {
    SC.RunLoop.begin();
    var isDue = NO ;

    //pane
    pane = SC.MainPane.create({
      objs : ["Around","The","World"],
      objs2 : [{ title: "Around", pos: 3},
        { title: "The", pos: 1},
        { title: "World", pos: 2 },
        { title: "Again", pos: 4}],
      selectedValue: "World",
      isDue: YES,
      childViews: [

        //view1
        SC.SelectView.extend({
          items: ["To","Back", "You"],
          disableSort: NO
        }),

        //view2
        SC.SelectView.extend({
          items: ["Drop","Down", "Menu"]
        }),

        //view3
        SC.SelectView.extend({
          itemsBinding: '*owner.objs',
          valueBinding: '*owner.selectedValue',
          isVisibleBinding: '*owner.isDue'
        }),

        //view4
        SC.SelectView.extend({
          itemsBinding: '*owner.objs2',
          valueBinding: '*owner.selectedValue',
          itemValueKey: 'title',
          itemTitleKey: 'title',
          itemSortKey: 'pos'
        }),
        
        //view5
        SC.SelectView.extend({
          items: ["My","New", "List"]
        }),
        
        //view6
        SC.SelectView.extend({
          items: ["My","New", "List"],
          customViewClassName: 'custom-menu-item',
          customViewMenuOffsetWidth: 46
        })
      ]
    });

    view1 = pane.childViews[0] ;
    view2 = pane.childViews[1] ;
    view3 = pane.childViews[2] ;
    view4 = pane.childViews[3] ;
    view5 = pane.childViews[4] ;
    view6 = pane.childViews[5] ;
    
    pane.append(); // make sure there is a layer...
    SC.RunLoop.end();
  },

  //teardown
  teardown: function() {
    pane.remove() ;
    pane = view = null ;
  }
});

//test2
test("Check if valueBinding works", function() {
  equals('World',view4.get('value'),'Value should be') ;
});

// the test that was here pretty much tested nothing.

//test5
test("sortObjects() sorts the items of the Drop Down component", function() {
  var obj = view1.get("items");
  obj = view1.sortObjects(obj);

  equals("Back",obj.get(0),'First item should be') ;
  equals("To",obj.get(1),'Second item should be') ;
  equals("You",obj.get(2),'Third item should be') ;
});

// There was an awful test here. I can't even tell what it was supposed to do.

//test7
test("isEnabled=NO should add disabled class", function() {
  SC.RunLoop.begin() ;
  view1.set('isEnabled', NO) ;
  SC.RunLoop.end() ;
  ok(view1.$().hasClass('disabled'), 'should have disabled class') ;
});

// there is NO need to test binding.

// I think this one is probably somewhat pointless as well, but perhaps some
// buggy observers being called could break it or something...
test("Check if setting a value actually changes the selection value", function() {
  SC.RunLoop.begin() ;
  view2.set('value','Menu') ;
  SC.RunLoop.end() ;

  equals(view2.get('value'), 'Menu', 'value of Drop down should change to') ;
}) ;

// No need to test binding (was test10)

//test11
test("The properties for select button should take default values unless specified", function() {
  var prop1 = view5.get('customViewClassName');
  var prop2 = view5.get('customViewMenuOffsetWidth');
  equals(prop1,null,'Custom view class name should be null');
  equals(prop2,0,'Custom view menu off set width should be 0');
});

//test12
test("The properties for select button should take the specified values", function() {
  var prop1 = view6.get('customViewClassName');
  var prop2 = view6.get('customViewMenuOffsetWidth');
  equals(prop1,'custom-menu-item','Custom view class name should be custom-menu-item');
  equals(prop2,46,'Custom view menu off set width should be 46');
});
