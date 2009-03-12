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
      
      topLeftDefaultThickness: 200,  // set default thickness in pixels
      
      topLeftView: SC.ScrollView.design({
        
        hasHorizontalScroller: NO, // disable horizontal scrolling
        contentView: SC.ListView.design({
          layout: SC.merge(SC.FULL_WIDTH, SC.ANCHOR_TOP, { height: 400 })
        })
      }),
      
      bottomRightView: SC.WebView.design({
        
      })
      
    }),
    
    // This is the toolbar view that appears at the bottom.  We include two
    // child views that alight right and left so that we can add buttons to 
    // them and let them layout themselves.
    toolbarView: SC.ToolbarView.design({

      layout: { left: 0, bottom: 0, right: 0, height: 36 },

      childViews: 'leftView rightView'.w(),

      leftView: SC.LabelView.design({
        layout: { left: 12, height: 18, width: 200, centerY: 3 },
        classNames: 'app-title',
        tagName: 'h1',
        fontWeight: SC.BOLD_WEIGHT,
        value: "Test Runner"
      }),

      rightView: SC.View.design({
        layout: { right: 0, left: 200, centerY: 3, height: 23 },
        
        childViews: 'continuousIntegrationButton runAllTestsButton runTestButton'.w(),
        
        runTestButton: SC.ButtonView.design({
          title: "Run Test",
          action: "TestRunner.testController.runTest",
          layout: { height: 21, top: 0, width: 100, right: 12 }
        }),
        
        runAllTestsButton: SC.ButtonView.design({
          title: "Run All",
          action: "TestRunner.testsController.runAllTests",
          layout: { height: 21, top: 0, width: 100, right: 120 }
        }),
        
        continuousIntegrationButton: SC.CheckboxView.design({
          title: "Continuous integration",
          valueBinding: "TestRunner.testsController.useContinuousIntegration",
          layout: { height: 18, centerY: 2, width: 170, right: 216 }
        })
        
        
      })
      
    })
  })

});


