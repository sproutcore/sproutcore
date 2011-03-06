// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2010 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/*globals TestControls Forms*/
TestControls.panelsPage = SC.View.design({
  childViews: "form".w(),
  form: SC.FormView.design({
    classNames: ["sample_controls"],
    layout: { left: 20, top: 40, right: 20, bottom: 40 },

    childViews: "header normal".w(),

    header: SC.LabelView.design({
      layout: { width: 250, height: 18 },
      value: "Panels",
      classNames: "header".w()
    }),

    normal: SC.FormView.row(SC.ButtonView.design({
      layout: { height: 24, width: 100 },
      title: 'Alert',
      action: function() {
        SC.AlertPane.show("Hello, world");
      }
    }))

  })
});

