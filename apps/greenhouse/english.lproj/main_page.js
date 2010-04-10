// ==========================================================================
// Project:   Greenhouse - mainPage
// Copyright: ©2009 Mike Ball
// ==========================================================================
/*globals Greenhouse */

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
  
  loading: SC.View.design({
    render: function(context, firstTime){
      context.begin('p').id('loading').addClass('loading').push('Loading...').end();
    }
  }),
  
  appPicker: SC.View.design({
    layout: { width: 600, height: 300, centerX: 0, centerY: 0 },
    childViews: 'heading subText prompt icon scrollView button'.w(),
    
    icon: SC.View.design({
      layout: { width: 128, left: 54, top: 32, height: 128 },
      tagName: 'img',
      render: function(context, firstTime) {
        //TODO: get a better logo...
        context.attr('src', sc_static('images/greenhouseicon'));
      }
    }),
    
    heading: SC.LabelView.design({
      layout: { left: 12, top: 160, width: 300, height: 32 },
      tagName: "h1",
      value: "Welcome to Greenhouse",
      classNames: 'welcome'.w()
    }),
    
    subText: SC.LabelView.design({
      layout: { left: 12, top: 190, width: 300, height: 32 },
      value: "A SproutCore Application Designer"
    }),
    
    prompt: SC.LabelView.design({
      layout: { left: 280, top: 18, right: 20, height: 20 },
      escapeHTML: NO,
      value: "Choose an application:"
    }),
    
    button: SC.ButtonView.design({
      layout: { bottom: 18, height: 24, width: 140, right: 20 },
      isEnabledBinding: "Greenhouse.targetController.content",
      title: "Load Application",
      theme: "capsule",
      isDefault: YES,
      target: 'Greenhouse.targetsController',
      action: "loadApplication"
              
    }),
    
    scrollView: SC.ScrollView.design({
      layout: { right: 20, top: 40, width: 300, bottom: 60 },
      hasHorizontalScroller: NO,
      
      contentView: SC.ListView.design({  
        rowHeight: 32,

        contentBinding: "Greenhouse.targetsController.applications",
        selectionBinding: "Greenhouse.targetsController.selection",        
        contentValueKey: "displayName",
        contentIconKey: "targetIcon",
        hasContentIcon: YES,
        
        action: "loadApplication"
      })
      
    })
    
  }) 
});
