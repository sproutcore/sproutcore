// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

SC.BaseTheme.PROGRESS_OFFSET = 0.5;
SC.BaseTheme.PROGRESS_OFFSET_RANGE = 10;

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
  className: 'progress',

  render: function(dataSource, context) {
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
      indeterminate: dataSource.get('isIndeterminate'),
      running: dataSource.get('isRunning'),
      disabled: !dataSource.get('isEnabled'),
      'sc-empty': (value <= 0),
      'sc-complete': (value >= 1 && !dataSource.get('isIndeterminate'))
    });

    context = context.begin('div').addClass('track');
    this.includeSlices(dataSource, context, SC.THREE_SLICE);
    context = context.end();

    context = context.begin('div').addClass('content');
    context.css('width', (value * 100) + "%");
    this.includeSlices(dataSource, context, SC.THREE_SLICE);
    context = context.end();
  },

  update: function(dataSource, context) {
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
      indeterminate: isIndeterminate,
      running: isRunning,
      disabled: !isEnabled,
      'sc-empty': (value <= 0),
      'sc-complete': (value >= 1 && !isIndeterminate)
    });

    context.find('.content').css('width', (value * 100) + "%");
    if (isIndeterminate && isRunning && isVisibleInWindow) { this.animate(dataSource); }
  },

  /**
    Animates the indeterminate progress view's middle background using
    JavaScript and requestAnimationFrame().
    */
  animate: function(dataSource) {
    var offset = this._lastOffset,
        self = this,
        animating = this._animating;

    // avoid invoking the animation code mutliple times if more than
    // one progress bar neeeds animating and one has already started the loop
    if(this._animating) return;

    // Initialize the offset at 0.
    if (SC.none(offset)) { offset = this._lastOffset = 0; }


    function _animate() {
      var middle =  SC.$('.sc-progress-view.indeterminate.running .content .middle');
      var roundedOffset;

      // nothing to animate
      if(middle.length==0) {
          self._animating=false;
      }

      if (dataSource.get('isIndeterminate') && dataSource.get('isRunning') && dataSource.get('isVisibleInWindow')) {
        self._animating=true;
        window.requestAnimationFrame(_animate);

        offset = self._lastOffset;
        offset = (offset + SC.BaseTheme.PROGRESS_OFFSET) % SC.BaseTheme.PROGRESS_OFFSET_RANGE;

        // Only update the style when the offset changes (this avoids making
        // the browser recalculate style in each frame).
        roundedOffset = Math.round(offset);
        if (roundedOffset > Math.round(self._lastOffset)) {
          middle.css('background-position', roundedOffset + "px -2px");
        }

        self._lastOffset = offset;
      } else if (!dataSource.get('isIndeterminate')) {
        // Clear out our custom background-position when isIndeterminate goes
        // false.  Don't reset it when isRunning goes false, because that
        // would cause the animation to jump.
        middle.css('background-position', '');
      }
    }

    // Start the animation.
    _animate();
  }
});
