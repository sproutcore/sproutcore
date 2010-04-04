/*globals TestControls Forms*/
TestControls.radioPage = SC.View.design({
  childViews: "form".w(),
  form: Forms.FormView.design({
    classNames: ["sample_controls"],
    layout: { left: 20, top: 40, right: 20, bottom: 40 },
    fields: "header normal disabled multiple".w(),
    header: Forms.FormView.row(SC.LabelView, {
      autoResize: YES,
      classNames: "header".w(),
      value: "Radio Views",
      fieldLabel: NO
    }),
    normal: Forms.FormView.row(SC.RadioView, {
      layout: { left: 0, width: 150, height: 24, centerY: 0},
      items: [ { title: "One", value: "one" },{ title: "Two", value: "two" },{ title: "Three", value: "three" } ],
      itemTitleKey: "title", itemValueKey: "value",
      value: null
    }),
    disabled: Forms.FormView.row(SC.RadioView, {
      layout: { left: 0, width: 150, height: 24, centerY: 0},
      isEnabled: NO,
      items: [ { title: "One", value: "one" },{ title: "Two", value: "two" },{ title: "Three", value: "three" } ],
      itemTitleKey: "title", itemValueKey: "value",
      value: "one"
    }),
    multiple: Forms.FormView.row(SC.RadioView, {
      layout: { left: 0, width: 150, height: 24, centerY: 0},
      items: [ { title: "One", value: "one" },{ title: "Two", value: "two" },{ title: "Three", value: "three" } ],
      itemTitleKey: "title", itemValueKey: "value",
      value: ["one", "three"]
    })
  })
});