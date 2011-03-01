// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2010 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/**
  Layout properties needed to anchor a view to the top.
*/
SC.ANCHOR_TOP = { top: 0 };

/**
  Layout properties needed to anchor a view to the left.
*/
SC.ANCHOR_LEFT = { left: 0 };

/*
  Layout properties to anchor a view to the top left
*/
SC.ANCHOR_TOP_LEFT = { top: 0, left: 0 };

/**
  Layout properties to anchoe view to the bottom.
*/
SC.ANCHOR_BOTTOM = { bottom: 0 };

/**
  Layout properties to anchor a view to the right.
*/
SC.ANCHOR_RIGHT = { right: 0 } ;

/**
  Layout properties to anchor a view to the bottom right.
*/
SC.ANCHOR_BOTTOM_RIGHT = { bottom: 0, right: 0 };

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
    The WAI-ARIA role for toolbar view. This property's value should not be
    changed.

    @property {String}
  */
  ariaRole: 'toolbar',
  /**
    Default anchor location.  This will be applied automatically to the
    toolbar layout if you set it.
  */
  anchorLocation: null,

  // ..........................................................
  // INTERNAL SUPPORT
  //

  /** @private */
  layout: { left: 0, height: 32, right: 0 },

  /** @private */
  init: function() {
    // apply anchor location before setting up the rest of the view.
    if (this.anchorLocation) {
      this.layout = SC.merge(this.layout, this.anchorLocation);
    }
    sc_super();
  },

  renderDelegateName: 'toolbarRenderDelegate'

});

