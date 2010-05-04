/*globals TestControls Forms*/
TestControls.buttonsPage = SC.View.design({
  childViews: "scroll".w(),
  scroll: SC.ScrollView.design({
    delaysContentTouches: NO,
    
    contentView: SC.FormView.design({
      labelWidth: 100,
      flowPadding: { left: 20, top: 10, bottom: 40, right: 20 },
      classNames: ["sample_controls"],
      childViews: "header small normal huge jumbo smallToggle normalToggle hugeToggle jumboToggle disabledSmall disabledNormal disabledHuge disabledJumbo space disclosureHeader disclosureClosed disclosureOpen".w(),
      header: SC.LabelView.design({
        layout: {width: 200, height: 24 },
        classNames: "header".w(),
        value: "Buttons"
      }),
      normal: SC.FormView.row(SC.ButtonView.design({
        controlSize: SC.AUTO_CONTROL_SIZE,
        layout: { height: 24, width: 100 },
        title: "Click Me"
      })),

      small: SC.FormView.row(SC.ButtonView.design({
        controlSize: SC.AUTO_CONTROL_SIZE,
        layout: { height: 18, width: 100 },
        title: "Click Me"
      })),

      huge: SC.FormView.row(SC.ButtonView.design({
        controlSize: SC.AUTO_CONTROL_SIZE,
        layout: { height: 30, width: 100 },
        title: "Click Me"
      })),

      jumbo: SC.FormView.row(SC.ButtonView.design({
        controlSize: SC.AUTO_CONTROL_SIZE,
        layout: { height: 44, width: 100 },
        title: "Click Me"
      })),
      
      normalToggle: SC.FormView.row(SC.ButtonView.design({
        controlSize: SC.AUTO_CONTROL_SIZE,
        layout: { height: 24, width: 100 },
        title: "Click Me",
        buttonBehavior: SC.TOGGLE_BEHAVIOR
      })),

      smallToggle: SC.FormView.row(SC.ButtonView.design({
        controlSize: SC.AUTO_CONTROL_SIZE,
        layout: { height: 18, width: 100 },
        title: "Click Me",
        buttonBehavior: SC.TOGGLE_BEHAVIOR
      })),

      hugeToggle: SC.FormView.row(SC.ButtonView.design({
        controlSize: SC.AUTO_CONTROL_SIZE,
        layout: { height: 30, width: 100 },
        title: "Click Me",
        buttonBehavior: SC.TOGGLE_BEHAVIOR
      })),

      jumboToggle: SC.FormView.row(SC.ButtonView.design({
        controlSize: SC.AUTO_CONTROL_SIZE,
        layout: { height: 44, width: 100 },
        title: "Click Me",
        buttonBehavior: SC.TOGGLE_BEHAVIOR
      })),
      
      disabledSmall: SC.FormView.row(SC.ButtonView.design({
        controlSize: SC.AUTO_CONTROL_SIZE,
        layout: { height: 18, width: 150 },
        isEnabled: NO,
        title: "Don't Click Me"
      })),
      
      disabledNormal: SC.FormView.row(SC.ButtonView.design({
        controlSize: SC.AUTO_CONTROL_SIZE,
        layout: { height: 24, width: 150 },
        isEnabled: NO,
        title: "Don't Click Me"
      })),
      
      disabledHuge: SC.FormView.row(SC.ButtonView.design({
        controlSize: SC.AUTO_CONTROL_SIZE,
        layout: { height: 30, width: 150 },
        isEnabled: NO,
        title: "Don't Click Me"
      })),
      
      disabledJumbo: SC.FormView.row(SC.ButtonView.design({
        controlSize: SC.AUTO_CONTROL_SIZE,
        layout: { height: 44, width: 150 },
        isEnabled: NO,
        title: "Don't Click Me"
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
  })
});