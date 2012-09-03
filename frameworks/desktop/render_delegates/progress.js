// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

SC.BaseTheme.PROGRESS_OFFSET = 5;
SC.BaseTheme.PROGRESS_OFFSET_RANGE = 48;

/**
  Renders and updates DOM representations of progress bars.

  Parameters
  --------------------------
  Expects these properties on the data source:

   - `isIndeterminate`
   - `isRunning`
   - `isEnabled`
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

  update: function(dataSource, $) {
    this.updateSizeClassName(dataSource, $);

    var theme = dataSource.get('theme'),
        valueMax = dataSource.get('maximum'),
        valueMin = dataSource.get('minimum'),
        valueNow = dataSource.get('ariaValue'),
        isIndeterminate = dataSource.get('isIndeterminate'),
        isRunning = dataSource.get('isRunning'),
        isEnabled = dataSource.get('isEnabled');

    // make accessible
    $.attr('aria-valuemax', valueMax);
    $.attr('aria-valuemin', valueMin);
    $.attr('aria-valuenow', valueNow);
    $.attr('aria-valuetext', valueNow);


    var value;
    if (isIndeterminate) {
      value = 1;
    } else {
      value = dataSource.get('value');
    }

    $.setClass({
      indeterminate: isIndeterminate,
      running: isRunning,
      disabled: !isEnabled,
      'sc-empty': (value <= 0),
      'sc-complete': (value >= 1 && !isIndeterminate)
    });

    $.find('.content').css('width', (value * 100) + "%");
    if(isIndeterminate && isRunning) { // bas keeps running
        var middle = $.find('.middle');
        var offset = this.getBackgroundImagePos(middle).x;
        offset = Math.round((Math.abs(offset) + SC.BaseTheme.PROGRESS_OFFSET ) % SC.BaseTheme.PROGRESS_OFFSET_RANGE );

        middle.css('background-position', offset+"px -2px");
    }
  },

   getBackgroundImagePos: function(e) {
        var result = $(e).css("background-position");
        if (typeof result == "string") {
            var a = result.split(" ");
        } else {
            var a = [$(e).css("background-position-x"),
                     $(e).css("background-position-y")];
        }
        return {
            x: parseFloat(a[0]),
            y: parseFloat(a[1])
        };
    }
});
