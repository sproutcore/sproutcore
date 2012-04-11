// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/*globals TestControls Forms*/
TestControls.slidersPage = SC.View.design({
  childViews: "form".w(),
  form: SC.FormView.design({
    classNames: ["sample_controls"],
    layout: { left: 20, top: 40, right: 20, bottom: 40 },
    childViews: "header small normal jumbo disabled colorPicker".w(),
    // Plain Views
    header: SC.LabelView.design({
      fillWidth: YES,
      layout: { width: 250, height: 18 },
      value: "Sliders",
      classNames: "header".w()
    }),

    color: SC.Color.from('steelblue'),
    
    small: SC.FormView.row(SC.SliderView.design({
      layout: { width: 150, height: 14 },
      controlSize: SC.SMALL_CONTROL_SIZE,
      minimum: 0,
      maximum: 255,
      value: SC.outlet('.parentView.parentView.color.r'),
      valueBinding: '.parentView.parentView.color.r'
    })),
    
    normal: SC.FormView.row(SC.SliderView.design({
      layout: { width: 150, height: 16 },
      minimum: 0,
      maximum: 255,
      value: SC.outlet('.parentView.parentView.color.g'),
      valueBinding: '.parentView.parentView.color.g'
    })),
    
    jumbo: SC.FormView.row(SC.SliderView.design({
      controlSize: SC.JUMBO_CONTROL_SIZE,
      layout: { width: 150, height: 22 },
      minimum: 0,
      maximum: 255,
      value: SC.outlet('.parentView.parentView.color.b'),
      valueBinding: '.parentView.parentView.color.b'
    })),

    disabled: SC.FormView.row(SC.SliderView.design({
      layout: { width: 150, height: 16},
      isEnabled: NO,
      minimum: 0,
      maximum: 10,
      value: 0
    })),

    colorPicker: SC.FormView.row(SC.View.design({
      childViews: ['css', 'block'],
      cssText: SC.outlet('.parentView.parentView.color.cssText'),
      cssTextBinding: '.parentView.parentView.color.cssText',
      layout: { width: 150, height: 50 },
      block: SC.View.design({
        backgroundColorBinding: SC.Binding.oneWay('.parentView.cssText'),
        layout: { width: 50, height: 50 }
      }),
      css: SC.LabelView.design({
        isTextSelectable: YES,
        valueBinding: SC.Binding.oneWay('.parentView.cssText'),
        layout: { left: 75 }
      })
    }))
  })
});