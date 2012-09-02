// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/*globals TestControls Forms*/
TestControls.progressPage = SC.View.design({
  childViews: "form".w(),
  form: SC.FormView.design({
    classNames: ["sample_controls"],
    layout: { left: 20, top: 40, right: 20, bottom: 40 },
    
    childViews: "header normal disabled indeterminate".w(),
    
    header: SC.LabelView.design({
      fillWidth: YES,
      layout: { width: 250, height: 18 },
      value: "Progress Bars",
      classNames: "header".w()
    }),

    normal: SC.FormView.row(SC.ProgressView.design({
      layout: { height: 20, width: 200 },
      value: 0.3
    })),

    disabled: SC.FormView.row(SC.ProgressView.design({
      layout: { height: 20, width: 200 },
      isEnabled: NO
    })),
    
    indeterminate: SC.FormView.row(SC.ProgressView.design({
      layout: { height: 20, width: 200 },
      isIndeterminate: YES,
      isRunning: YES
    }))
  })
});
