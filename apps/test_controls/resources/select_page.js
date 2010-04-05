/*globals TestControls Forms*/
TestControls.selectPage = SC.View.design({
  childViews: "form".w(),
  form: SC.FormView.design({
    classNames: ["sample_controls"],
    layout: { left: 20, top: 40, right: 20, bottom: 40 },
    childViews: "header normal disabled".w(),
    header: SC.LabelView.design({
      classNames: "header".w(),
      value: "Select Views"
    }),
    normal: SC.FormView.row(SC.SelectView.design({
      controlSize: SC.REGULAR_CONTROL_SIZE,
      items: [
        {"name": "Printer A", "value": "printer:a"},
        {"name": "Printer B", "value": "printer:b"},
        {"name": "Printer C", "value": "printer:c"},
        {"separator": YES, name: "none" },
        {"name": "Printer D", "value": "printer:d"},
        {"name": "Printer E", "value": "printer:e"},
        {"name": "Printer F", "value": "printer:f"},
        {"name": "MICR 1", "value": "printer:m1"},
        {"name": "MICR 2", "value": "printer:m2"}
      ],
      itemTitleKey: "name", itemValueKey: "value", itemSeparatorKey: "separator",
      value: null
    })),
    disabled: SC.FormView.row(SC.SelectView.design({
      controlSize: SC.REGULAR_CONTROL_SIZE,
      isEnabled: NO,
      
      items: [
        {"name": "Printer A", "value": "printer:a"},
        {"name": "Printer B", "value": "printer:b"},
        {"name": "Printer C", "value": "printer:c"},
        {"separator": YES, name: "none" },
        {"name": "Printer D", "value": "printer:d"},
        {"name": "Printer E", "value": "printer:e"},
        {"name": "Printer F", "value": "printer:f"},
        {"name": "MICR 1", "value": "printer:m1"},
        {"name": "MICR 2", "value": "printer:m2"}
      ],
      itemTitleKey: "name", itemValueKey: "value", itemSeparatorKey: "separator",
      value: null
    }))
  })
});