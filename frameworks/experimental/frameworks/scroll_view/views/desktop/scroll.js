// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

sc_require('views/core_scroll');

/** @class
  Implements a complete scroll view.  This class uses a manual implementation
  of scrollers in order to properly support clipping frames.

  Important Events:

    - contentView frame size changes (to autoshow/hide scrollbar - adjust scrollbar size)
    - horizontalScrollOffset change
    - verticalScrollOffsetChanges
    - scroll wheel events

  @extends SC.View
  @since SproutCore 1.0
*/
SC.DesktopScrollView = SC.CoreScrollView.extend(
  /** @scope SC.DesktopScrollView.prototype */{

  horizontalScrollerView: SC.ScrollerView,

  verticalScrollerView: SC.ScrollerView,

  // ..........................................................
  // SCROLL WHEEL SUPPORT
  //

  /** @private */
  _scroll_wheelDeltaX: 0,

  /** @private */
  _scroll_wheelDeltaY: 0,

  /** @private */
  mouseWheel: function(evt) {
    var deltaAdjust = (SC.browser.webkit && SC.browser.version > 533.0) ? 120 : 1;
    
    this._scroll_wheelDeltaX += evt.wheelDeltaX / deltaAdjust;
    this._scroll_wheelDeltaY += evt.wheelDeltaY / deltaAdjust;
    this.invokeLater(this._scroll_mouseWheel, 10) ;
    return this.get('canScrollHorizontal') || this.get('canScrollVertical') ;  
  },

  /** @private */
  _scroll_mouseWheel: function() {
    this.scrollBy(this._scroll_wheelDeltaX, this._scroll_wheelDeltaY);
    if (SC.WHEEL_MOMENTUM && this._scroll_wheelDeltaY > 0) {
      this._scroll_wheelDeltaY = Math.floor(this._scroll_wheelDeltaY*0.950);
      this._scroll_wheelDeltaY = Math.max(this._scroll_wheelDeltaY, 0);
      this.invokeLater(this._scroll_mouseWheel, 10) ;
    } else if (SC.WHEEL_MOMENTUM && this._scroll_wheelDeltaY < 0){
      this._scroll_wheelDeltaY = Math.ceil(this._scroll_wheelDeltaY*0.950);
      this._scroll_wheelDeltaY = Math.min(this._scroll_wheelDeltaY, 0);
      this.invokeLater(this._scroll_mouseWheel, 10) ;
    } else {
      this._scroll_wheelDeltaY = 0;
      this._scroll_wheelDeltaX = 0;
    }
  },

  adjustElementScroll: function() {
    var container = this.get('containerView'),
        layer = container && container.get('layer'),
        verticalScrollOffset = this.get('verticalScrollOffset'),
        horizontalScrollOffset = this.get('horizontalScrollOffset');

    if (layer) {
      if (verticalScrollOffset !== this._verticalScrollOffset) {
        layer.scrollTop = verticalScrollOffset;
        this._verticalScrollOffset = verticalScrollOffset;
      }

      if (horizontalScrollOffset !== this._horizontalScrollOffset) {
        layer.scrollLeft = horizontalScrollOffset;
        this._horizontalScrollOffset = horizontalScrollOffset;
      }
    }
    return sc_super();
  }

});
