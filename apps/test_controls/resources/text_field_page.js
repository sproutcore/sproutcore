// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2010 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/*globals TestControls Forms*/
TestControls.textFieldPage = SC.View.design({
  childViews: "form".w(),
  form: SC.ScrollView.design({
    
    
    contentView: SC.FormView.design({
      theme: "iphone-form",
    
      classNames: ["sample_controls"],
      layout: { left: 20, top: 40, right: 20, bottom: 40 },
      childViews: "header normal autoResize textArea textAreaAutoResize disabled".w(),
    
      header: SC.LabelView.design({
        layout: { width: 200, height: 44 },
        classNames: "header".w(),
        value: "Text Fields",
        fillWidth: YES
      }),
    
      normal: SC.FormView.row(SC.TextFieldView.design({
        layout: { left: 0, width: 150, height: 44, centerY: 0},
        value: "Text",
        isSpacer: YES
      }), { classNames: ["first"] }),

      autoResize: SC.FormView.row(SC.TextFieldView.design(SC.AutoResize, {
        layout: { left: 0, width: 150, height: 44, centerY: 0 },
        value: "Hello, World!"
      })),

      textArea: SC.FormView.row(SC.TextFieldView.design({
        layout: { left: 0, width: 150, height: 144, centerY: 0 },
        value: "Hello, World!",
        isTextArea: YES,

        isSpacer: YES
      })),


      textAreaAutoResize: SC.FormView.row(SC.TextFieldView.design(SC.AutoResize, {
        layout: { left: 0, width: 150, height: 144, maxWidth: 200, centerY: 0 },
        value: "Hello, World!",
        isTextArea: YES,

        shouldResizeHeight: YES
      })),


      disabled: SC.FormView.row(SC.TextFieldView.design({
        layout: { left: 0, width: 150, height: 44, centerY: 0},
        isEnabled: NO,
        value: "Disabled",
        isSpacer: YES
      }))
    })
  })
});
