/*globals TestControls Forms*/
TestControls.textFieldPage = SC.View.design({
  childViews: "form".w(),
  form: Forms.FormView.design({
    classNames: ["sample_controls"],
    layout: { left: 20, top: 40, right: 20, bottom: 40 },
    fields: "header normal disabled".w(),
    header: Forms.FormView.row(SC.LabelView, {
      autoResize: YES,
      classNames: "header".w(),
      value: "Text Fields",
      fieldLabel: NO
    }),
    normal: Forms.FormView.row(SC.TextFieldView, {
      layout: { left: 0, width: 150, height: 24, centerY: 0},
      value: "Text"
    }),
    disabled: Forms.FormView.row(SC.TextFieldView, {
      layout: { left: 0, width: 150, height: 24, centerY: 0},
      isEnabled: NO,
      value: "Disabled"
    })
  })
});