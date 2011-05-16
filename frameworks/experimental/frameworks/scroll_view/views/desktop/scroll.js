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

  containerView: SC.ContainerView.extend({
    classNames: ['sc-scrollable'],

    willDestroyLayer: function () {
      SC.Event.remove(this.get('layer'), 'scroll', this, this.scroll);
    },

    didCreateLayer: function () {
      SC.Event.add(this.get('layer'), 'scroll', this, this.scroll);
    },

    scroll: function (evt) {
      var layer = this.get('layer'),
          scrollTop = layer.scrollTop,
          scrollLeft = layer.scrollLeft,
          parentView = this.get('parentView');

      parentView.scrollTo(scrollLeft, scrollTop);
      return parentView.get('canScrollHorizontal') || parentView.get('canScrollVertical');
    }
  }),

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
