// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2010 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/*globals TestControls Forms*/
TestControls.progressPage = SC.View.design({
  childViews: "form".w(),
  form: SC.FormView.design({
    classNames: ["sample_controls"],
    layout: { left: 20, top: 40, right: 20, bottom: 40 },
    
    childViews: "header normal disabled".w(),
    
    // Plain Views
    header: SC.LabelView.design({
      layout: { width: 250, height: 18 },
      value: "Progress Bars",
      classNames: "header".w()
    }),
    
    // RAW
    normal: SC.FormRowView.design({
      // rowDelegate: automatically calculated because parent.isRowDelegate
      label: "Normal", // Also, FormView can set this automatically by going over childViews.
      
      childViews: "progress".w(), // this is what makes this rather tedious...
      progress: SC.ProgressView.design({
        layout: { height: 20, width: 200 },
        value: 0.25
      })
    }),
    
    // Helper
    disabled: SC.FormView.row(SC.ProgressView.design({
      layout: { height: 20, width: 200 },
      isEnabled: NO      
    }))
  })
});