// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            portions copyright @2009 Apple Inc.
// License:   Licened under MIT license (see license.js)
// ==========================================================================

/*global module test htmlbody ok equals same stop start */

htmlbody('<style> .sc-static-layout { border: 1px red dotted; } </style>');

var pane = SC.ControlTestPane.design()
    .add("Basic", SC.DropDownMenu, { 
       objects: ['None', 'Low', 'Medium', 'High']
    }) 
    
    .add("Disabled", SC.DropDownMenu, { 
       isEnabled: NO, objects: ['None', 'Low', 'Medium', 'High']
    })
    
    .add("NotVisible", SC.DropDownMenu, { 
      isVisible: NO, objects: ['None', 'Low', 'Medium', 'High']
    })
    
    .add("SortedObjects", SC.DropDownMenu, { 
      objects:['None', 'Low', 'Medium', 'High']
    })
     
    .add("UnsortedObjects", SC.DropDownMenu, { 
      objects:['None', 'Low', 'Medium', 'High'],
      disableSort: YES
    })
    
    .add("redraw", SC.DropDownMenu, {
      layout: { width: '150', right: '0' }
    })
    
    .add("DropDownWithIcon", SC.DropDownMenu, { 
     objects: [{ title: "None", icon: 'drop-down-icon', pos: 1},
       { title: "Low", icon: 'drop-down-icon', pos: 2 },
       { title: "Medium", icon: 'drop-down-icon', pos:3 },
       { title: "High", icon: 'drop-down-icon', pos: 4}],
       nameKey: 'title',
       iconKey: 'icon'
    })
    
    .add("StaticLayout", SC.DropDownMenu, {
      useStaticLayout: YES, 
      objects:['None', 'Low', 'Medium', 'High'],
      layout: { width: '150', right: '0' }
    }) ;
    
    pane.show();

// ..........................................................
// TEST VIEWS
// 

module('SC.DropDownMenu ui', pane.standardSetup()) ;

test("Check the visiblity of the dropDowns", function() {
  ok(pane.view('Basic').get('isVisibleInWindow'), 'Basic.isVisibleInWindow should be YES') ;
  ok(pane.view('Disabled').get('isVisibleInWindow'), 'Disabled.isVisibleInWindow should be YES') ;
  ok(!pane.view('NotVisible').get('isVisibleInWindow'), 'NotVisible.isVisibleInWindow should be NO') ;
  ok(pane.view('SortedObjects').get('isVisibleInWindow'), 'SortedObjects.isVisibleInWindow should be YES') ;
  ok(pane.view('UnsortedObjects').get('isVisibleInWindow'), 'UnsortedObjects.isVisibleInWindow should be YES') ;
  ok(pane.view('redraw').get('isVisibleInWindow'), 'redraw.isVisibleInWindow should be YES') ;
  ok(pane.view('DropDownWithIcon').get('isVisibleInWindow'), 'DropDownWithIcon.isVisibleInWindow should be YES') ;
  ok(pane.view('StaticLayout').get('isVisibleInWindow'), 'StaticLayout.isVisibleInWindow should be YES') ;
}) ;

test("Basic", function() {
  var view=pane.view('Basic').$();
  ok(view.hasClass('sc-view'), 'hasClass(sc-view) should be YES') ;
  ok(view.hasClass('sc-button-view'), 'hasClass(sc-button-view) should be YES') ;
  ok(view.hasClass('sc-regular-size'), 'hasClass(sc-regular-size) should be YES') ;
  ok(!view.hasClass('icon'), 'hasClass(icon) should be NO') ;
  ok(!view.hasClass('sel'), 'hasClass(sel) should be NO') ;
  ok(!view.hasClass('disabled'), 'hasClass(disabled) should be NO') ;
  ok(!view.hasClass('def'), 'hasClass(def) should be NO') ;
}) ;

test("Disabled", function() {
  view=pane.view('Disabled').$() ;
  ok(view.hasClass('disabled'), 'hasClass(disabled) should be YES') ;
  ok(view.hasClass('sc-view'), 'hasClass(sc-view) should be YES') ;
  ok(view.hasClass('sc-button-view'), 'hasClass(sc-button-view) should be YES') ;
  ok(view.hasClass('sc-regular-size'), 'hasClass(sc-regular-size) should be YES') ;
  ok(!view.hasClass('icon'), 'hasClass(icon) should be NO') ;
  ok(!view.hasClass('sel'), 'hasClass(sel) should be NO') ;
  ok(!view.hasClass('def'), 'hasClass(def) should be NO') ;
}) ;

