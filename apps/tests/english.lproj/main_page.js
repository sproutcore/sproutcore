// ==========================================================================
// Project:   SproutCore Test Runner
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple, Inc. All rights reserved.
// License:   Licened under MIT license (see license.js)
// ==========================================================================
/*globals TestRunner */

// This page describes the main user interface for your application.  
TestRunner.mainPage = SC.Page.design({

  /**
    This is the main pane that is displayed when the application loads.  The
    main views are configured here including the sidebar, toolbar at the 
    bottom and the iframe.
  */
  mainPane: SC.MainPane.design({

    // when defining a generic view, just name the properties holding your
    // child views here.  the w() helper is like calling split(' ')
    childViews: 'splitView toolbarView'.w(),
    
    // This is the main split view on the top of the screen.  Note that 
    // since SC.SplitView defines a few special types of views you don't need
    // to define a childViews array.
    splitView: SC.SplitView.design({
      
      layout: { left: 0, top: 0, right: 0, bottom: 32 },
      
      defaultThickness: 200,  // set default thickness in pixels
      
      topLeftView: SC.ScrollView.design({
        
        hasHorizontalScroller: NO, // disable horizontal scrolling
        contentView: SC.SourceListView.design({
          contentBinding: "TestRunner.sourceController.arrangedObjects",
          selectionBinding: "TestRunner.sourceController.selection",
          contentValueKey: "displayName",
          hasContentIcon: YES,
          contentIconKey:  "targetIcon"
        })
      }),
      
      bottomRightView: SC.ScrollView.design({
        
        hasHorizontalScroller: NO,
        contentView: SC.ListView.design({
          contentBinding: "TestRunner.testsController.arrangedObjects",
          selectionBinding: "TestRunner.testsController.selection",
          contentValueKey: "filename",
          actOnSelect: YES,
          
          target: "TestRunner.testsController",
          action: "showDetails"
        })
        
      })
      
    }),
    
    // This is the toolbar view that appears at the bottom.  We include two
    // child views that alight right and left so that we can add buttons to 
    // them and let them layout themselves.
    toolbarView: SC.ToolbarView.design({

      anchorLocation: SC.ANCHOR_BOTTOM,

      childViews: 'leftView rightView'.w(),

      leftView: SC.View.design({
        layout: { left: 0, top: 4, bottom: 0, width: 200 },
        classNames: 'app-title',
        tagName: 'h1',
        render: function(context, firstTime) {
          var img_url = sc_static('images/sproutcore-logo');
          context.push('<img src="%@" />'.fmt(img_url));
          context.push('<span>', "Test Runner".loc(), "</span>");
        }
      }),

      rightView: SC.CheckboxView.design({
        title: "Continuous Integration",
        valueBinding: "TestRunner.testsController.useContinuousIntegration",
        layout: { height: 18, centerY: 2, width: 170, right: 12 }
      })
      
    })
  })

});


