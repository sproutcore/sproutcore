/*globals TestControls Forms*/
TestControls.checkboxesPage = SC.View.design({
  childViews: "form".w(),
  form: Forms.FormView.design({
    classNames: ["sample_controls"],
    layout: { left: 20, top: 40, right: 20, bottom: 40 },
    fields: "header small normal disabled multiple".w(),
    header: Forms.FormView.row(SC.LabelView, {
      autoResize: YES,
      classNames: "header".w(),
      value: "Checkboxes",
      fieldLabel: NO
    }),
    small: Forms.FormView.row(SC.CheckboxView, {
      layout: { left: 0, width: 150, height: 24, centerY: 0},
      title: "Check Me",
      controlSize: SC.SMALL_CONTROL_SIZE
    }),
    normal: Forms.FormView.row(SC.CheckboxView, {
      layout: { left: 0, width: 150, height: 24, centerY: 0},
      title: "Check Me"
    }),
    disabled: Forms.FormView.row(SC.CheckboxView, {
      layout: { left: 0, width: 150, height: 24, centerY: 0},
      isEnabled: NO,
      title: "Don't Check Me"
    }),
    multiple: Forms.FormView.row(SC.CheckboxView, {
      layout: { left: 0, width: 150, height: 24, centerY: 0},
      value: [YES, NO],
      title: "Multiple?"
    })
  })
});