test("NotVisible", function() {
  view=pane.view('NotVisible').$();
  ok(view.hasClass('sc-view'), 'hasClass(sc-view) should be YES') ;
  ok(view.hasClass('sc-button-view'), 'hasClass(sc-button-view) should be YES') ;
  ok(view.hasClass('sc-regular-size'), 'hasClass(sc-regular-size) should be YES') ;
  ok(!view.hasClass('sel'), 'hasClass(sel) should be NO') ;
  ok(!view.hasClass('disabled'), 'hasClass(disabled) should be NO') ;
  ok(!view.hasClass('def'), 'hasClass(def) should be NO') ;
  ok(!view.hasClass('sel'), 'should not have sel class') ;
}) ;

test("SortedObjects", function() {
   var view = pane.view('SortedObjects');
   equals(null,view.get('sortKey'), 'sortkey not specified') ;
   ok(view.$().hasClass('sc-view'), 'hasClass(sc-view) should be YES') ;
   ok(view.$().hasClass('sc-button-view'), 'hasClass(sc-button-view) should be YES') ;
   ok(view.$().hasClass('sc-regular-size'), 'hasClass(sc-regular-size) should be YES') ;
   ok(!view.$().hasClass('sel'), 'hasClass(sel) should be NO') ;
   ok(!view.$().hasClass('icon'), 'hasClass(icon) should be NO') ;
   ok(!view.$().hasClass('disabled'), 'hasClass(disabled) should be NO') ;
   ok(!view.$().hasClass('def'), 'hasClass(def) should be NO') ;
}) ;

test("UnsortedObjects", function() {
   var view = pane.view('UnsortedObjects');
   equals(YES,view.get('disableSort'), 'Sorting disabled') ;
   
   ok(view.$().hasClass('sc-view'), 'hasClass(sc-view) should be YES') ;
   ok(view.$().hasClass('sc-button-view'), 'hasClass(sc-button-view) should be YES') ;
   ok(view.$().hasClass('sc-regular-size'), 'hasClass(sc-regular-size) should be YES') ;
   ok(!view.$().hasClass('sel'), 'hasClass(sel) should be NO') ;
   ok(!view.$().hasClass('icon'), 'hasClass(icon) should be NO') ;
   ok(!view.$().hasClass('disabled'), 'hasClass(disabled) should be NO') ;
   ok(!view.$().hasClass('def'), 'hasClass(def) should be NO') ;
}) ;

test("redraw", function() {
  view=pane.view('redraw');
  ok(view.$().hasClass('sc-view'), 'hasClass(sc-view) should be YES') ;
  ok(view.$().hasClass('sc-button-view'), 'hasClass(sc-button-view) should be YES') ;
  ok(view.$().hasClass('sc-regular-size'), 'hasClass(sc-regular-size) should be YES') ;
  ok(!view.$().hasClass('sel'), 'hasClass(sel) should be NO') ;
  ok(!view.$().hasClass('icon'), 'hasClass(icon) should be NO') ;
  ok(!view.$().hasClass('disabled'), 'hasClass(disabled) should be NO') ;
  ok(!view.$().hasClass('def'), 'hasClass(def) should be NO');
  
  ok(view.get('objects').length === 0, "Objects should be empty");
  SC.RunLoop.begin();
  view.set('objects', ['Calendar', 'Work', 'Home']);
  SC.RunLoop.end();
  ok(view.get('objects').length === 3, "Objects length should be 3");
}) ;

test("DropDownWithIcon", function() {
  view=pane.view('DropDownWithIcon').$();
  ok(view.hasClass('icon'), 'hasClass(Icon) should be YES') ;
  ok(view.hasClass('sc-view'), 'hasClass(sc-view) should be YES') ;
  ok(view.hasClass('sc-button-view'), 'hasClass(sc-button-view) should be YES') ;
  ok(view.hasClass('sc-regular-size'), 'hasClass(sc-regular-size) should be YES') ;
  ok(!view.hasClass('sel'), 'hasClass(sel) should be NO') ;
  ok(!view.hasClass('disabled'), 'hasClass(disabled) should be NO') ;
  ok(!view.hasClass('def'), 'hasClass(def) should be NO') ;
}) ;

test("Check if setting a value actually changes the selection value(dropDownValue)", function() {  
  var view = pane.view('SortedObjects') ;
  SC.RunLoop.begin() ;
  view.set('dropDownValue','Medium') ;
  SC.RunLoop.end() ;
  equals(view.get('dropDownValue'), 'Medium', 'Drop Down value should change to Medium') ;
}) ;

test("StaticLayout", function() {  
  var view = pane.view('StaticLayout');
  ok(!view.$().hasClass('disabled'), 'should not have disabled class');
  ok(!view.$().hasClass('sel'), 'should not have sel class');
});


