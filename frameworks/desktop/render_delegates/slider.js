// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licened under MIT license (see license.js)
// ==========================================================================

/**
  Renders and updates the DOM representation of a slider.

  Parameters
  -------------------------
  Requires the following parameters:

   - `value` -- a value from 0 to 1.
   - `frame` -- containing the frame in which the slider is being drawn.
*/

SC.BaseTheme.sliderRenderDelegate = SC.RenderDelegate.create({

  className: 'slider',

  render: function(dataSource, context) {
    this.addSizeClassName(dataSource, context);

    var valueMax = dataSource.get('maximum'),
        valueMin = dataSource.get('minimum'),
        valueNow = dataSource.get('ariaValue');

    // Add accessibility values.
    context.setAttr('aria-valuemax', valueMax);
    context.setAttr('aria-valuemin', valueMin);
    context.setAttr('aria-valuenow', valueNow);
    if(valueMin !== 0 || valueMax !== 100) context.setAttr('aria-valuetext', valueNow);
    context.setAttr('aria-orientation', 'horizontal');

    // Begin the track element.
    context = context.begin('span').addClass('track');

    // Draw the track's visual elements ("beginning", "middle" and "end").
    this.includeSlices(dataSource, context, SC.THREE_SLICE);

    // If desired, draw the step choinks.
    if (dataSource.get('markSteps')) {
      var stepPositions = dataSource.get('stepPositions');
      if (stepPositions) {
        var i, len = stepPositions.length;
        for (i = 0; i < len; i++) {
          context.begin()
            .setStyle('left', '%@%'.fmt(stepPositions[i] * 100))
            .addClass(['sc-slider-step-mark', 'sc-slider-step-mark-%@'.fmt(i)])
            .setClass({
              'sc-slider-step-mark-first': i === 0,
              'sc-slider-step-mark-last': i === len - 1
            }).end();
        }
      }
    }

    // Draw the handle.
    context.begin('img')
      .setAttr('src', SC.BLANK_IMAGE_URL)
      .addClass('sc-handle')
      .setStyle('left', '%@%'.fmt(dataSource.get('value')))
      .end();

    // End the track element.
    context = context.end();

    dataSource.get('renderState')._cachedHandle = null;
  },

  update: function(dataSource, jquery) {
    this.updateSizeClassName(dataSource, jquery);

    var valueMax = dataSource.get('maximum'),
        valueMin = dataSource.get('minimum'),
        valueNow = dataSource.get('ariaValue'),
        handle = dataSource.get('renderState')._cachedHandle;

    // Snag the handle if we haven't cached it yet.
    if (!handle) {
      handle = dataSource.get('renderState')._cachedHandle = jquery.find('.sc-handle');
    }

    // Update accessibility values.
    jquery.attr('aria-valuemax', valueMax);
    jquery.attr('aria-valuemin', valueMin);
    jquery.attr('aria-valuenow', valueNow);
    if(valueMin !== 0 || valueMax !== 100) jquery.attr('aria-valuetext', valueNow);
    jquery.attr('aria-orientation', 'horizontal');

    // If the minimum, maximum, step, or markSteps have changed, repoint the choinks.
    if (dataSource.didChangeFor('sliderRenderDelegateMinimumMaximumStepMarkSteps', 'minimum', 'maximum', 'step', 'markSteps')) {
      var marks = jquery.find('.sc-slider-step-mark'),
        markSteps = dataSource.get('markSteps'),
        stepPositions;
      // Ten years ago we had no marks, no steps and
      if (!markSteps || !(stepPositions = dataSource.get('stepPositions'))) {
        marks.remove();
      }
      // Otherwise, reposition them, adding new ones as needed.
      else {
        var choinkVal,
          i, len = stepPositions.length,
          firstLastClass,
          choinkTemplate = '<div style="left:%@%" class="sc-slider-step-mark sc-slider-step-mark-%@ %@"></div>',
          choinkMarkup;

        for (i = 0; i < len; i++) {
          if (marks[i]) {
            marks.eq(i).css('left', '%@%'.fmt(stepPositions[i] * 100)).setClass({
              'sc-slider-step-mark-first': i === 0,
              'sc-slider-step-mark-last': i === len - 1
            });
          }
          else {
            if (i === 0) firstLastClass = 'sc-slider-step-mark-first';
            else if (i === len - 1) firstLastClass = 'sc-slider-step-mark-last';
            else firstLastClass = '';
            choinkMarkup = choinkTemplate.fmt(stepPositions[i] * 100, i, firstLastClass);
            handle.before(choinkMarkup);
          }
        }
        // Remove any remaining.
        marks.slice(i).remove();
      }
    }

    // Update the value, if needed.
    if (dataSource.didChangeFor('sliderRenderDelegateValue', 'value')) {
      var value = dataSource.get('value');
      handle.css('left', value + "%");
    }
  }
});
