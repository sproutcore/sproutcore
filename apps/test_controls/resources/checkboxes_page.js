// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2010 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/*globals TestControls Forms*/
TestControls.checkboxesPage = SC.View.design({
  childViews: "form".w(),
  form: SC.FormView.design({
    classNames: ["sample_controls"],
    layout: { left: 20, top: 40, right: 20, bottom: 40 },
    childViews: "header small normal disabled multiple".w(),
    
    header: SC.LabelView.design({
      fillWidth: YES,
      layout: { width: 200, height: 24 },
      classNames: "header".w(),
      value: "Checkboxes"
    }),
    
    small: SC.FormView.row(SC.CheckboxView.design({
      layout: {width: 150, height: 24},
      title: "Check Me",
      controlSize: SC.SMALL_CONTROL_SIZE
    })),
    
    normal: SC.FormView.row(SC.CheckboxView.design({
      layout: { width: 150, height: 24 },
      title: "Check Me"
    })),
    
    disabled: SC.FormView.row(SC.CheckboxView.design({
      layout: { width: 150, height: 24 },
      isEnabled: NO,
      title: "Don't Check Me"
    })),
    
    multiple: SC.FormView.row(SC.CheckboxView.design({
      layout: { width: 150, height: 24 },
      value: [YES, NO],
      title: "Multiple? Really?"
    }))
  })
});