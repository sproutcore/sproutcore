// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2010 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2010 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/*globals TestControls Forms*/
TestControls.segmentedPage = SC.View.design({
  childViews: "form".w(),
  form: SC.FormView.design({
    classNames: ["sample_controls"],
    layout: { left: 20, top: 40, right: 20, bottom: 40 },
    childViews: "header small normal large jumbo disabled multiple multiple_side_by_side overflow".w(),
    
    header: SC.LabelView.design({
      layout: {width:300, height:24},
      classNames: "header".w(),
      value: "Segmented Views "
    }),
    
    small: SC.FormView.row(SC.SegmentedView.design({
      allowsEmptySelection: YES,
      layout: { left: 0, width: 200, height: 18, centerY: 0},
      controlSize: SC.SMALL_CONTROL_SIZE,
      items: [ { title: "One", value: "one" },{ title: "Two", value: "two" },{ title: "Three", value: "three" } ],
      itemTitleKey: "title", itemValueKey: "value",
      value: null
    })),
    
    normal: SC.FormView.row(SC.SegmentedView.design({
      allowsEmptySelection: YES,
      layout: { left: 0, width: 200, height: 24, centerY: 0},
      controlSize: SC.REGULAR_CONTROL_SIZE,
      items: [ { title: "One", value: "one" },{ title: "Two", value: "two" },{ title: "Three", value: "three" } ],
      itemTitleKey: "title", itemValueKey: "value",
      value: null
    })),

    large: SC.FormView.row(SC.SegmentedView.design({
      allowsEmptySelection: YES,
      layout: { left: 0, width: 200, height: 30, centerY: 0},
      controlSize: SC.LARGE_CONTROL_SIZE,
      items: [ { title: "One", value: "one" },{ title: "Two", value: "two" },{ title: "Three", value: "three" } ],
      itemTitleKey: "title", itemValueKey: "value",
      value: null
    })),

    jumbo: SC.FormView.row(SC.SegmentedView.design({
      allowsEmptySelection: YES,
      layout: { left: 0, width: 200, height: 44, centerY: 0},
      controlSize: SC.JUMBO_CONTROL_SIZE,
      items: [ { title: "One", value: "one" },{ title: "Two", value: "two" },{ title: "Three", value: "three" } ],
      itemTitleKey: "title", itemValueKey: "value",
      value: null
    })),
    
    disabled: SC.FormView.row(SC.SegmentedView.design({
      layout: { left: 0, width: 200, height: 24, centerY: 0},
      isEnabled: NO,
      items: [ { icon: "sc-icon-info-16", title: "One", value: "one" },{ title: "Two", value: "two" },{ title: "Three", value: "three" } ],
      itemTitleKey: "title", itemValueKey: "value", itemIconKey: "icon",
      value: "one"
    })),
    multiple: SC.FormView.row(SC.SegmentedView.design({
      allowsEmptySelection: YES,
      allowsMultipleSelection: YES,
      layout: { left: 0, width: 200, height: 24, centerY: 0},
      items: [ { title: "One", value: "one" },{ title: "Two", value: "two" },{ title: "Three", value: "three" } ],
      itemTitleKey: "title", itemValueKey: "value",
      value: ["one", "three"]
    })),
    
    multiple_side_by_side: SC.FormView.row(SC.SegmentedView.design({
      allowsEmptySelection: YES,
      allowsMultipleSelection: YES,
      layout: { left: 0, width: 200, height: 24, centerY: 0},
      items: [ { title: "One", value: "one" },{ title: "Two", value: "two" },{ title: "Three", value: "three" } ],
      itemTitleKey: "title", itemValueKey: "value",
      value: ["one", "two"]
    })),
    
    overflow: SC.FormView.row(SC.SegmentedView.design({
      flowSize: { height: 24, width: 0.5},
      controlSize: SC.REGULAR_CONTROL_SIZE,
      items: [ { title: "One", value: "one", width: 80 },{ title: "Two", value: "two", width: 80 },{ title: "Three", value: "three", width: 80 },{ title: "Four", value: "four", width: 80 },{ title: "Five", value: "five", width: 80 },{ title: "Six", value: "six", width: 80 },{ title: "Seven", value: "seven", width: 80 },{ title: "Eight", value: "eight", width: 80 } ],
      itemTitleKey: "title", itemValueKey: "value", itemWidthKey: "width",
      value: null
    }))
  })
});