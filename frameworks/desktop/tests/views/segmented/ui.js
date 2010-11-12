// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2010 Sprout Systems, Inc. and contributors.
//            portions copyright @2009 Apple Inc.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/*global module test htmlbody ok equals same stop start */


htmlbody('<style> .sc-static-layout { border: 1px red dotted; } </style>');
var pane;
(function() {
  var iconURL= "http://www.freeiconsweb.com/Icons/16x16_people_icons/People_046.gif";
  
  pane = SC.ControlTestPane.design()
    
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
    })
    .add("3_items,leftAligned", SC.SegmentedView, { 
      items: "Item1 Item2 Item3".w(),
      align: SC.ALIGN_LEFT,
      layout: { height: 25 }
    })
    .add("3_items,rightAligned", SC.SegmentedView, { 
      items: "Item1 Item2 Item3".w(),
      align: SC.ALIGN_RIGHT,
      layout: { height: 25 }
    })
    .add("3_items,widths", SC.SegmentedView, { 
      items: [
      { value: "A", width: 70 },
      { value: "B", width: 70 },
      { value: "C", width: 70 }],
      itemTitleKey: 'value',
      itemValueKey: 'value',
      itemWidthKey: 'width',
      layout: { height: 25 }
    })
    .add("5_items,widths,overflow", SC.SegmentedView, { 
      items: [
      { value: "A", width: 70 },
      { value: "B", width: 70 },
      { value: "C", width: 70 },
      { value: "D", width: 70 },
      { value: "E", width: 70 }],
      itemTitleKey: 'value',
      itemValueKey: 'value',
      itemWidthKey: 'width',
      layout: { height: 25 }
    })
    .add("5_items,1_sel,widths,overflow", SC.SegmentedView, { 
      items: [
      { value: "A", width: 70 },
      { value: "B", width: 70 },
      { value: "C", width: 70 },
      { value: "D", width: 70 },
      { value: "E", width: 70 }],
      itemTitleKey: 'value',
      itemValueKey: 'value',
      itemWidthKey: 'width',
      value: "D",
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
    ok(pane.view('3_items,leftAligned').get('isVisibleInWindow'), '3_items,leftAligned.isVisibleInWindow should be YES');
    ok(pane.view('3_items,rightAligned').get('isVisibleInWindow'), '3_items,rightAligned.isVisibleInWindow should be YES');
  });
  
  
  test("Check that all segments have the right classes set", function() {
    var viewElem=pane.view('3_empty').$();
    var segments=pane.view('3_empty').$('a');
    equals(segments.length, 3, 'precond - segmented view should have 3 segments');
    ok(viewElem.hasClass('sc-view'), '3_empty.hasClass(sc-view) should be YES');
    ok(viewElem.hasClass('sc-segmented-view'), '3_empty.hasClass(sc-segmented-view) should be YES');
    for (var i=0, ilen=segments.length; i<ilen; i++){
      var seg=segments[i];
      if(i===0){
        ok((seg.className.indexOf('sc-first-segment')>=0), 'first segment has the right classname assigned.');
      }    
      if(i==segments.length-1){
        ok((seg.className.indexOf('sc-last-segment')>=0), 'last segment has the right classname assigned.');
      }
      ok((seg.childNodes[0].className.indexOf('sc-button-inner')>=0), 'segment '+i+' should have an inner-button.');
      ok((seg.childNodes[0].childNodes[0].className.indexOf('sc-button-label')>=0), 'segment '+i+' should have a label.');
        
      if(i!==0 && i!=segments.length-1){
        ok((seg.className.indexOf('sc-middle-segment')>=0), 'middle segment has the right classname assigned.');
      }
      viewElem=pane.view('3_items,2_sel,disabled').$();
      ok(viewElem.hasClass('disabled'), '3_items,2_sel,disabled should have the disabled class set');
    }

  });
  
  
  test("Check that all segments have the right classes set", function() {
    var viewElem=pane.view('3_empty,icon').$();
    var segments=pane.view('3_empty,icon').$('a');
    equals(segments.length, 3, 'precond - segmented view should have 3 segments');
    ok(viewElem.hasClass('sc-view'), '3_empty.hasClass(sc-view) should be YES');
    ok(viewElem.hasClass('sc-segmented-view'), '3_empty.hasClass(sc-segmented-view) should be YES');
    for (var i=0, ilen=segments.length; i<ilen; i++){
      var seg=segments[i];
      if(i===0){
        ok((seg.className.indexOf('sc-first-segment')>=0), 'first segment has the right classname assigned.');
      }    
      if(i==segments.length-1){
        ok((seg.className.indexOf('sc-last-segment')>=0), 'last segment has the right classname assigned.');
      }
      ok((seg.childNodes[0].className.indexOf('sc-button-inner')>=0), 'segment '+i+' should have an inner-button.');
      ok((seg.childNodes[0].childNodes[0].className.indexOf('sc-button-label')>=0), 'segment '+i+' should have a label.');
      ok((seg.childNodes[0].childNodes[0].childNodes[0].src.length>0), 'segment '+i+' should have an icon.');
        
      if(i!==0 && i!=segments.length-1){
        ok((seg.className.indexOf('sc-middle-segment')>=0), 'middle segment has the right classname assigned.');
      }
      viewElem=pane.view('3_items,2_sel,disabled').$();
      ok(viewElem.hasClass('disabled'), '3_items,2_sel,disabled should have the disabled class set');
    }

  });
  
  
  test("Check that the selected segments have the right classes assigned.", function() {
    var segments=pane.view('3_empty').$('a');
    equals(segments.length, 3, 'precond - segmented view should have 3 segments');
    for (var i=0, ilen=segments.length; i<ilen; i++){
      var seg=segments[i];
      ok((seg.className.indexOf('sel')==-1), 'this element should not be selected.');
    }

  });
  
  
  test("Check that two items are selected.", function() {
    var segments=pane.view('3_items,icon,2_sel').$('a');
    var count=0;
    equals(segments.length, 3, 'precond - segmented view should have 3 segments');
    for (var i=0, ilen=segments.length; i<ilen; i++){
      var seg=segments[i];
      if(seg.className.indexOf('sel')!=-1){
        count++;
      }
    }
    equals(count, 2, '3_items,2_sel,disabled should have two segments selected.');

  });
  
  
  test("2_items,toolTip has toolTips assigned.", function() {
    var segments=pane.view('2_items,toolTip').$('a');
    ok((segments[0].title=="this is title1's tip"), 'first segment has expected tool tip assigned.');
    ok((segments[1].title=="this is title2's tip"), 'second segment has expected tool tip assigned.');
  });
  
  test("Check the alignment styles for align property.", function() {
    equals(pane.view("3_empty").$().css('text-align'), 'center', 'default align property should text-align the segmented-view to the center');
    equals(pane.view("3_items,leftAligned").$().css('text-align'), 'left', 'setting align: SC.ALIGN_LEFT should text-align the segmented-view to the left');
    equals(pane.view("3_items,rightAligned").$().css('text-align'), 'right', 'setting align: SC.ALIGN_LEFT should text-align the segmented-view to the left');
  });
  
  test("Check that changing title re-renders the segments (for hash or object items only).", function() {
    var sv = pane.view("3_items,widths");
    var segments=sv.$('a');
    var defaults = ['A', 'B', 'C'];
    for (var i=0, len=segments.length; i < len; i++){
      var segEl=segments[i];
      var label=$(segEl).find('label')[0];
      equals(label.innerHTML, defaults[i], 'there should be "' + defaults[i] + '" in the segment\'s label');
    }
    
    // change the title of the second item
    var items = sv.get('items');
    items[1].set('value', 'Item 2');
    
    // allow for a render to happen
    SC.RunLoop.begin().end();
    
    segEl=segments[1];
    label=$(segEl).find('label')[0];
    equals(label.innerHTML, "Item 2", 'there should be "Item 2" text in the second segment');
  });
  
  test("Check that changing width re-renders the segments (for hash or object items only).", function() {
    var sv = pane.view("3_items,widths");
    var segments=sv.$('a');
    for (var i=0, len=segments.length; i < len; i++){
      var segEl=segments[i];
      var width=$(segEl).css('width');
      equals(width, "70px", 'the segment style width should be "70px"');
    }
    
    // change the width of the second item
    var items = sv.get('items');
    items[1].set('width', 100);
    
    // allow for a render to happen
    SC.RunLoop.begin().end();
    
    segEl=segments[1];
    width=$(segEl).css('width');
    equals(width, "100px", 'the second segment style width should be "100px"');
  });
  
  test("Check that overflow adds an overflow segment on view.", function() {
    var sv = pane.view("5_items,widths,overflow");
    var lastIsOverflow = function(sv) {
      SC.RunLoop.begin().end(); // allow for a render to happen
    
      var segments=sv.$('a');
      var overflowEl = segments[segments.length - 1];
      ok($(overflowEl).hasClass('sc-overflow-segment'), 'overflow segment should have .sc-overflow-segment class');
      var overflowLabelEl = $(overflowEl).find('label')[0];
      equals(overflowLabelEl.innerHTML, "»", 'there should be "»" text in the overflow segment');
    };
    
    var lastIsSegment = function(sv, text) {
      SC.RunLoop.begin().end(); // allow for a render to happen
    
      var segments=sv.$('a');
      var lastEl = segments[segments.length - 1];
      ok(!$(lastEl).hasClass('sc-overflow-segment'), 'last segment should not have .sc-overflow-segment class');
      var lastLabelEl = $(lastEl).find('label')[0];
      equals(lastLabelEl.innerHTML, text, 'there should be "' + text + '" text in the last segment');
    };
    
    // the last item should be an overflow segment (ie. has .sc-overflow-segment class and text "»")
    lastIsOverflow(sv);
    
    // check that the overflowed items are stored
    var overflowItems = sv.overflowItems;
    equals(overflowItems.length, 2, "there should be 2 overflowed items");
    
    // 1. remove the last two items (the last item should no longer be an overflow segment)
    var items = sv.get('items');
    items.removeAt(items.length - 1);
    items.removeAt(items.length - 1);
    lastIsSegment(sv, "C");
    
    // 2. add an item (the last item should be an overflow segment again)
    items.pushObject({value: 'X', width: 100});
    lastIsOverflow(sv);
    
    // 3. shrink the items (the last item should no longer be an overflow segment)
    items.invoke('set', 'width', 50);
    lastIsSegment(sv, "X");
    
    // 4. grow the items (the last item should be an overflow segment again)
    items.invoke('set', 'width', 100);
    lastIsOverflow(sv);
    
    // 5. shrink the items, but then shrink the segmented view 
    items.invoke('set', 'width', 50);
    lastIsSegment(sv, "X");
    sv.set('layout', {left: 75, right: 75, top: 0, height: 25});
    sv.updateLayer();
    SC.RunLoop.begin().end(); // allow for a render to happen (update layout)
    sv.notifyPropertyChange('frame');
    SC.RunLoop.begin().end(); // allow for a render to happen (measure the segments)
    lastIsOverflow(sv);
  });
  
  test("Check that the overflow segment is selected when overflowed items are selected.", function() {
    var sv = pane.view("5_items,1_sel,widths,overflow");
    var segments=sv.$('a');
    
    // the overflow item should be selected (because an overflowed item is selected)
    var overflowEl = segments[segments.length - 1];
    ok($(overflowEl).hasClass('sel'), 'overflow segment should have .sel class');
  });
})();
