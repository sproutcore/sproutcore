// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/*globals TestControls Forms*/
TestControls.panelsPage = SC.View.design({
  childViews: "form".w(),
  form: SC.FormView.design({
    classNames: ["sample_controls"],
    layout: { left: 20, top: 40, right: 20, bottom: 40 },

    childViews: 'header buttonCount alertType show'.w(),

    header: SC.LabelView.design({
      layout: { width: 250, height: 18 },
      value: "Alerts",
      classNames: "header".w()
    }),

    buttonCount: SC.FormView.row(SC.RadioView.design({
      layout: { height: 24 * 3, width: 200 },
      items: [
        { 'title': 'One Button', 'value': 1 },
        { 'title': 'Two Buttons', 'value': 2 },
        { 'title': 'Three Buttons', 'value': 3 }
      ],

      itemTitleKey: 'title',
      itemValueKey: 'value',

      valueBinding: 'TestControls.alertController.buttonCount'
    })),

    alertType: SC.FormView.row(SC.SelectView.design({
      layout: { height: 24, width: 200 },
      items: [
        { title: 'Error', value: 'error' },
        { title: 'Info', value: 'info' },
        { title: 'Plain', value: 'plain' },
        { title: 'Show', value: 'show' },
        { title: 'Warn', value: 'warn' }
      ],

      itemTitleKey: 'title',
      itemValueKey: 'value',

      valueBinding: 'TestControls.alertController.alertType'
    })),

    show: SC.ButtonView.design({
      layout: { height: 24, width: 100 },
      title: 'Alert',
      target: TestControls.alertController,
      action: 'showAlert'
    })

  })
});

