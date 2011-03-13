// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2010 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2010 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================
sc_require('views/button') ;
sc_require('views/separator') ;

/*
  Extends SC.MenuItemView to support auto resize.
*/
SC.MenuItemView.reopen(SC.AutoResize);
SC.MenuItemView.reopen(
/** @scope SC.MenuItemView.prototype */{

  //
  // For automatic resizing, if enabled (to be enabled by parent menu)
  //
  shouldAutoResize: NO,
  shouldMeasureSize: NO,

  autoSizePadding: 100, // TODO: SHOULD COME FROM THEME.
  autoResizeField: 'title',

  autoResizeLayer: function() {
    return this.$('.value')[0];
  }.property('layer').cacheable(),

  /**
   * @private
   * When we render, we recreate all of the DOM, including the element that gets measured.
   * This is a problem because our autoResizeLayer changes. So, we must invalidate that
   * layer whenever we re-render.
   *
   * We need to move menu item rendering into a render delegate. When this happens, there
   * are a few ways we could do it:
   *
   * - Give render delegate method to find clientWidth and return it: 
   *   getMenuItemTitleWidth(dataSource, $)
   *
   * - Make render delegate provide the autoResizeLayer:
   *   In this case, the autoResizeLayer might be a computed property that we invalidate
   *   on didUpdateLayer, and that calls a method like getAutoResizeLayer. Alternatively,
   *   if render delegate properties are added, we could make this one of those, but it
   *   would need some way to access the DOM. Maybe data sources can have $ properties or
   *   methods? Maybe a jQuery property/method?
  */
  didUpdateLayer: function() {
    this.notifyPropertyChange('autoResizeLayer');
    this.measureSizeLater();
  }

}) ;


