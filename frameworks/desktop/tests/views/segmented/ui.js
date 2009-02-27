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
    .add("3_items,1_selected", SC.SegmentedView, { 
      items: "Item1 Item2 Item3".w(),
      value: "Item2",
      layout: { height: 25 }
    })
    
    .add("3_items, 1_selected, disabled", SC.SegmentedView, { 
      items: "Item1 Item2 Item3".w(),
      value: "Item2",
      isEnabled: NO,
      layout: { height: 25 }
    })
    .add("3_items,icon, 2_sel", SC.SegmentedView, { 
      items: [
      { value: "Item1", icon: iconURL },
      { value: "Item2", icon: iconURL },
      { value: "Item3", icon: iconURL }],
      itemTitleKey: 'value',
      itemValueKey: 'value',
      itemIconKey: 'icon',
      value: "Item1 Item3".w(),
      layout: { height: 25 }
    })
    .add("3_items, 2_sel, disabled", SC.SegmentedView, { 
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
    .add("3_items, 1 sel, emptySel", SC.SegmentedView, { 
      items: ["Item1", "Very Long Item", "Item 3"],
        value: "Very Long Item",
        allowsEmptySelection: YES,
        layout: { height: 25 }
    })
    .add("3_items, 2 sel, emptySel", SC.SegmentedView, { 
      items: ["Item1", "Very Long Item", "Item 3"],
      value: "Item1 Item3".w(),
      allowsEmptySelection: YES,
      layout: { height: 25 }
    })
    .add("3_items, 1 sel, multipleSel", SC.SegmentedView, { 
      items: "Item1 Item2 Item3".w(),
      value: "Item2",
      allowsMultipleSelection: YES,
      layout: { height: 25 }
    })
    .add("3_items, 2 sel, multipleSel", SC.SegmentedView, { 
      items: "Item1 Item2 Item3".w(),
      value: "Item1 Item3".w(),
      allowsMultipleSelection: YES,
      layout: { height: 25 }
    })
    .add("3_items, 1 sel, emptySel, multiSel", SC.SegmentedView, { 
      items: "Item1 Item2 Item3".w(),
      value: "Item2",
      allowsEmptySelection: YES,
      allowsMultipleSelection: YES,
      layout: { height: 25 }
    })
    .add("3_items, 2 sel, emptySel, multiSel", SC.SegmentedView, { 
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
  
  test("basic", function() {
    ok(true, 'hello');
  });

})();
