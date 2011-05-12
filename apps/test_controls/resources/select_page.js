// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/*globals TestControls Forms*/
TestControls.selectPage = SC.View.design({
  childViews: "form".w(),
  form: SC.FormView.design({
    classNames: ["sample_controls"],
    layout: { left: 20, top: 40, right: 20, bottom: 40 },
    childViews: "header normal strings disabled".w(),
    
    // Plain Views
    header: SC.LabelView.design({
      fillWidth: YES,
      layout: { width: 250, height: 18 },
      value: "Select View",
      classNames: "header".w()
    }),
    
    normal: SC.FormView.row(SC.SelectView.design({
      layout: { width: 150, height: 24 },
      items: [
        {"name": "Printer A", "value": "printer:a"},
        {"name": "Printer B", "value": "printer:b"},
        {"name": "Printer C", "value": "printer:c"},

        {"name": "Printer D", "value": "printer:d"},
        {"name": "Printer E", "value": "printer:e"},
        {"name": "Printer F", "value": "printer:f"},

        {"separator": YES, name: "none" },
        {"name": "MICR 1", "value": "printer:m1"},
        {"name": "MICR 2", "value": "printer:m2"},

        {"separator": YES, name: "Hi" },
        {"name": "This name is Really Really Long, OK?", "value": "LONG" }
      ],
      itemTitleKey: "name", itemValueKey: "value", itemSeparatorKey: "separator",
      value: 'printer:a',
      valueBinding: 'TestControls.buttonsController.selectedValue'
    })),

    strings: SC.FormView.row(SC.SelectView.design({
      layout: { width: 150, height: 24 },
      items: ["printer:a", "printer:b", "printer:c", "printer:d", "printer:e", "printer:f", "printer:m1", "printer:m2", "LONG"],
      value: 'printer:a',
      valueBinding: 'TestControls.buttonsController.selectedValue'
    })),

    disabled: SC.FormView.row(SC.SelectView.design({
      layout: { width: 150, height: 24 },
      
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
