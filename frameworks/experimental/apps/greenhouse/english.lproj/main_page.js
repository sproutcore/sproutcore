// ==========================================================================
// Project:   Greenhouse - mainPage
// Copyright: ©2010 Mike Ball
// ==========================================================================
/*globals Greenhouse */
sc_require('views/application_list_item');
// This page describes the main user interface for your application.  
Greenhouse.mainPage = SC.Page.design({

  // The main pane is made visible on screen as soon as your app is loaded.
  // Add childViews to this pane for views to display immediately on page 
  // load.
  mainPane: SC.MainPane.design({
    
    defaultResponder: "Greenhouse",
    
    childViews: 'container'.w(),
    container: SC.ContainerView.design({
      nowShowing: ''
    })
  }),
  
  loading: SC.LabelView.design({
    layout: { bottom: 0, height: 30, left: 0, right: 0},
    value: 'Loading...',
    textAlign: SC.ALIGN_CENTER,
    classNames: ['footer']
  }),
  
  appPicker: SC.View.design({
    childViews: 'scLogo picker footer warning'.w(),
    classNames: ['app-picker'],
    
    scLogo: SC.View.design({
      layout: { width: 140, left: 10, top: 10, height: 32 },
      classNames: ['sc-logo']
    }),
    
    picker: SC.View.design({
      layout: { width: 548, height: 400, centerX: -102, centerY: -60},
      childViews: 'ghLogo prompt scrollView button'.w(),
      classNames: ['app-picker'],
    
      ghLogo: SC.View.design({
        layout: { width: 279, left: 168, top: 0, height: 64 },
        classNames: ['greenhouse-logo-l']
      }),
    
      prompt: SC.View.design({
        layout: { width: 175, left: 0, top: 62, height: 128 },
        classNames: ['helper']
      }),
    
      button: SC.ButtonView.design({
        layout: { bottom: 12, height: 28, width: 140, right: 0 },
        isEnabledBinding: "Greenhouse.targetController.content",
        title: "Load Application",
        theme: "capsule",
        isDefault: YES,
        action: "loadApplication"
      }),
    
      scrollView: SC.ScrollView.design({
        layout: { right: 0, top: 60, width: 332, bottom: 54 },
        hasHorizontalScroller: NO,
      
        contentView: SC.ListView.design({  
          rowHeight: 41,
          exampleView: Greenhouse.ApplicationListItem,
          contentBinding: "Greenhouse.targetsController.applications",
          selectionBinding: "Greenhouse.targetsController.selection",        
          contentValueKey: "displayName",
          contentIconKey: "targetIcon",
          hasContentIcon: YES,
          action: "loadApplication"
        })
      
      })
    
    }),
    
    warning: SC.LabelView.design({
      layout: {bottom: 60, centerX: 0, width: 400, height: 58},
      value: "NOTE: Greenhouse is under active development and not yet ready for general use.  At the moment, Greenhouse works best with Google Chrome."
    }),
    
    footer: SC.LabelView.design({
      layout: { bottom: 0, height: 30, left: 0, right: 0},
      value: '©2011 Strobe Inc. & Contributors',
      textAlign: SC.ALIGN_CENTER,
      classNames: ['footer']
    })
    
  }) 
});
