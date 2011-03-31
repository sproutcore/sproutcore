// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2010 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
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
  },

  children: [],

  allAllowIndirect: function(key, value) {
    if (value !== undefined) {
      this.get('children').setEach('allowsIndirectAdjustments', value);
      return value;
    } else {
      if (!this.get('children')) return NO;
      var isYES = this.get('children').everyProperty('allowsIndirectAdjustments', YES),
          isNO = this.get('children').everyProperty('allowsIndirectAdjustments', NO);

      if (isYES) return YES;
      if (isNO) return NO;
      return SC.MIXED_STATE;
    }
  }.property('children', 'children.@each.allowsIndirectAdjustments').cacheable(),

  allCompensateForMovement: function(key, value) {
    if (value !== undefined) {
      this.get('children').setEach('compensatesForMovement', value);
      return value;
    } else {
      if (!this.get('children')) return NO;
      var isYES = this.get('children').everyProperty('compensatesForMovement', YES),
          isNO = this.get('children').everyProperty('compensatesForMovement', NO);

      if (isYES) return YES;
      if (isNO) return NO;
      return SC.MIXED_STATE;
    }
  }.property('children', 'children.@each.compensatesForMovement').cacheable()

  
});
