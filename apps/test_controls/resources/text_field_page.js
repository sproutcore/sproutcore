/*globals TestControls Forms*/
TestControls.textFieldPage = SC.View.design({
  childViews: "form".w(),
  form: SC.FormView.design({
    classNames: ["sample_controls"],
    layout: { left: 20, top: 40, right: 20, bottom: 40 },
    childViews: "header normal disabled".w(),
    
    header: SC.LabelView.design({
      classNames: "header".w(),
      value: "Text Fields"
    }),
    
    normal: SC.FormView.row(SC.TextFieldView.design({
      layout: { left: 0, width: 150, height: 24, centerY: 0},
      value: "Text"
    })),
    
    disabled: SC.FormView.row(SC.TextFieldView.design({
      layout: { left: 0, width: 150, height: 24, centerY: 0},
      isEnabled: NO,
      value: "Disabled"
    }))
  })
});