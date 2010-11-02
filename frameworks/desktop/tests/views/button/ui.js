// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2010 Sprout Systems, Inc. and contributors.
//            portions copyright @2009 Apple Inc.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/*global module test htmlbody ok equals same */

htmlbody('<style> .sc-static-layout { border: 1px red dotted; } </style>');

  var iconURL= "http://www.freeiconsweb.com/Icons/16x16_people_icons/People_046.gif";
(function() {
var pane = SC.ControlTestPane.design({height:24})
  .add("basic", SC.ButtonView, {
  })
  
  .add("title", SC.ButtonView, { 
     title: "Hello World"
  })
   
  .add("icon", SC.ButtonView, { 
    icon: iconURL
  })
    
  .add("title,icon", SC.ButtonView, { 
    title: "Hello World", icon: iconURL
  })
     
  .add("title,icon,disabled", SC.ButtonView, { 
    title: "Hello World", icon: iconURL , isEnabled: NO
  })
  
  .add("title,icon,default", SC.ButtonView, { 
    title: "Hello World", icon: iconURL , isDefault: YES
  })

  .add("title,icon,selected", SC.ButtonView, { 
    title: "Hello World", icon: iconURL , isSelected: YES
  })

  .add("title,toolTip", SC.ButtonView, { 
    title: "Hello World", toolTip: 'Hello World is my tool tip'
  })
  
  .add("autocontrolsize", SC.ButtonView, { 
    controlSize: SC.AUTO_CONTROL_SIZE,
    title: "Hello Cheese", layout: { left: 0, top: 0, right: 0, height: 37 }
  })
  
  .add("calculatedcontrolsize", SC.ButtonView, {
    // control size should end up small
    title: "Smelly Severus", layout: { left: 0, top: 2, right: 0, bottom: 2 },
    controlSize: SC.CALCULATED_CONTROL_SIZE
  })
  
  .add("iconchange", SC.ButtonView, {
    layout: { left: 0, top: 2, right: 0, bottom: 2 },
    renderStyle: 'renderImage',
    icon: 'start'
  });

pane.show(); // add a test to show the test pane

module('SC.ButtonView ui');

test("Check that all button are visible", function() {
  ok(pane.view('basic').get('isVisibleInWindow'), 'basic.isVisibleInWindow should be YES');
  ok(pane.view('title').get('isVisibleInWindow'), 'title.isVisibleInWindow should be YES');
  ok(pane.view('icon').get('isVisibleInWindow'), 'icon.isVisibleInWindow should be YES');
  ok(pane.view('title,icon').get('isVisibleInWindow'), 'title,icon.isVisibleInWindow should be YES');
  ok(pane.view('title,icon,disabled').get('isVisibleInWindow'), 'title,icon,disabled.isVisibleInWindow should be YES');
  ok(pane.view('title,icon,default').get('isVisibleInWindow'), 'title,icon,default.isVisibleInWindow should be YES');
  ok(pane.view('title,icon,selected').get('isVisibleInWindow'), 'title.icon,selected.isVisibleInWindow should be YES');
  ok(pane.view('title,toolTip').get('isVisibleInWindow'), 'title,toolTip.isVisibleInWindow should be YES');
});
  

test("Check that all buttons have the right classes set", function() {
  var viewElem=pane.view('basic').$();
  ok(viewElem.hasClass('sc-view'), 'basic.hasClass(sc-view) should be YES');
  ok(viewElem.hasClass('sc-button-view'), 'basic.hasClass(sc-button-view) should be YES');
  ok(viewElem.hasClass('sc-regular-size'), 'basic.hasClass(sc-regular-size) should be YES');
  ok(!viewElem.hasClass('icon'), 'basic.hasClass(icon) should be NO');
  ok(!viewElem.hasClass('sel'), 'basic.hasClass(sel) should be NO');
  ok(!viewElem.hasClass('disabled'), 'basic.hasClass(disabled) should be NO');
  ok(!viewElem.hasClass('def'), 'basic.hasClass(def) should be NO');
  
  
  viewElem=pane.view('title').$();
  ok(viewElem.hasClass('sc-view'), 'title.hasClass(sc-view) should be YES');
  ok(viewElem.hasClass('sc-button-view'), 'title.hasClass(sc-button-view) should be YES');
  ok(viewElem.hasClass('sc-regular-size'), 'title.hasClass(sc-regular-size) should be YES');
  ok(!viewElem.hasClass('icon'), 'title.hasClass(icon) should be NO');
  ok(!viewElem.hasClass('sel'), 'title.hasClass(sel) should be NO');
  ok(!viewElem.hasClass('disabled'), 'title.hasClass(disabled) should be NO');
  ok(!viewElem.hasClass('def'), 'title.hasClass(def) should be NO');

  viewElem=pane.view('icon').$();
  ok(viewElem.hasClass('sc-view'), 'icon.hasClass(sc-view) should be YES');
  ok(viewElem.hasClass('sc-button-view'), 'icon.hasClass(sc-button-view) should be YES');
  ok(viewElem.hasClass('sc-regular-size'), 'icon.hasClass(sc-regular-size) should be YES');
  ok(viewElem.hasClass('icon'), 'icon.hasClass(icon) should be YES');
  ok(!viewElem.hasClass('sel'), 'icon.hasClass(sel) should be NO');
  ok(!viewElem.hasClass('disabled'), 'icon.hasClass(disabled) should be NO');
  ok(!viewElem.hasClass('def'), 'icon.hasClass(def) should be NO');

  viewElem=pane.view('title,icon').$();
  ok(viewElem.hasClass('sc-view'), 'title,icon.hasClass(sc-view) should be YES');
  ok(viewElem.hasClass('sc-button-view'), 'title,icon.hasClass(sc-button-view) should be YES');
  ok(viewElem.hasClass('sc-regular-size'), 'title,icon.hasClass(sc-regular-size) should be YES');
  ok(viewElem.hasClass('icon'), 'title,icon.hasClass(icon) should be YES');
  ok(!viewElem.hasClass('sel'), 'title,icon.hasClass(sel) should be NO');
  ok(!viewElem.hasClass('disabled'), 'title,icon.hasClass(disabled) should be NO');
  ok(!viewElem.hasClass('def'), 'title,icon.hasClass(def) should be NO');

  viewElem=pane.view('title,icon,disabled').$();
  ok(viewElem.hasClass('sc-view'), 'title,icon,disabled.hasClass(sc-view) should be YES');
  ok(viewElem.hasClass('sc-button-view'), 'title,icon,disabled.hasClass(sc-button-view) should be YES');
  ok(viewElem.hasClass('sc-regular-size'), 'title,icon,disabled.hasClass(sc-regular-size) should be YES');
  ok(viewElem.hasClass('icon'), 'title,icon,disabled.hasClass(icon) should be YES');
  ok(!viewElem.hasClass('sel'), 'title,icon,disabled.hasClass(sel) should be NO');
  ok(viewElem.hasClass('disabled'), 'title,icon,disabled.hasClass(disabled) should be YES');
  ok(!viewElem.hasClass('def'), 'title,icon,disabled.hasClass(def) should be NO');

  viewElem=pane.view('title,icon,default').$();
  ok(viewElem.hasClass('sc-view'), 'title,icon,default.hasClass(sc-view) should be YES');
  ok(viewElem.hasClass('sc-button-view'), 'title,icon,default.hasClass(sc-button-view) should be YES');
  ok(viewElem.hasClass('sc-regular-size'), 'title,icon,default.hasClass(sc-regular-size) should be YES');
  ok(viewElem.hasClass('icon'), 'title,icon,default.hasClass(icon) should be YES');
  ok(!viewElem.hasClass('sel'), 'title,icon,default.hasClass(sel) should be NO');
  ok(!viewElem.hasClass('disabled'), 'title,icon,default.hasClass(disabled) should be NO');
  ok(viewElem.hasClass('def'), 'title,icon,default.hasClass(def) should be YES');
  
  viewElem=pane.view('title,icon,selected').$();
   ok(viewElem.hasClass('sc-view'), 'title,icon,selected.hasClass(sc-view) should be YES');
   ok(viewElem.hasClass('sc-button-view'), 'title,icon,selected.hasClass(sc-button-view) should be YES');
   ok(viewElem.hasClass('sc-regular-size'), 'title,icon,selected.hasClass(sc-regular-size) should be YES');
   ok(viewElem.hasClass('icon'), 'title,icon,selected.hasClass(icon) should be YES');
   ok(viewElem.hasClass('sel'), 'title,icon,selected.hasClass(sel) should be YES');
   ok(!viewElem.hasClass('disabled'), 'title,icon,selected.hasClass(disabled) should be NO');
   ok(!viewElem.hasClass('def'), 'title,icon,selected.hasClass(def) should be NO');
   
   viewElem=pane.view('title,toolTip').$();
   ok(viewElem.hasClass('sc-view'), 'title,toolTip.hasClass(sc-view) should be YES');
   ok(viewElem.hasClass('sc-button-view'), 'title,toolTip.hasClass(sc-button-view) should be YES');
   ok(viewElem.hasClass('sc-regular-size'), 'title,toolTip.hasClass(sc-regular-size) should be YES');
   ok(!viewElem.hasClass('icon'), 'title,toolTip.hasClass(icon) should be NO');
   ok(!viewElem.hasClass('sel'), 'title,toolTip.hasClass(sel) should be NO');
   ok(!viewElem.hasClass('disabled'), 'title,toolTip.hasClass(disabled) should be NO');
   ok(!viewElem.hasClass('def'), 'title,toolTip.hasClass(def) should be NO');

});



test("Check that the title is set or not and if it is in the appropriate element", function() {
  var viewElem=pane.view('basic').$('span');
  equals(viewElem.text(), '', 'should not have a title');
  viewElem=pane.view('basic').$('label');
  ok(viewElem!==null, 'should have a label element even with no title');

  viewElem=pane.view('title').$('span');
  equals(viewElem.text(), 'Hello World', 'should not have a title');
  viewElem=pane.view('title').$('label');
  ok(viewElem!==null, 'should have a label element');


  viewElem=pane.view('icon').$('span.label.img');
  ok((viewElem!==null), 'should have an image corresponding to an icon');

});

test("Check if title,toolTip has the tool tip set", function() {
  var viewElem=pane.view('title,toolTip').$();
  ok(viewElem.attr("title") == 'Hello World is my tool tip', 'title,toolTip has the expected tool tip set.');
});

test("Check if AUTO_CONTROL_SIZE button automatically calculated the correct controlSize", function() {
  var viewElem=pane.view('autocontrolsize').$();
  ok(viewElem.hasClass('sc-huge-size'), 'HUGE button has sc-huge-size class.');
});

test("Check if CALCULATED_CONTROL_SIZE automatically found the correct controlSize", function() {
  var viewElem=pane.view('calculatedcontrolsize').$();
  ok(viewElem.hasClass('sc-small-size'), 'CALCULATED_CONTROL_SIZE button has sc-small-size class.');
});

test("Check if icon class is set properly on ImageButton",function(){
  var viewElem=pane.view('iconchange').$('div');
  ok(viewElem.hasClass('start'), 'Icon class set initially to "start"');
});

test("Check if icon class is set properly on ImageButton if changed", function(){
  SC.RunLoop.begin();
  var viewElem = pane.view('iconchange');
  viewElem.set('icon','stop');
  SC.RunLoop.end(); // force redraw...
  var newViewElem = pane.view('iconchange').$('div');
  ok(newViewElem.hasClass('stop'), 'Icon class has correctly changed to "stop"')
});

})();
