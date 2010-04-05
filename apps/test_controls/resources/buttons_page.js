/*globals TestControls Forms*/
TestControls.buttonsPage = SC.View.design({
  childViews: "form".w(),
  form: SC.FormView.design({
    classNames: ["sample_controls"],
    layout: { left: 20, top: 40, right: 20, bottom: 40 },
    childViews: "header small normal huge jumbo disabled space disclosureHeader disclosureClosed disclosureOpen".w(),
    header: SC.LabelView.design({
      layout: {width: 200, height: 24 },
      classNames: "header".w(),
      value: "Buttons"
    }),
    normal: SC.FormView.row(SC.ButtonView.design({
      layout: { height: 24, width: 100 },
      title: "Click Me",
      buttonBehavior: SC.TOGGLE_BEHAVIOR
    })),
    
    disabled: SC.FormView.row(SC.ButtonView.design({
      layout: { height: 24, width: 150 },
      isEnabled: NO,
      title: "Don't Click Me"
    })),
    
    small: SC.FormView.row(SC.ButtonView.design({
      layout: { height: 18, width: 100 },
      title: "Click Me",
      buttonBehavior: SC.TOGGLE_BEHAVIOR
    })),
    
    huge: SC.FormView.row(SC.ButtonView.design({
      layout: { height: 30, width: 100 },
      title: "Click Me",
      buttonBehavior: SC.TOGGLE_BEHAVIOR
    })),
    
    jumbo: SC.FormView.row(SC.ButtonView.design({
      layout: { height: 44, width: 100 },
      title: "Click Me",
      buttonBehavior: SC.TOGGLE_BEHAVIOR
    })),
    space: SC.View.design({
      flowSize: { widthPercentage: 1, height: 24 }
    }),
    disclosureHeader: SC.LabelView.design({
      layout: { width: 400, height: 24 },
      classNames: "header".w(),
      value: "Disclosure Buttons"
    }),
    disclosureClosed: SC.FormView.row(SC.DisclosureView.design({
      layout: { height: 24, width: 100 },
      title: "Disclosure Closed",
      value: NO
    })),
    disclosureOpen: SC.FormView.row(SC.DisclosureView.design({
      layout: { height: 24, width: 150 },
      title: "Disclosure Open",
      value: YES
    }))
  })
});