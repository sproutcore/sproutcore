// ==========================================================================
// Project:   Welcome - mainPage
// Copyright: ©2009 My Company, Inc.
// ==========================================================================
/*globals Welcome */

// This page describes the main user interface for your application.  
Welcome.mainPage = SC.Page.design({

  // The main pane is made visible on screen as soon as your app is loaded.
  // Add childViews to this pane for views to display immediately on page 
  // load.
  mainPane: SC.Panel.design({
    contentView: SC.View.design({
      layout: { width: 400, height: 300, centerX: 0, centerY: 0 },
      childViews: 'labelView scrollView iconView'.w(),
      
      labelView: SC.LabelView.design({
        layout: { left: 20, top: 20, right: 20, height: 18 },
        escapeHTML: NO,
        value: "<strong>Welcome to SproutCore!</strong>  Choose an app to load:"
      }),
      
      scrollView: SC.ScrollView.design({
        layout: { left: 20, top: 42, right: 20, bottom: 60 },
        hasHorizontalScroller: NO,
        
        contentView: SC.ListView.design({  
        })
        
      }),
      
      iconView: SC.View.design({
        layout: { width: 32, centerX: 0, bottom: 20, height: 32 },
        tagName: 'img',
        render: function(context, firstTime) {
          context.attr('src', sc_static('images/sproutcore-logo'));
        }
      })
    }) 
  })

});
