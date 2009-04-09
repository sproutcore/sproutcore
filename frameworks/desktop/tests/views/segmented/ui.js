// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            portions copyright @2009 Apple, Inc.
// License:   Licened under MIT license (see license.js)
// ==========================================================================

/*global module test htmlbody ok equals same stop start */


htmlbody('<style> .sc-static-layout { border: 1px red dotted; } </style>');

(function() {
  var iconURL= "http://www.freeiconsweb.com/Icons/16x16_people_icons/People_046.gif";
  
  var pane = SC.ControlTestPane.design()
    
    .add("3_empty", SC.SegmentedView, { 
      items: [ '', '' , ''],
      layout: { height: 25 }
    })
    .add("3_empty,icon", SC.SegmentedView, { 
      items: [
      { value: "", icon: iconURL },
      { value: "", icon: iconURL },
      { value: "", icon: iconURL }],
      itemTitleKey: 'value',
      itemValueKey: 'value',
      itemIconKey: 'icon',
      layout: { height: 25 }
    })
    .add("3_items,1_sel", SC.SegmentedView, { 
      items: "Item1 Item2 Item3".w(),
      value: "Item2",
      layout: { height: 25 }
    })
    .add("2_items,toolTip", SC.SegmentedView, { 
      items: [
      { value: "title1", toolTip: "this is title1's tip" },
      { value: "title2", toolTip: "this is title2's tip" }],
      itemTitleKey: 'value',
      itemValueKey: 'value',
      itemToolTipKey: 'toolTip',
      layout: { height: 25 }
    })
    .add("3_items,1_sel,disabled", SC.SegmentedView, { 
      items: "Item1 Item2 Item3".w(),
      value: "Item2",
      isEnabled: NO,
      layout: { height: 25 }
    })
    .add("3_items,icon,2_sel", SC.SegmentedView, { 
      items: [
      { value: "Item1", icon: iconURL },
      { value: "Item2", icon: iconURL },
      { value: "Item3", icon: iconURL }],
      itemTitleKey: 'value',
      itemValueKey: 'value',
      itemIconKey: 'icon',
      value: "Item1 Item3".w(),
      allowsEmptySelection: NO,
      layout: { height: 25 }
    })
    .add("3_items,2_sel,disabled", SC.SegmentedView, { 
       items: [
        { value: "Item1", icon: iconURL },
        { value: "Item2", icon: iconURL },
        { value: "Item3", icon: iconURL }],
        itemTitleKey: 'value',
        itemValueKey: 'value',
        itemIconKey: 'icon',
        isEnabled: NO,
        value: "Item1 Item3".w(),
        layout: { height: 25 }
    })   
    .add("3_items,1_sel,emptySel", SC.SegmentedView, { 
      items: ["Item1", "Very Long Item", "Item 3"],
        value: "Very Long Item",
        allowsEmptySelection: YES,
        layout: { height: 25 }
    })
    .add("3_items,2_sel,emptySel", SC.SegmentedView, { 
      items: ["Item1", "Very Long Item", "Item 3"],
      value: "Item1 Item3".w(),
      allowsEmptySelection: YES,
      layout: { height: 25 }
    })
    .add("3_items,1_sel,multipleSel", SC.SegmentedView, { 
      items: "Item1 Item2 Item3".w(),
      value: "Item2",
      allowsMultipleSelection: YES,
      layout: { height: 25 }
    })
    .add("3_items,2_sel,multipleSel", SC.SegmentedView, { 
      items: "Item1 Item2 Item3".w(),
      value: "Item1 Item3".w(),
      allowsMultipleSelection: YES,
      layout: { height: 25 }
    })
    .add("3_items,1_sel,emptySel,multiSel", SC.SegmentedView, { 
      items: "Item1 Item2 Item3".w(),
      value: "Item2",
      allowsEmptySelection: YES,
      allowsMultipleSelection: YES,
      layout: { height: 25 }
    })
    .add("3_items,2_sel,emptySel,multiSel", SC.SegmentedView, { 
      items: "Item1 Item2 Item3".w(),
      value: "Item1 Item3".w(),
      allowsEmptySelection: YES,
      allowsMultipleSelection: YES,
      layout: { height: 25 }
    });
    
  pane.show(); // add a test to show the test pane

  // ..........................................................
  // TEST VIEWS
  // 
  module('SC.SegmentedView ui', pane.standardSetup());
  
  test("Check that all segmentedViews are visible", function() {
    ok(pane.view('3_empty').get('isVisibleInWindow'), '3_empty.isVisibleInWindow should be YES');
    ok(pane.view('3_empty,icon').get('isVisibleInWindow'), '3_empty,icon.isVisibleInWindow should be YES');
    ok(pane.view('3_items,1_sel').get('isVisibleInWindow'), '3_items,1_sel.isVisibleInWindow should be YES');
    ok(pane.view('2_items,toolTip').get('isVisibleInWindow'), '2_items,toolTip.isVisibleInWindow should be YES');
    ok(pane.view('3_items,1_sel,disabled').get('isVisibleInWindow'), '3_items,1_sel,disabled.isVisibleInWindow should be YES');
    ok(pane.view('3_items,icon,2_sel').get('isVisibleInWindow'), '3_items,icon,2_sel.isVisibleInWindow should be YES');
    ok(pane.view('3_items,2_sel,disabled').get('isVisibleInWindow'), '3_items,2_sel,disabled.isVisibleInWindow should be YES');
    ok(pane.view('3_items,1_sel,emptySel').get('isVisibleInWindow'), '3_items,1 sel,emptySel.isVisibleInWindow should be YES');
    ok(pane.view('3_items,2_sel,emptySel').get('isVisibleInWindow'), '3_items,2 sel,emptySel.isVisibleInWindow should be YES');
    ok(pane.view('3_items,1_sel,multipleSel').get('isVisibleInWindow'), '3_items,1_sel,multipleSel.isVisibleInWindow should be YES');
    ok(pane.view('3_items,2_sel,multipleSel').get('isVisibleInWindow'), '3_items,2_sel,multipleSel.isVisibleInWindow should be YES');
    ok(pane.view('3_items,1_sel,emptySel,multiSel').get('isVisibleInWindow'), '3_items,1_sel,emptySel,multiSel.isVisibleInWindow should be YES');
    ok(pane.view('3_items,2_sel,emptySel,multiSel').get('isVisibleInWindow'), '3_items,2_sel,emptySel,multiSel.isVisibleInWindow should be YES');
  });
  
  
  test("Check that all segments have the right classes set", function() {
    var viewElem=pane.view('3_empty').$();
    var segments=pane.view('3_empty').$('a');
    ok(viewElem.hasClass('sc-view'), '3_empty.hasClass(sc-view) should be YES');
    ok(viewElem.hasClass('sc-segmented-view'), '3_empty.hasClass(sc-segmented-view) should be YES');
    for (var i=0, ilen=segments.length; i<ilen; i++){
      seg=segments[i];
      if(i==0){
        ok((seg.className.indexOf('sc-first-segment')>=0), 'first segment has the right classname assigned.');
      }    
      if(i==segments.length-1){
        ok((seg.className.indexOf('sc-last-segment')>=0), 'last segment has the right classname assigned.');
      }
      ok((seg.childNodes[0].className.indexOf('sc-button-inner')>=0), 'segment '+i+' should have an inner-button.');
      ok((seg.childNodes[0].childNodes[0].className.indexOf('sc-button-label')>=0), 'segment '+i+' should have a label.');
        
      if(i!=0 && i!=segments.length-1){
        ok((seg.className.indexOf('sc-middle-segment')>=0), 'middle segment has the right classname assigned.');
      }
      viewElem=pane.view('3_items,2_sel,disabled').$();
      ok(viewElem.hasClass('disabled'), '3_items,2_sel,disabled should have the disabled class set');
    }

  });
  
  
  test("Check that all segments have the right classes set", function() {
    var viewElem=pane.view('3_empty,icon').$();
    var segments=pane.view('3_empty,icon').$('a');
    ok(viewElem.hasClass('sc-view'), '3_empty.hasClass(sc-view) should be YES');
    ok(viewElem.hasClass('sc-segmented-view'), '3_empty.hasClass(sc-segmented-view) should be YES');
    for (var i=0, ilen=segments.length; i<ilen; i++){
      seg=segments[i];
      if(i==0){
        ok((seg.className.indexOf('sc-first-segment')>=0), 'first segment has the right classname assigned.');
      }    
      if(i==segments.length-1){
        ok((seg.className.indexOf('sc-last-segment')>=0), 'last segment has the right classname assigned.');
      }
      ok((seg.childNodes[0].className.indexOf('sc-button-inner')>=0), 'segment '+i+' should have an inner-button.');
      ok((seg.childNodes[0].childNodes[0].className.indexOf('sc-button-label')>=0), 'segment '+i+' should have a label.');
      ok((seg.childNodes[0].childNodes[0].childNodes[0].src.length>0), 'segment '+i+' should have an icon.');
        
      if(i!=0 && i!=segments.length-1){
        ok((seg.className.indexOf('sc-middle-segment')>=0), 'middle segment has the right classname assigned.');
      }
      viewElem=pane.view('3_items,2_sel,disabled').$();
      ok(viewElem.hasClass('disabled'), '3_items,2_sel,disabled should have the disabled class set');
    }

  });
  
  
  test("Check that the selected segments have the right classes assigned.", function() {
    var segments=pane.view('3_empty').$('a');
    for (var i=0, ilen=segments.length; i<ilen; i++){
      seg=segments[i];
      ok((seg.className.indexOf('sel')==-1), 'this element should not be selected.');
    }

  });
  
  
  test("Check that two items are selected.", function() {
    var segments=pane.view('3_items,icon,2_sel').$('a');
    var count=0;
    for (var i=0, ilen=segments.length; i<ilen; i++){
      seg=segments[i];
      if(seg.className.indexOf('sel')!=-1){
        count++;
      }
    }
    ok((count==2), '3_items,2_sel,disabled should have two segments selected.');

  });
  
  
  test("2_items,toolTip has toolTips assigned.", function() {
    var segments=pane.view('2_items,toolTip').$('a');
    ok((segments[0].title=="this is title1's tip"), 'first segment has expected tool tip assigned.');
    ok((segments[1].title=="this is title2's tip"), 'second segment has expected tool tip assigned.');
  });
  
})();
