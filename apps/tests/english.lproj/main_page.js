// ==========================================================================
// Project:   SproutCore Test Runner
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2010 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================
/*globals TestRunner */

sc_require('views/offset_checkbox');

// This page describes the main user interface for your application.  
TestRunner.mainPage = SC.Page.design({

  /**
    This is the main pane that is displayed when the application loads.  The
    main views are configured here including the sidebar, toolbar at the 
    bottom and the iframe.
  */
  mainPane: SC.MainPane.design({

    defaultResponder: "TestRunner",
    
    // when defining a generic view, just name the properties holding your
    // child views here.  the w() helper is like calling split(' ')
    childViews: 'splitView toolbarView'.w(),
    
    // This is the main split view on the top of the screen.  Note that 
    // since SC.SplitView defines a few special types of views you don't need
    // to define a childViews array.
    splitView: SC.SplitView.design({
      
      layout: { left: 0, top: 0, right: 0, bottom: 32 },
      
      topLeftView: SC.ScrollView.design(SC.SplitChild, {

        size: 200,
        
        hasHorizontalScroller: NO, // disable horizontal scrolling
        contentView: SC.SourceListView.design({
          contentBinding: "TestRunner.sourceController.arrangedObjects",
          selectionBinding: "TestRunner.sourceController.selection",
          contentValueKey: "displayName",
          hasContentIcon: YES,
          contentIconKey:  "targetIcon",
          
          action: 'selectTarget'
        })
      }),
      
      bottomRightView: SC.SceneView.design(SC.SplitChild, {
        autoResizeStyle: SC.RESIZE_AUTOMATIC,
        scenes: "testsMaster testsDetail".w(),
        nowShowingBinding: "TestRunner.currentScene"
      })
    }),
    
    // This is the toolbar view that appears at the bottom.  We include two
    // child views that alight right and left so that we can add buttons to 
    // them and let them layout themselves.
    toolbarView: SC.ToolbarView.design({

      anchorLocation: SC.ANCHOR_BOTTOM,

      childViews: 'logo continuousIntegrationCheckbox runTestsButton'.w(),
      classNames: 'bottom-toolbar',

      logo: SC.View.design({
        layout: { left: 0, top: 0, bottom: 0, width: 200 },
        classNames: 'app-title',
        tagName: 'h1',
        render: function(context, firstTime) {
          var img_url = sc_static('images/sproutcore-logo');
          context.push('<img src="%@" />'.fmt(img_url));
          context.push('<span>', "_Test Runner".loc(), "</span>");
        }
      }),

      continuousIntegrationCheckbox: TestRunner.OffsetCheckboxView.design({
        title: "Continuous Integration",
        offsetBinding: "TestRunner.sourceController.sidebarThickness",
        valueBinding: "TestRunner.testsController.useContinuousIntegration",
        isEnabledBinding: "TestRunner.testsController.isShowingTests",
        layout: { height: 18, centerY: 1, width: 170, left: 206 }
      }),
      
      runTestsButton: SC.ButtonView.design({
        title: "Run Tests",
        isEnabledBinding: "TestRunner.testsController.isShowingTests",
        layout: { height: 24, centerY: 0, width: 90, right: 12 }
      })
      
      
    })
  }),

  targetsLoading: SC.View.design({
    childViews: "labelView".w(),
    
    labelView: SC.LabelView.design({
      layout: { centerX: 0, centerY: 0, height: 24, width: 200 },
      textAlign: SC.ALIGN_CENTER,
      controlSize: SC.HUGE_CONTROL_SIZE,
      classNames: "center-label",
      controlSize: SC.LARGE_CONTROL_SIZE,
      fontWeight: SC.BOLD_WEIGHT,
      value: "_Loading Targets".loc()
    })
  }),

  noTargets: SC.View.design({
    childViews: "labelView".w(),
    
    labelView: SC.LabelView.design({
      layout: { centerX: 0, centerY: 0, height: 24, width: 200 },
      textAlign: SC.ALIGN_CENTER,
      classNames: "center-label",
      controlSize: SC.LARGE_CONTROL_SIZE,
      fontWeight: SC.BOLD_WEIGHT,
      value: "_No Targets".loc()
    })
  }),

  noTests: SC.View.design({
    childViews: "labelView".w(),
    
    labelView: SC.LabelView.design({
      layout: { centerX: 0, centerY: 0, height: 24, width: 200 },
      textAlign: SC.ALIGN_CENTER,
      classNames: "center-label",
      controlSize: SC.LARGE_CONTROL_SIZE,
      fontWeight: SC.BOLD_WEIGHT,
      value: "_No Tests".loc()
    })
  }),
  
  testsLoading: SC.View.design({
    childViews: "labelView".w(),
    
    labelView: SC.LabelView.design({
      layout: { centerX: 0, centerY: 0, height: 24, width: 200 },
      textAlign: SC.ALIGN_CENTER,
      classNames: "center-label",
      controlSize: SC.LARGE_CONTROL_SIZE,
      fontWeight: SC.BOLD_WEIGHT,
      value: "_Loading Tests".loc()
    })
  }),

  testsNone: SC.View.design({
    childViews: "labelView".w(),
    
    labelView: SC.LabelView.design({
      layout: { centerX: 0, centerY: 0, height: 24, width: 200 },
      textAlign: SC.ALIGN_CENTER,
      classNames: "center-label",
      controlSize: SC.LARGE_CONTROL_SIZE,
      fontWeight: SC.BOLD_WEIGHT,
      value: "_No Target Selected".loc()
    })
  }),
  
  /* list view:  displayed when you are in the READY_LIST state, this view 
     shows all of the unit tests for the selected target.
  */
  testsMaster: SC.ScrollView.design({
    
    // configure scroll view do hide horizontal scroller
    hasHorizontalScroller: NO,
    
    // this is the list view that actually shows the content
    contentView: SC.ListView.design({
      
      // bind to the testsController, which is an ArrayController managing the
      // tests for the currently selected target.
      contentBinding: "TestRunner.testsController.arrangedObjects",
      selectionBinding: "TestRunner.testsController.selection",
      
      // configure the display options for the item itself.  The row height is
      // larger to make this look more like a menu.  Also by default show
      // the title.
      classNames: ['test-list'], // used by CSS
      rowHeight: 32,

      hasContentIcon: YES,
      contentIconKey: "icon",

      hasContentBranch: YES,
      contentIsBranchKey: 'isRunnable',

      contentValueKey: "displayName",

      // the following two options will make the collection view act like a 
      // menu.  It will send the action down the responder chain whenever you
      // click on an item.  When in the READY state, this action will show the
      // detail view.
      actOnSelect: YES,
      action: "selectTest"
      
    })
  }),
  
  testsDetail: SC.View.design({
    childViews: "navigationView webView".w(),

    navigationView: SC.ToolbarView.design({
      classNames: 'navigation-bar',
      
      layout: { top: 0, left: 0, right: 0, height: 32 },
      childViews: "backButton locationLabel".w(),
      
      backButton: SC.ButtonView.design({
        layout: { left: 8, centerY: 0, width: 80, height: 24 },
        title: "« Tests",
        action: "back"
      }),
      
      locationLabel: SC.LabelView.design({
        layout: { right: 8, centerY: -2, height: 16, left: 100 },
        textAlign: SC.ALIGN_RIGHT,
        valueBinding: "TestRunner.detailController.displayName"
      })
      
    }),
    
    webView: SC.WebView.design({
      layout: { top: 33, left: 2, right: 0, bottom: 0 },
      valueBinding: SC.Binding.oneWay("TestRunner.detailController.uncachedUrl")
    })
  })  

});


