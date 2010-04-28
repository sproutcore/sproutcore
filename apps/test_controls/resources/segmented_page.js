/*globals TestControls Forms*/
TestControls.segmentedPage = SC.View.design({
  childViews: "form".w(),
  form: SC.FormView.design({
    classNames: ["sample_controls"],
    layout: { left: 20, top: 40, right: 20, bottom: 40 },
    childViews: "header normal disabled multiple multiple_side_by_side".w(),
    
    header: SC.LabelView.design({
      layout: {width:300, height:24},
      classNames: "header".w(),
      value: "Segmented Views "
    }),
    
    normal: SC.FormView.row(SC.SegmentedView.design({
      layout: { left: 0, width: 200, height: 24, centerY: 0},
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
      layout: { left: 0, width: 200, height: 24, centerY: 0},
      items: [ { title: "One", value: "one" },{ title: "Two", value: "two" },{ title: "Three", value: "three" } ],
      itemTitleKey: "title", itemValueKey: "value",
      value: ["one", "three"]
    })),
    
    multiple_side_by_side: SC.FormView.row(SC.SegmentedView.design({
      layout: { left: 0, width: 200, height: 24, centerY: 0},
      items: [ { title: "One", value: "one" },{ title: "Two", value: "two" },{ title: "Three", value: "three" } ],
      itemTitleKey: "title", itemValueKey: "value",
      value: ["one", "two"]
    }))
  })
});