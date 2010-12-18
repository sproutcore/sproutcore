// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2010 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/*globals TestControls Forms*/
TestControls.slidersPage = SC.View.design({
  childViews: "form".w(),
  form: SC.FormView.design({
    classNames: ["sample_controls"],
    layout: { left: 20, top: 40, right: 20, bottom: 40 },
    childViews: "header small normal jumbo disabled".w(),
    // Plain Views
    header: SC.LabelView.design({
      fillWidth: YES,
      layout: { width: 250, height: 18 },
      value: "Sliders",
      classNames: "header".w()
    }),
    
    small: SC.FormView.row(SC.SliderView.design({
      layout: { width: 150, height: 14 },
      controlSize: SC.SMALL_CONTROL_SIZE,
      minimum: 0,
      maximum: 10,
      value: 2
    })),
    
    normal: SC.FormView.row(SC.SliderView.design({
      layout: { width: 150, height: 16 },
      minimum: 0,
      maximum: 10,
      value: 2
    })),
    
    jumbo: SC.FormView.row(SC.SliderView.design({
      controlSize: SC.JUMBO_CONTROL_SIZE,
      layout: { width: 150, height: 22 },
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