/*globals TestControls Forms*/
TestControls.progressPage = SC.View.design({
  childViews: "form".w(),
  form: Forms.FormView.design({
    classNames: ["sample_controls"],
    layout: { left: 20, top: 40, right: 20, bottom: 40 },
    fields: "header normal disabled".w(),
    header: Forms.FormView.row(SC.LabelView, {
      autoResize: YES,
      classNames: "header".w(),
      value: "Progress Bars",
      fieldLabel: NO
    }),
    normal: Forms.FormView.row(SC.ProgressView, {
      layout: { height: 20, centerY: 0, left: 0, width: 200 },
      value: 0.25
    }),
    disabled: Forms.FormView.row(SC.ProgressView, {
      layout: { height: 20, centerY: 0, left: 0, width: 200 },
      isEnabled: NO
    })
  })
});