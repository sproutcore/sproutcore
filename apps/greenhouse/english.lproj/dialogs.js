// ==========================================================================
// Project:   Greenhouse - dialogs
// Copyright: ©2010 Mike Ball
// ==========================================================================
/*globals Greenhouse */

// This page has all the dialogs for greenhouse... 
Greenhouse.dialogPage = SC.Page.design({
  
  modal: SC.PanelPane.design({
    defaultResponder: 'Greenhouse'
  }),
  
  pageFile: SC.View.design({
    layout: {centerX: 0, centerY: 0, width: 350, height: 300},
    childViews: 'title cancel create fileNameLabel fileName filePathLabel filePath pageNameLabel pageName'.w(),
    
    title: SC.LabelView.design({
      layout: {top: 2, left: 15, right: 5, height: 22},
      value: "_New Page File".loc(),
      fontWeight: SC.BOLD_WEIGHT
    }),
    
    fileNameLabel: SC.LabelView.design({
      layout: {top: 25, left: 15, right: 5, height: 22},
      value: "_File Name:".loc()
    }),
    fileName: SC.TextFieldView.design({
      layout: {top: 50, left: 15, right: 15, height: 22},
      hint: "_main_page.js".loc(),
      valueBinding: 'Greenhouse.newFileName'
    }),
    
    filePathLabel: SC.LabelView.design({
      layout: {top: 95, left: 15, right: 5, height: 22},
      value: "_File Path:".loc()
    }),
    filePath: SC.TextFieldView.design({
      layout: {top: 115, left: 15, right: 15, height: 22},
      valueBinding: 'Greenhouse.newFilePath'
    }),
    
    pageNameLabel: SC.LabelView.design({
      layout: {top: 160, left: 15, right: 5, height: 22},
      value: "_Page Name:".loc()
    }),
    pageName: SC.TextFieldView.design({
      layout: {top: 180, left: 15, right: 15, height: 22},
      valueBinding: 'Greenhouse.newPageName',
      hint: "_MyApp.mainPage".loc()
      
    }),
    
    cancel: SC.ButtonView.design({
      layout: {bottom: 12, right: 103, width:84, height: 24},
      isCancel: YES,
      action: 'cancel',
      theme: 'capsule',
      title: "_Cancel".loc()
    }),
    create: SC.ButtonView.design({
      layout: {bottom: 12, right: 12, width:84, height: 24},
      isDefault: YES,
      action: 'create',
      theme: 'capsule',
      title: "_Create".loc()
    })
    
  }),
  
  propertyPicker: SC.PickerPane.design({
    layout: {width: 240, height: 290},
    defaultResponder: 'Greenhouse',
    modalPaneDidClick: function(evt) {
      var f = this.get("frame");
      if(!this.clickInside(f, evt)){ 
        Greenhouse.sendAction('cancel');
      }
      return YES ; 
    }
  }),
  
  propertyEditor: SC.View.design({
    // childViews: 'title keyLabel key valueLabel value update cancel'.w(),
    childViews: 'title keyLabel key valueLabel value updateButton cancelButton'.w(),
      
    title: SC.LabelView.design({
      layout: {top: 2, left: 15, right: 5, height: 22},
      value: "_Edit Property:".loc(),
      fontWeight: SC.BOLD_WEIGHT
    }),
    
    keyLabel: SC.LabelView.design({
      layout: {top: 25, left: 15, right: 5, height: 22},
      value: "_Key:".loc()
    }),
    key: SC.TextFieldView.design({
      layout: {top: 50, left: 15, right: 15, height: 22},
      valueBinding: 'Greenhouse.propertyEditorController.key'
    }),
    
    // typeLabel: SC.LabelView.design({
    //   layout: {top: 80, left: 15, right: 5, height: 22},
    //   value: "_Type:".loc()
    // }),
    // selectView: SC.SelectFieldView.design({
    //   layout: {top: 100, left: 15, right: 15, height: 22},
    //   valueBinding: 'Greenhouse.propertyEditorController.valueType',
    //   nameKey: 'name',
    //   valueKey: 'value',
    //   objects:[{name: "_String".loc(), value: SC.T_STRING}, {name: "_Array".loc(), value: SC.T_ARRAY},
    //             {name: "_Boolean".loc(), value: SC.T_BOOL}, {name: "_Number".loc(), value: SC.T_NUMBER},
    //             {name: "_Function".loc(), value: SC.T_FUNCTION}, {name: "_Hash".loc(), value: SC.T_HASH},
    //             {name: "_Object".loc(), value: SC.T_OBJECT}, {name: "_Class", value: SC.T_CLASS},
    //             {name: "_Undefined".loc(), value: SC.T_UNDEFINED}, {name: "_Null".loc(), value: SC.T_NULL}]
    // }),
    
    valueLabel: SC.LabelView.design({
      layout: {top: 80, left: 15, right: 5, height: 22},
      value: "_Value:".loc()
    }),
    value: SC.TextFieldView.design({
      layout: {top: 100, left: 15, right: 15, height: 100},
      valueBinding: 'Greenhouse.propertyEditorController.value',
      isTextArea: YES
    }),
    cancelButton: SC.ButtonView.design({
      layout: {bottom: 5, right: 105, width: 84, height: 24},
      isDefault: NO,
      action: 'cancel',
      theme: 'capsule',
      keyEquivalent: 'escape',
      title: "_Cancel".loc()
    }),
    updateButton: SC.ButtonView.design({
      layout: {bottom: 5, right: 15, width: 84, height: 24},
      isDefault: YES,
      action: 'update',
      theme: 'capsule',
      keyEquivalent: 'return',
      title: "_Update".loc()
    })
  }),
  
  // ..........................................................
  // add custom view panel
  // 
  customViewModal: SC.View.design({
    layout: {centerX: 0, centerY: 0, width: 350, height: 380},
    childViews: 'title cancel add classNameLabel className defaultPropertiesLabel defaultProperties targetLabel targetSelect designTypeLabel designType'.w(),
    
    title: SC.LabelView.design({
      layout: {top: 2, left: 15, right: 5, height: 22},
      value: "_Add a Custom Designer to the Library".loc(),
      fontWeight: SC.BOLD_WEIGHT
    }),
    targetLabel: SC.LabelView.design({
      layout: {top: 25, left: 15, right: 5, height: 22},
      value: "_Target:".loc()
    }),
    
    targetSelect: SC.SelectButtonView.design({
      layout: {top: 48, left: 15, right: 15, height: 22},
      objectsBinding: 'Greenhouse.viewConfigsController.editable',
      valueBinding: 'Greenhouse.newDesignViewConfig',
      nameKey: 'name'
    }),
    
    designTypeLabel: SC.LabelView.design({
      layout: {top: 80, left: 15, right: 5, height: 22},
      value: "_Design Type:".loc()
    }),
    
    designType: SC.SelectButtonView.design({
      layout: {top:103, left: 15, right: 15, height: 22},
      objects: [{name: 'Controller', value: 'controllers'}, {name: 'View', value: 'views'}, {name: 'Pane', value: 'panes'}],
      valueBinding: 'Greenhouse.newDesignType',
      nameKey: 'name',
      valueKey: 'value'
    }),
    
    classNameLabel: SC.LabelView.design({
      layout: {top: 130, left: 15, right: 5, height: 22},
      value: "_Class Name:".loc()
    }),
    className: SC.TextFieldView.design({
      layout: {top: 153, left: 15, right: 15, height: 22},
      hint: "_MyApp.AwesomeView".loc(),
      valueBinding: 'Greenhouse.newDesignClass'
    }),
    
    defaultPropertiesLabel: SC.LabelView.design({
      layout: {top: 176, left: 15, right: 5, height: 22},
      value: "_Default Properties:".loc()
    }),
    defaultProperties: SC.TextFieldView.design({
      layout: {top: 199, left: 15, right: 15, height: 135},
      isTextArea: YES,
      valueBinding: 'Greenhouse.newDesignDefaults'
    }),
    
    cancel: SC.ButtonView.design({
      layout: {bottom: 12, right: 103, width:84, height: 24},
      isCancel: YES,
      action: 'cancel',
      theme: 'capsule',
      title: "_Cancel".loc()
    }),
    add: SC.ButtonView.design({
      layout: {bottom: 12, right: 12, width:84, height: 24},
      isDefault: YES,
      action: 'add',
      theme: 'capsule',
      title: "_Add".loc()
    })
  }),
  
  // ..........................................................
  // add item to page
  // 
  newItemForPage: SC.View.design({
    layout: {centerX: 0, centerY: 0, width: 200, height: 120},
    childViews: 'title name cancel add '.w(),
    title: SC.LabelView.design({
      layout: {top: 2, left: 15, right: 5, height: 22},
      value: "_Item Name".loc(),
      fontWeight: SC.BOLD_WEIGHT
    }),
    
    name: SC.TextFieldView.design({
      layout: {top: 45, left: 15, right: 15, height: 22},
      hint: "_somethingCool".loc(),
      valueBinding: 'Greenhouse.newPageItemName'
    }),

    cancel: SC.ButtonView.design({
      layout: {bottom: 12, right: 103, width:84, height: 24},
      isCancel: YES,
      action: 'cancel',
      theme: 'capsule',
      title: "_Cancel".loc()
    }),
    
    add: SC.ButtonView.design({
      layout: {bottom: 12, right: 12, width:84, height: 24},
      isDefault: YES,
      action: 'add',
      theme: 'capsule',
      title: "_Add".loc()
    })
  }),
  
  // ..........................................................
  // create new binding
  // 
  //can't have the last word be binding :)
  createBindingView: SC.View.design({
    layout: {centerX: 0, centerY: 0, width: 200, height: 180},
    childViews: 'title from fromText to toText cancel add '.w(),
    title: SC.LabelView.design({
      layout: {top: 2, left: 15, right: 5, height: 22},
      value: "_Specifiy Keys".loc(),
      fontWeight: SC.BOLD_WEIGHT
    }),
    
    fromText: SC.LabelView.design({
      layout: {left: 15, top: 30, right: 5, height: 22},
      value: "_From".loc()
    }),
    
    from: SC.TextFieldView.design({
      layout: {top: 48, left: 15, right: 15, height: 22},
      valueBinding: 'Greenhouse.newBindingFromKey'
    }),
    
    toText: SC.LabelView.design({
      layout: {left: 15, top: 78, right: 5, height: 22},
      value: "_To".loc()
    }),
    
    to: SC.TextFieldView.design({
      layout: {top: 96, left: 15, right: 15, height: 22},
      valueBinding: 'Greenhouse.newBindingToKey'
    }),

    cancel: SC.ButtonView.design({
      layout: {bottom: 12, right: 103, width:84, height: 24},
      isCancel: YES,
      action: 'cancel',
      theme: 'capsule',
      title: "_Cancel".loc()
    }),
    
    add: SC.ButtonView.design({
      layout: {bottom: 12, right: 12, width:84, height: 24},
      isDefault: YES,
      action: 'create',
      theme: 'capsule',
      title: "_Add".loc()
    })
  })
  
});
