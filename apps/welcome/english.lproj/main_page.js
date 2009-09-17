// ==========================================================================
// Project:   Welcome - mainPage
// Copyright: ©2009 Apple Inc.
// ==========================================================================
/*globals Welcome */

// This page describes the main user interface for your application.  
Welcome.mainPage = SC.Page.design({

  // The main pane is made visible on screen as soon as your app is loaded.
  // Add childViews to this pane for views to display immediately on page 
  // load.
  mainPane: SC.PanelPane.design({
    layout: { width: 360, height: 300, centerX: 0, centerY: 0 },

    contentView: SC.View.design({
      childViews: 'heading prompt icon scrollView button'.w(),
      
      icon: SC.View.design({
        layout: { width: 32, left: 20, top: 18, height: 32 },
        tagName: 'img',
        render: function(context, firstTime) {
          context.attr('src', sc_static('images/sproutcore-logo'));
        }
      }),
      
      heading: SC.LabelView.design({
        layout: { left: 56, top: 20, right: 20, height: 32 },
        tagName: "h1",
        classNames: "heading",
        valueBinding: 'Welcome.displayTitle' 
      }),
      
      prompt: SC.LabelView.design({
        layout: { left: 20, top: 60, right: 20, height: 20 },
        escapeHTML: NO,
        value: "Choose an application:"
      }),
      
      button: SC.ButtonView.design({
        layout: { bottom: 18, height: 24, width: 140, centerX: 0 },
        isEnabledBinding: "Welcome.targetsController.canLoadApp",

        title: "Load Application",
        theme: "capsule",
        isDefault: YES,
        
        target: "Welcome.targetsController",
        action: "loadApplication"
        
      }),
      
      scrollView: SC.ScrollView.design({
        layout: { left: 20, top: 80, right: 20, bottom: 60 },
        hasHorizontalScroller: NO,
        
        contentView: SC.ListView.design({  
          rowHeight: 32,

          contentBinding: "Welcome.targetsController.appsOnly",
          selectionBinding: "Welcome.targetsController.selection",
          isEnabledBinding: "Welcome.targetsController.canLoadApp",
          
          contentValueKey: "displayName",
          contentIconKey: "targetIcon",
          hasContentIcon: YES,
          
          target: "Welcome.targetsController",
          action: "loadApplication"
        })
        
      })
      
    }) 
  })

});
