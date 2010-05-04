// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2010 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2010 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/*globals TestControls Forms*/
TestControls.radioPage = SC.View.design({
  childViews: "form".w(),
  form: SC.FormView.design({
    classNames: ["sample_controls"],
    layout: { left: 20, top: 40, right: 20, bottom: 40 },
    childViews: "header normal disabled multiple".w(),
    header: SC.LabelView.design({
      classNames: "header".w(),
      value: "Radio Views"
    }),
    normal: SC.FormView.row(SC.RadioView.design({
      layout: { width: 150, height: 60},
      items: [ { title: "One", value: "one" },{ title: "Two", value: "two" },{ title: "Three", value: "three" } ],
      itemTitleKey: "title", itemValueKey: "value",
      value: null
    })),
    disabled: SC.FormView.row(SC.RadioView.design({
      layout: { width: 150, height: 60},
      isEnabled: NO,
      items: [ { title: "One", value: "one" },{ title: "Two", value: "two" },{ title: "Three", value: "three" } ],
      itemTitleKey: "title", itemValueKey: "value",
      value: "one"
    })),
    multiple: SC.FormView.row(SC.RadioView.design({
      layout: {width: 150, height: 60},
      items: [ { title: "One", value: "one" },{ title: "Two", value: "two" },{ title: "Three", value: "three" } ],
      itemTitleKey: "title", itemValueKey: "value",
      value: ["one", "three"]
    }))
  })
});