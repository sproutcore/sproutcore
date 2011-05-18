// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

sc_require('views/core_scroll');
sc_require('views/desktop/scroller');

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

  horizontalScrollerView: SC.DesktopScrollerView,

  verticalScrollerView: SC.DesktopScrollerView,

  /**
    The current horizontal scroll offset.
    Changing this value will update both the `contentView`
    and the horizontal scroller, if there is one.

    @field
    @type Number
    @default 0
   */
  horizontalScrollOffset: function (key, value) {
    if (arguments.length === 2) {
      var minOffset = this.minimumHorizontalScrollOffset(),
          maxOffset = this.get('maximumHorizontalScrollOffset'),
          layer = this.getPath('containerView.layer'),
          offset = Math.max(minOffset, Math.min(maxOffset, value));

      this._scroll_horizontalScrollOffset = offset;
      if (layer && layer.scrollLeft !== offset) {
        layer.scrollLeft = offset;
      }
    }

    return this._scroll_horizontalScrollOffset || 0;
  }.property().cacheable(),

  /**
    The current vertical scroll offset.
    Changing this value will update both the `contentView`
    and the vertical scroller, if there is one.

    @field
    @type Number
    @default 0
   */
  verticalScrollOffset: function (key, value) {
    if (arguments.length === 2) {
      var minOffset = this.get('minimumVerticalScrollOffset'),
          maxOffset = this.get('maximumVerticalScrollOffset'),
          layer = this.getPath('containerView.layer'),
          offset = Math.max(minOffset, Math.min(maxOffset, value));

      this._scroll_verticalScrollOffset = offset;
      if (layer && layer.scrollTop !== offset) {
        layer.scrollTop = offset;
      }
    }

    return this._scroll_verticalScrollOffset || 0;
  }.property().cacheable(),

  /** @private
    Push the corner of the view (the empty space where scrollers intersect).
   */
  render: function (context) {
    context.push('<div class="corner"></div>');
  },

  // ..........................................................
  // SCROLL WHEEL SUPPORT
  //

  containerView: SC.ContainerView.extend({
    classNames: ['sc-scrollable'],

    /** @private
      Remove the "scroll" event handler for the layer.
     */
    willDestroyLayer: function () {
      SC.Event.remove(this.get('layer'), 'scroll', this, this.scroll);
    },

    /** @private
      Attach the "scroll" event handler for the layer.
     */
    didCreateLayer: function () {
      SC.Event.add(this.get('layer'), 'scroll', this, this.scroll);
    },

    /** @private
      Notify the container that the scroll offsets have changed.
     */
    scroll: function (evt) {
      var layer = this.get('layer'),
          scrollTop = layer.scrollTop,
          scrollLeft = layer.scrollLeft,
          parentView = this.get('parentView');

      // I'm using `verticalScrollOffset` and `horizontalScrollOffset`
      // as proxies for the the actual scroll offsets.

      // Since we know what the offsets are (we got the event), this
      // needs to set the cached value, and let properties know that
      // the offset changed.
      if (this._scroll_verticalScrollOffset !== scrollTop) {
        parentView.propertyWillChange('verticalScrollOffset');
        parentView._scroll_verticalScrollOffset = scrollTop;
        parentView.propertyDidChange('verticalScrollOffset');
      }

      if (this._scroll_horizontalScrollOffset !== scrollLeft) {
        parentView.propertyWillChange('horizontalScrollOffset');
        parentView._scroll_horizontalScrollOffset = scrollLeft;
        parentView.propertyDidChange('horizontalScrollOffset');
      }

      return parentView.get('canScrollHorizontal') || parentView.get('canScrollVertical');
    }
  })

});
