// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple, Inc. All rights reserved.
// License:   Licened under MIT license (see license.js)
// ==========================================================================

/** @class

  A toolbar view can be anchored at the top or bottom of the window to contain
  your main toolbar buttons.  The default implementation assumes you may have
  a leftView, rightView, and centerView, which will be properly laid out.
  
  You can also override the layout property yourself or simply set the 
  anchorLocation to SC.ANCHOR_TOP or SC.ANCHOR_BOTTOM.  This will configure
  the layout of your toolbar automatically when it is created.

  @extends SC.View
  @since SproutCore 1.0
*/
SC.ToolbarView = SC.View.extend(
  /** @scope SC.ToolbarView.prototype */ {

  classNames: ['sc-toolbar-view'],
  
  /**
    Default anchor location.  This will be applied automatically to the 
    toolbar layout if you set it.
  */
  anchorLocation: null,

  /**
    View to attach to the left side of the toolbar view.  Set to
    a View class or design.
    
    @property {SC.View}
  */
  leftView: null,
  
  /**
    View to attach to the right side of the toolabr view.  Set to a View class
    or design.
    
    @property {SC.View}
  */
  rightView: null,
  
  /**
    View to attach to the center of the toolabr view.  Set to a view class or
    design.  The center view will appear underneath the left or right view 
    if they overlap.  It must have a fixed width.
    
    @property {SC.View}
  */
  centerView: null,
  
  // ..........................................................
  // INTERNAL SUPPORT
  // 
  
  /** @private */
  layout: { left: 0, height: 36, right: 0 },
  
  /** @private */
  init: function() {
    // apply anchor location before setting up the rest of the view.
    if (this.anchorLocation) {
      this.layout = SC.merge(this.layout, this.anchorLocation);
    }
    sc_super(); 
  }

});

