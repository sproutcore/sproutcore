// ==========================================================================
// Project:   SproutCore Test Runner - mainPage
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple, Inc. All rights reserved.
// License:   Licened under MIT license (see license.js)
// ==========================================================================
/*globals TestRunner */

// This page describes the main user interface for your application.  
TestRunner.mainPage = SC.Page.design({

  // The main pane is made visible on screen as soon as your app is loaded.
  // Add childViews to this pane for views to display immediately on page 
  // load.
  mainPane: SC.MainPane.design()
    .childView(SC.LabelView.design({
      tagName: "h1", value: "Hello World"
    }))

});
