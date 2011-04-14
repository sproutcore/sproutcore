// ==========================================================================
// Project:   Greenhouse - inspectorsPage
// Copyright: ©2010 Mike Ball
// ==========================================================================
/*globals Greenhouse */
sc_require('views/anchor');
sc_require('views/plist_item');
//This page contains all the inspectors
Greenhouse.inspectorsPage = SC.Page.design({
  
  propertiesInspector: SC.View.design({
    layout: {left: 5, right: 5, top: 0, bottom: 0},
    childViews: 'viewClass list addProperty deleteProperty'.w(),
    
    viewClass: SC.LabelView.design({
      classNames: ['title'],
      layout: {top: 5, left: 5, right: 5, height: 22},
      textAlign: SC.ALIGN_CENTER,
      isEditable: YES,
      valueBinding: 'Greenhouse.designController.viewClass'
    }),
    
    list: SC.ScrollView.design({
      layout: {top: 34, left:0, right: 0, bottom: 30},
      hasHorizontalScroller: NO,
      contentView: SC.ListView.design({
        rowHeight: 44,
        isEditable: NO,
        canEditContent: NO,
        exampleView: Greenhouse.PlistItemView,
        action: 'editProperty',
        contentValueKey: 'key',
        contentBinding: 'Greenhouse.designController.editableProperties',
        selectionBinding: 'Greenhouse.designController.propertySelection'
      })
    }),
    
    addProperty: SC.ButtonView.design({
      classNames:['prop-control', 'dark'],
      layout: { bottom: 0, right: 0, height: 24, width: 35 },
      titleMinWidth: 0,
      hasIcon: NO,
      title: "+",
      action: 'addProperty',
      isEnabledBinding: 'Greenhouse.designController.content'
    }),
    deleteProperty: SC.ButtonView.design({
      classNames:['prop-control', 'dark'],
      layout: { bottom: 0, right: 36, height: 24, width: 35 },
      titleMinWidth: 0,
      hasIcon: NO,
      title: "-",
      action: 'deleteProperty',
      isEnabledBinding: 'Greenhouse.propertyController.content'
    })
  }),
  
  layoutInspector: SC.View.design({

    layout: { top: 18, left: 10, bottom: 10, right: 10 },
    childViews: 'anchorLabel anchorView dimLabel hDimView vDimView'.w(),

    anchorLabel: SC.LabelView.design({
      layout: { top: 0, left: 0, width: 60, height: 18 },
      value: "_Anchor:".loc()
    }),

    anchorView: Greenhouse.AnchorView.design({
      layout: { top: 0, left: 60, right: 10, height: 120 },
      anchorLocationBinding: 'Greenhouse.layoutController.anchorLocation'
    }),
    
    dimLabel: SC.LabelView.design({ 
      layout: { top: 134, left: 0, width: 80, height: 18 },
      value: "_Dimensions:".loc()
    }),
    
    hDimView: SC.ContainerView.design({
      layout: { top: 130, left: 82, right: 10, height: 60 },
      nowShowingBinding: "Greenhouse.layoutController.hDimNowShowing"
    }),
    
    vDimView: SC.ContainerView.design({
      layout: { top: 188, left: 82, right: 10, height: 60 },
      nowShowingBinding: "Greenhouse.layoutController.vDimNowShowing"
    })
    
    
  }),
  
  // ..........................................................
  // LEFT-ALIGNED FIELDS
  // 
  
  leftDimensions: SC.View.design({
    layout: { top: 0, left: 0, right: 0, bottom: 0 },
    childViews: "leftLabel leftField widthLabel widthField".w(),
    
    leftLabel: SC.LabelView.design({
      layout: { top: 6, left: 0, width: 60, height: 18 },
      value: "_Left:".loc()
    }),
    
    leftField: SC.TextFieldView.design({
      layout: { top: 4, left: 50, right: 4, height: 21 },
      validator: SC.Validator.Number,
      valueBinding: "Greenhouse.layoutController.layoutLeft"
    }),
    
    widthLabel: SC.LabelView.design({
      layout: { top: 32, left: 0, width: 60, height: 18 },
      value: "_Width:".loc()
    }),
    
    widthField: SC.TextFieldView.design({
      layout: { top: 30, left: 50, right: 4, height: 21 },
      validator: SC.Validator.Number,
      valueBinding: "Greenhouse.layoutController.layoutWidth"
    })    
  }),

  // ..........................................................
  // RIGHT-ALIGNED FIELDS
  // 
  
  rightDimensions: SC.View.design({
    layout: { top: 0, left: 0, right: 0, bottom: 0 },
    childViews: "rightLabel rightField widthLabel widthField".w(),
    
    rightLabel: SC.LabelView.design({
      layout: { top: 6, left: 0, width: 60, height: 18 },
      value: "_Right:".loc()
    }),
    
    rightField: SC.TextFieldView.design({
      layout: { top: 4, left: 50, right: 4, height: 21 },
      validator: SC.Validator.Number,
      valueBinding: "Greenhouse.layoutController.layoutRight"
    }),
    
    widthLabel: SC.LabelView.design({
      layout: { top: 32, left: 0, width: 60, height: 18 },
      value: "_Width:".loc()
    }),
    
    widthField: SC.TextFieldView.design({
      layout: { top: 30, left: 50, right: 4, height: 21 },
      validator: SC.Validator.Number,
      valueBinding: "Greenhouse.layoutController.layoutWidth"
    })    
  }),

  // ..........................................................
  // CENTERX-ALIGNED FIELDS
  // 
  
  centerXDimensions: SC.View.design({
    layout: { top: 0, left: 0, right: 0, bottom: 0 },
    childViews: "centerLabel centerField widthLabel widthField".w(),
    
    centerLabel: SC.LabelView.design({
      layout: { top: 6, left: 0, width: 60, height: 18 },
      value: "_Center X:".loc()
    }),
    
    centerField: SC.TextFieldView.design({
      layout: { top: 4, left: 50, right: 4, height: 21 },
      validator: SC.Validator.Number,
      valueBinding: "Greenhouse.layoutController.layoutCenterX"
    }),
    
    widthLabel: SC.LabelView.design({
      layout: { top: 32, left: 0, width: 60, height: 18 },
      value: "_Width:".loc()
    }),
    
    widthField: SC.TextFieldView.design({
      layout: { top: 30, left: 50, right: 4, height: 21 },
      validator: SC.Validator.Number,
      valueBinding: "Greenhouse.layoutController.layoutWidth"
    })    
  }),

  // ..........................................................
  // WIDTH-ALIGNED FIELDS
  // 
  
  widthDimensions: SC.View.design({
    layout: { top: 0, left: 0, right: 0, bottom: 0 },
    childViews: "leftLabel leftField rightLabel rightField".w(),
    
    leftLabel: SC.LabelView.design({
      layout: { top: 6, left: 0, width: 60, height: 18 },
      value: "_Left:".loc()
    }),
    
    leftField: SC.TextFieldView.design({
      layout: { top: 4, left: 50, right: 4, height: 21 },
      validator: SC.Validator.Number,
      valueBinding: "Greenhouse.layoutController.layoutLeft"
    }),
    
    rightLabel: SC.LabelView.design({
      layout: { top: 32, left: 0, width: 60, height: 18 },
      value: "_Right:".loc()
    }),
    
    rightField: SC.TextFieldView.design({
      layout: { top: 30, left: 50, right: 4, height: 21 },
      validator: SC.Validator.Number,
      valueBinding: "Greenhouse.layoutController.layoutRight"
    })    
  }),
  
  
  // ..........................................................
  // TOP-ALIGNED FIELDS
  // 
  
  topDimensions: SC.View.design({
    layout: { top: 0, left: 0, right: 0, bottom: 0 },
    childViews: "topLabel topField heightLabel heightField".w(),
    
    topLabel: SC.LabelView.design({
      layout: { top: 6, left: 0, width: 60, height: 18 },
      value: "_Top:".loc()
    }),
    
    topField: SC.TextFieldView.design({
      layout: { top: 4, left: 50, right: 4, height: 21 },
      validator: SC.Validator.Number,
      valueBinding: "Greenhouse.layoutController.layoutTop"
    }),
    
    heightLabel: SC.LabelView.design({
      layout: { top: 32, left: 0, width: 60, height: 18 },
      value: "_Height:".loc()
    }),
    
    heightField: SC.TextFieldView.design({
      layout: { top: 30, left: 50, right: 4, height: 21 },
      validator: SC.Validator.Number,
      valueBinding: "Greenhouse.layoutController.layoutHeight"
    })    
  }),

  // ..........................................................
  // BOTTOM-ALIGNED FIELDS
  // 
  
  bottomDimensions: SC.View.design({
    layout: { top: 0, left: 0, right: 0, bottom: 0 },
    childViews: "bottomLabel bottomField heightLabel heightField".w(),
    
    bottomLabel: SC.LabelView.design({
      layout: { top: 6, left: 0, width: 60, height: 18 },
      value: "_Bottom:".loc()
    }),
    
    bottomField: SC.TextFieldView.design({
      layout: { top: 4, left: 50, right: 4, height: 21 },
      validator: SC.Validator.Number,
      valueBinding: "Greenhouse.layoutController.layoutBottom"
    }),
    
    heightLabel: SC.LabelView.design({
      layout: { top: 32, left: 0, width: 60, height: 18 },
      value: "_Height:".loc()
    }),
    
    heightField: SC.TextFieldView.design({
      layout: { top: 30, left: 50, right: 4, height: 21 },
      validator: SC.Validator.Number,
      valueBinding: "Greenhouse.layoutController.layoutHeight"
    })    
  }),

  // ..........................................................
  // CENTER-Y-ALIGNED FIELDS
  // 
  
  centerYDimensions: SC.View.design({
    layout: { top: 0, left: 0, right: 0, bottom: 0 },
    childViews: "centerYLabel centerYField heightLabel heightField".w(),
    
    centerYLabel: SC.LabelView.design({
      layout: { top: 6, left: 0, width: 60, height: 18 },
      value: "_Center Y:".loc()
    }),
    
    centerYField: SC.TextFieldView.design({
      layout: { top: 4, left: 50, right: 4, height: 21 },
      validator: SC.Validator.Number,
      valueBinding: "Greenhouse.layoutController.layoutCenterY"
    }),
    
    heightLabel: SC.LabelView.design({
      layout: { top: 32, left: 0, width: 60, height: 18 },
      value: "_Height:".loc()
    }),
    
    heightField: SC.TextFieldView.design({
      layout: { top: 30, left: 50, right: 4, height: 21 },
      validator: SC.Validator.Number,
      valueBinding: "Greenhouse.layoutController.layoutHeight"
    })    
  }),

  // ..........................................................
  // Height-ALIGNED FIELDS
  // 
  
  heightDimensions: SC.View.design({
    layout: { top: 0, left: 0, right: 0, bottom: 0 },
    childViews: "topLabel topField bottomLabel bottomField".w(),
    
    topLabel: SC.LabelView.design({
      layout: { top: 6, left: 0, width: 60, height: 18 },
      value: "_Top:".loc()
    }),
    
    topField: SC.TextFieldView.design({
      layout: { top: 4, left: 50, right: 4, height: 21 },
      validator: SC.Validator.Number,
      valueBinding: "Greenhouse.layoutController.layoutTop"
    }),
    
    bottomLabel: SC.LabelView.design({
      layout: { top: 32, left: 0, width: 60, height: 18 },
      value: "_Bottom:".loc()
    }),
    
    bottomField: SC.TextFieldView.design({
      layout: { top: 30, left: 50, right: 4, height: 21 },
      validator: SC.Validator.Number,
      valueBinding: "Greenhouse.layoutController.layoutBottom"
    })    
  }),
  
  // ..........................................................
  // EXTRAS
  // 
  
  noDimensions: SC.View.design({
    layout: { top: 0, left: 0, right: 0, bottom: 0 },
    
    childViews: "labelView".w(),
    labelView: SC.LabelView.design({
      layout: { left: 0, right: 0, height: 18, centerY: 0 },
      textAlign: SC.ALIGN_CENTER,
      value: "_No Dimensions".loc()
    })
  }),
  
  noDimensions2: SC.View.design({
    layout: { top: 0, left: 0, right: 0, bottom: 0 },
    
    childViews: "labelView".w(),
    labelView: SC.LabelView.design({
      layout: { left: 0, right: 0, height: 18, centerY: 0 },
      textAlign: SC.ALIGN_CENTER,
      value: "_No Dimensions".loc()
    })
  })
});
