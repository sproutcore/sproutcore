// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2010 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2010 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/*globals TestControls Forms*/
TestControls.buttonsPage = SC.View.design({
  childViews: "scroll".w(),
  scroll: SC.ScrollView.design({
    delaysContentTouches: NO,
    
    contentView: SC.FormView.design({
      labelWidth: 100,
      flowPadding: { left: 20, top: 30, bottom: 40, right: 20 },
      classNames: ["sample_controls"],
      childViews: "header style flags small normal huge jumbo space disclosureHeader disclosureClosed disclosureOpen".w(),
      header: SC.LabelView.design({
        flowSize: { widthPercentage: 1 },
        layout: {width: 200, height: 24 },
        
        classNames: "header".w(),
        value: "Buttons"
      }),
      
      style: SC.SegmentedView.design({
        layout: { width: 300, height: 30 },
        items: [
          {name: 'Normal', 'value': 'square'},
          {name: 'Point Left', value: 'point-left'},
          {name: 'Point Right', value: 'point-right'},
          {name: 'Capsule', value: 'capsule'}
        ],
        
        itemTitleKey: 'name',
        itemValueKey: 'value',
        
        valueBinding: 'TestControls.buttonsController.theme'
      }),
      
      flags: SC.FormView.row(SC.View.design(SC.FlowedLayout, {
        childViews: 'shouldToggle shouldDisable shouldBeDefault shouldBeCancel'.w(),
        
        isSpacer: YES,
        
        shouldToggle: SC.CheckboxView.design({
          layout: { width: 100, height: 24 },
          title: "Toggleable",
          valueBinding: 'TestControls.buttonsController.toggleable'
        }),

        shouldDisable: SC.CheckboxView.design({
          layout: { width: 100, height: 24 },
          title: "Disable",
          valueBinding: 'TestControls.buttonsController.disabled'
        }),

        shouldBeDefault: SC.CheckboxView.design({
          layout: { width: 100, height: 24 },
          title: "Default",
          valueBinding: 'TestControls.buttonsController.default'
        }),

        shouldBeCancel: SC.CheckboxView.design({
          layout: { width: 100, height: 24 },
          title: "Cancel",
          valueBinding: 'TestControls.buttonsController.cancel'
        })
      })),
      
      normal: SC.FormView.row(SC.ButtonView.design({
        controlSize: SC.REGULAR_CONTROL_SIZE,
        layout: { height: 24, width: 100 },
        title: "Click Me",
        
        themeNameBinding: 'TestControls.buttonsController.theme',
        buttonBehaviorBinding: 'TestControls.buttonsController.buttonBehavior',
        isEnabledBinding: SC.Binding.not('TestControls.buttonsController.disabled'),
        isDefaultBinding: 'TestControls.buttonsController.default',
        isCancelBinding: 'TestControls.buttonsController.cancel'
      })),

      small: SC.FormView.row(SC.ButtonView.design({
        controlSize: SC.SMALL_CONTROL_SIZE,
        layout: { height: 18, width: 100 },
        title: "Click Me",
        
        themeNameBinding: 'TestControls.buttonsController.theme',
        buttonBehaviorBinding: 'TestControls.buttonsController.buttonBehavior',
        isEnabledBinding: SC.Binding.not('TestControls.buttonsController.disabled'),
        isDefaultBinding: 'TestControls.buttonsController.default',
        isCancelBinding: 'TestControls.buttonsController.cancel'
      })),

      huge: SC.FormView.row(SC.ButtonView.design({
        controlSize: SC.HUGE_CONTROL_SIZE,
        layout: { height: 30, width: 100 },
        title: "Click Me",
        
        themeNameBinding: 'TestControls.buttonsController.theme',
        buttonBehaviorBinding: 'TestControls.buttonsController.buttonBehavior',
        isEnabledBinding: SC.Binding.not('TestControls.buttonsController.disabled'),
        isDefaultBinding: 'TestControls.buttonsController.default',
        isCancelBinding: 'TestControls.buttonsController.cancel'
      })),

      jumbo: SC.FormView.row(SC.ButtonView.design({
        controlSize: SC.JUMBO_CONTROL_SIZE,
        layout: { height: 44, width: 100 },
        title: "Click Me",
        
        themeNameBinding: 'TestControls.buttonsController.theme',
        buttonBehaviorBinding: 'TestControls.buttonsController.buttonBehavior',
        isEnabledBinding: SC.Binding.not('TestControls.buttonsController.disabled'),
        isDefaultBinding: 'TestControls.buttonsController.default',
        isCancelBinding: 'TestControls.buttonsController.cancel'
      })),
      
      space: SC.View.design({
        isSpacer: YES,
        fillWidth: YES
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