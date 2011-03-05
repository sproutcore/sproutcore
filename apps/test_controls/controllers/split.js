// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2010 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2010 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================
/*globals TestControls */

TestControls.splitController = SC.Controller.create({
  shouldResizeChildrenToFit: YES,
  layoutDirection: SC.LAYOUT_HORIZONTAL,
  
  shouldResizeChildrenToFitDidChange: function() {
    this.invokeLater(function() { 
      TestControls.mainPage.split_page.scroll.contentView.set('layout', {
        left: 0, right: 0, top: 0, bottom: 0
      });
    });
  }.observes('shouldResizeChildrenToFit'),
  
  addChild: function() {
    TestControls.mainPage.split_page.scroll.contentView.appendChild(
      TestControls.SplitColumn.create()
    );
    
    // it is nice to have a divider at the end if not shouldResizeChildrenToFit
    if (this.get('shouldResizeChildrenToFit')) return;
    TestControls.mainPage.split_page.scroll.contentView.appendChild(
      SC.SplitDividerView.create()
    );
  },
  
  removeChild: function() {
    var split = TestControls.mainPage.split_page.scroll.contentView,
        c = split.get('childViews');
    if (c.length > 0) {
      split.removeChild(c[c.length - 1]);
    }
  }
  
});