// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            portions copyright @2009 Apple, Inc.
// License:   Licened under MIT license (see license.js)
// ==========================================================================

/*global module test htmlbody ok equals same stop start */

module("SC.PickerPane UI");

htmlbody('<style> .sc-static-layout { border: 1px red dotted; } </style>');

function evaluatePicker(pane) {
  ok(pane.get('isVisibleInWindow'), 'pane.isVisibleInWindow should be YES');
  ok(pane.$().hasClass('sc-picker'), 'pane should have sc-picker class');
  ok(pane.childViews[0].get('isVisibleInWindow'), 'pane.div.isVisibleInWindow should be YES');
  ok(pane.childViews[0].$().hasClass('sc-view'), 'pane.div should have sc-view class');
  
  var ret = pane.layoutStyle();

  equals(ret.width, '300px', 'pane should have width 300px');
  equals(ret.height, '200px', 'pane should have height 200px');
}

var anchor = SC.ControlTestPane.design()
  .add("anchor", SC.ButtonView, { 
     title: "Anchor Button" 
  });

anchor.show(); // add a test to show the test pane

var paneDefault ;
var paneMenu ;
var paneFixed ;
var panePointer ;

test("verify default picker pane content container is visible at correct location with right size", function() { 
  paneDefault = SC.PickerPane.create({
    layout: { width: 300, height: 200 },
    contentView: SC.View.extend({
      layout: { top: 0, left: 0, bottom: 0, right: 0 }
    })
  });
  paneDefault.popup(anchor.view('anchor'), SC.PICKER);
  evaluatePicker(paneDefault);
  //paneDefault.remove();
}) ;

test("verify menu picker pane content container is visible at correct location with right size", function() { 
  paneMenu = SC.PickerPane.create({
    layout: { width: 300, height: 200 },
    contentView: SC.View.extend({
      layout: { top: 0, left: 0, bottom: 0, right: 0 }
    })
  });
  paneMenu.popup(anchor.view('anchor'), SC.PICKER_MENU);
  evaluatePicker(paneMenu);
  //paneMenu.remove();
}) ;

test("verify fixed picker pane content container is visible at correct location with right size", function() { 
  paneFixed = SC.PickerPane.create({
    layout: { width: 300, height: 200 },
    contentView: SC.View.extend({
      layout: { top: 0, left: 0, bottom: 0, right: 0 }
    })
  });
  paneFixed.popup(anchor.view('anchor'), SC.PICKER_FIXED);
  evaluatePicker(paneFixed);
  //paneFixed.remove();
}) ;

test("verify pointer picker pane content container is visible at correct location with right size", function() { 
  panePointer = SC.PickerPane.create({
    layout: { width: 300, height: 200 },
    contentView: SC.View.extend({
      layout: { top: 0, left: 0, bottom: 0, right: 0 }
    })
  });
  panePointer.popup(anchor.view('anchor'), SC.PICKER_POINTER, [3,0,1,2,2]);
  evaluatePicker(panePointer);
  //panePointer.remove();
}) ;