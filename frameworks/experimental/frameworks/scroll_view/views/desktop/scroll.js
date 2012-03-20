// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

sc_require('views/core_scroll');
sc_require('views/desktop/scroller');

/** @class
  Implements a desktop scroll view using mouse wheel events.

  Important Events:

    - contentView frame size changes (to autoshow/hide scrollbar- adjust scrollbar size)
    - horizontalScrollOffset change
    - verticalScrollOffsetChanges

  @extends SC.View
  @since SproutCore 1.6
*/
SC.DesktopScrollView = SC.CoreScrollView.extend(
  /** @scope SC.DesktopScrollView.prototype */{

  /**
    @type SC.CoreScrollerView
    @default SC.DesktopScrollerView
   */
  horizontalScrollerView: SC.DesktopScrollerView,

  /**
    @type SC.CoreScrollerView
    @default SC.DesktopScrollerView
   */
  verticalScrollerView: SC.DesktopScrollerView,

  /**
    @field
    @type String
    @default scrollRenderDelegate
   */
  renderDelegateName: 'scrollRenderDelegate',

  // ..........................................................
  // SCROLL WHEEL SUPPORT
  //

  /** @private */
  _scroll_wheelDeltaX: 0,

  /** @private */
  _scroll_wheelDeltaY: 0,

  /** @private */
  mouseWheel: function (evt) {
    var horizontalScrollOffset = this.get('horizontalScrollOffset'),
        maximumHorizontalScrollOffset = this.get('maximumHorizontalScrollOffset'),
        maximumVerticalScrollOffset = this.get('maximumVerticalScrollOffset'),
        shouldScroll = NO,
        verticalScrollOffset = this.get('verticalScrollOffset');

    // Only attempt to scroll if we are allowed to scroll in the direction and
    // have room to scroll in the direction.  Otherwise, ignore the event so
    // that an outer ScrollView may capture it.
    shouldScroll = ((this.get('canScrollHorizontal') &&
        (evt.wheelDeltaX < 0 && horizontalScrollOffset > 0) ||
        (evt.wheelDeltaX > 0 && horizontalScrollOffset < maximumHorizontalScrollOffset)) ||
        (this.get('canScrollVertical') &&
        (evt.wheelDeltaY < 0 && verticalScrollOffset > 0) ||
        (evt.wheelDeltaY > 0 && verticalScrollOffset < maximumVerticalScrollOffset)));

    if (shouldScroll) {
      this._scroll_wheelDeltaX += evt.wheelDeltaX;
      this._scroll_wheelDeltaY += evt.wheelDeltaY;

      this.invokeLater(this._scroll_mouseWheel, 10);
    }

    return shouldScroll;
  },

  /** @private */
  _scroll_mouseWheel: function() {
    this.scrollBy(this._scroll_wheelDeltaX, this._scroll_wheelDeltaY);
    if (SC.WHEEL_MOMENTUM && this._scroll_wheelDeltaY > 0) {
      this._scroll_wheelDeltaY = Math.floor(this._scroll_wheelDeltaY*0.950);
      this._scroll_wheelDeltaY = Math.max(this._scroll_wheelDeltaY, 0);
      this.invokeLater(this._scroll_mouseWheel, 10);
    } else if (SC.WHEEL_MOMENTUM && this._scroll_wheelDeltaY < 0){
      this._scroll_wheelDeltaY = Math.ceil(this._scroll_wheelDeltaY*0.950);
      this._scroll_wheelDeltaY = Math.min(this._scroll_wheelDeltaY, 0);
      this.invokeLater(this._scroll_mouseWheel, 10);
    } else {
      this._scroll_wheelDeltaY = 0;
      this._scroll_wheelDeltaX = 0;
    }
  },

  /** @private
    Called at the end of the run loop.
    This sets `scrollTop` and `scrollLeft` on the DOM element,
    and updates the cached values.
   */
  adjustElementScroll: function () {
    var container = this.getPath('containerView.layer'),
        verticalScrollOffset = this.get('verticalScrollOffset'),
        horizontalScrollOffset = this.get('horizontalScrollOffset');

    sc_super();

    if (container) {
      if (verticalScrollOffset !== this._verticalScrollOffset) {
        container.scrollTop = verticalScrollOffset;
        this._verticalScrollOffset = verticalScrollOffset;
      }

      if (horizontalScrollOffset !== this._horizontalScrollOffset) {
        container.scrollLeft = horizontalScrollOffset;
        this._horizontalScrollOffset = horizontalScrollOffset;
      }
    }
  }
});
