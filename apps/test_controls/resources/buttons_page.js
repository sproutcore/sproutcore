/*globals TestControls Forms*/
TestControls.buttonsPage = SC.View.design({
  childViews: "form".w(),
  form: Forms.FormView.design({
    classNames: ["sample_controls"],
    layout: { left: 20, top: 40, right: 20, bottom: 40 },
    fields: "header small normal huge jumbo disabled disclosureHeader disclosureClosed disclosureOpen".w(),
    header: Forms.FormView.row(SC.LabelView, {
      autoResize: YES,
      classNames: "header".w(),
      value: "Buttons",
      fieldLabel: NO
    }),
    normal: Forms.FormView.row(SC.ButtonView, {
      layout: { height: 24, centerY: 0, left: 0, width: 100 },
      title: "Click Me",
      buttonBehavior: SC.TOGGLE_BEHAVIOR
    }),
    disabled: Forms.FormView.row(SC.ButtonView, {
      layout: { height: 24, centerY: 0, left: 0, width: 150 },
      isEnabled: NO,
      title: "Don't Click Me"
    }),
    
    small: Forms.FormView.row(SC.ButtonView, {
      layout: { height: 18, centerY: 0, left: 0, width: 100 },
      title: "Click Me",
      buttonBehavior: SC.TOGGLE_BEHAVIOR
    }),
    
    huge: Forms.FormView.row(SC.ButtonView, {
      layout: { height: 30, centerY: 0, left: 0, width: 100 },
      title: "Click Me",
      buttonBehavior: SC.TOGGLE_BEHAVIOR
    }),
    
    jumbo: Forms.FormView.row(SC.ButtonView, {
      layout: { height: 44, centerY: 0, left: 0, width: 100 },
      title: "Click Me",
      buttonBehavior: SC.TOGGLE_BEHAVIOR
    }),

    disclosureHeader: Forms.FormView.row(SC.LabelView, {
      layout: { width: 400 },
      autoResize: YES,
      classNames: "header".w(),
      value: "Disclosure Buttons",
      fieldLabel: NO
    }),
    disclosureClosed: Forms.FormView.row(SC.DisclosureView, {
      layout: { height: 24, centerY: 0, left: 0, width: 100 },
      title: "Disclosure Closed",
      value: NO
    }),
    disclosureOpen: Forms.FormView.row(SC.DisclosureView, {
      layout: { height: 24, centerY: 0, left: 0, width: 150 },
      title: "Disclosure Open",
      value: YES
    })
  })
});