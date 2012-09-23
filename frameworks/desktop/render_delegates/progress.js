// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

SC.BaseTheme.PROGRESS_OFFSET = 0.5;
SC.BaseTheme.PROGRESS_OFFSET_RANGE = 42;

/**
 Renders and updates DOM representations of progress bars.

 Parameters
 --------------------------
 Expects these properties on the data source:

 - `isIndeterminate`
 - `isRunning`
 - `isEnabled`
 - `isVisibleInWindow`
 - `value`

 Theme Constants
 -------------------------------------
 Ace's `progressRenderDelegate`'s rendering process is not affected by
 any theme constants.
 */
SC.BaseTheme.progressRenderDelegate = SC.RenderDelegate.create({
  className:'progress',

  render:function (dataSource, context) {
    this.addSizeClassName(dataSource, context);

    var theme = dataSource.get('theme'),
    valueMax = dataSource.get('maximum'),
    valueMin = dataSource.get('minimum'),
    valueNow = dataSource.get('ariaValue');

    var value;
    if (dataSource.get('isIndeterminate')) {
      value = 1;
    } else {
      value = dataSource.get('value');
    }

    // make accessible
    context.attr('aria-valuemax', valueMax);
    context.attr('aria-valuemin', valueMin);
    context.attr('aria-valuenow', valueNow);
    context.attr('aria-valuetext', valueNow);

    context.setClass({
      indeterminate:dataSource.get('isIndeterminate'),
      running:dataSource.get('isRunning'),
      disabled:!dataSource.get('isEnabled'),
      'sc-empty':(value <= 0),
      'sc-complete':(value >= 1 && !dataSource.get('isIndeterminate'))
    });

    context = context.begin('div').addClass('track');
    this.includeSlices(dataSource, context, SC.THREE_SLICE);
    context = context.end();

    context = context.begin('div').addClass('content');
    context.css('width', (value * 100) + "%");
    this.includeSlices(dataSource, context, SC.THREE_SLICE);
    context = context.end();
  },

  update:function (dataSource, context) {
    this.updateSizeClassName(dataSource, context);

    var theme = dataSource.get('theme'),
    value,
    valueMax = dataSource.get('maximum'),
    valueMin = dataSource.get('minimum'),
    valueNow = dataSource.get('ariaValue'),
    isIndeterminate = dataSource.get('isIndeterminate'),
    isRunning = dataSource.get('isRunning'),
    isEnabled = dataSource.get('isEnabled'),
    isVisibleInWindow = dataSource.get('isVisibleInWindow');

    // make accessible
    context.attr('aria-valuemax', valueMax);
    context.attr('aria-valuemin', valueMin);
    context.attr('aria-valuenow', valueNow);
    context.attr('aria-valuetext', valueNow);

    if (isIndeterminate) {
      value = 1;
    } else {
      value = dataSource.get('value');
    }

    context.setClass({
      indeterminate:isIndeterminate,
      running:isRunning && isIndeterminate,
      disabled:!isEnabled,
      'sc-empty':(value <= 0),
      'sc-complete':(value >= 1 && !isIndeterminate)
    });

    context.find('.content').css('width', (value * 100) + "%");

    // fallback for browsers that don't support css transitions
    if(!SC.platform.supportsCSSTransitions) {
        if (!this._queue[context[0].id]) {
          this._queue[context[0].id] = {
            offset:0,
            element:SC.$(context).find('.content .middle'),
            shouldAnimate:false
          };
        }

        if (isIndeterminate && isRunning && isVisibleInWindow) {
          // save offset in the queue and request animation
          this._queue[context[0].id].shouldAnimate = true;
          this.animate(dataSource);
        } else if (!isIndeterminate) {
          // Clear out our custom background-position when isIndeterminate toggles.
          this._queue[context[0].id].element.css('background-position', '');
        } else {
          this._queue[context[0].id].shouldAnimate = false;
        }
    }
  },

  /** @private Queue of objects to animate: { id, offset, element } */
  _queue: {},

  /** @private Catch double calls to _animate */
  _animating: false,

  /**
    Animates the indeterminate progress view's middle background using
    JavaScript and requestAnimationFrame().
  */
  animate: function (dataSource) {
    var self = this;

    // avoid invoking the animation code multiple times if more than
    // one progress bar needs animating *and* one has already started the loop
    if (this._animating) {
      return;
    }

    function _animate() {
      var offset,
        lastOffset,
        roundedOffset,
        viewsToAnimate = self._queue,
        animations = 0,
        params;

      var id;
      for (id in viewsToAnimate) {
        if (viewsToAnimate.hasOwnProperty(id)) {
          params=viewsToAnimate[id];
          if (params.shouldAnimate) {
            self._animating = true;
            animations++;
            lastOffset = params.offset || 0;
            offset = (lastOffset + SC.BaseTheme.PROGRESS_OFFSET) % SC.BaseTheme.PROGRESS_OFFSET_RANGE;

            // Only update the style when the offset changes (this avoids making
            // the browser recalculate style in each frame).
            roundedOffset = Math.round(offset);
            if (roundedOffset > Math.round(lastOffset)) {
              params.element.css('background-position', roundedOffset + "px 0px");
            }

            params.offset = offset;
          }
        }
      }

      if (animations === 0) {
        self._animating = false;
      } else {
        window.requestAnimationFrame(_animate);
      }
    }

    // Start the animation.
    _animate();
  }
});
