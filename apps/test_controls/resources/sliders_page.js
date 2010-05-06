// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2010 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2010 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/*globals TestControls Forms*/
TestControls.slidersPage = SC.View.design({
  childViews: "form".w(),
  form: SC.FormView.design({
    classNames: ["sample_controls"],
    layout: { left: 20, top: 40, right: 20, bottom: 40 },
    childViews: "header normal disabled".w(),
    header: SC.LabelView.design({
      classNames: "header".w(),
      value: "Radio Views"
    }),
    
    normal: SC.FormView.row(SC.SliderView.design({
      layout: { width: 150, height: 16},
      minimum: 0,
      maximum: 10,
      value: 2
    })),
    disabled: SC.FormView.row(SC.SliderView.design({
      layout: { width: 150, height: 16},
      isEnabled: NO,
      minimum: 0,
      maximum: 10,
      value: 2
    }))
  })
});