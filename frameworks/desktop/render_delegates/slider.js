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

    // Draw the track ("beginning", "middle" and "end" elements).
    this.includeSlices(dataSource, context, SC.THREE_SLICE);

    // If desired, draw the step choinks.
    if (dataSource.get('markSteps')) {
      var step = dataSource.get('step'),
        choinkVal = valueMin,
        choinkDisplayVal;
      // Draw each choink.
      while ((choinkDisplayVal = this._displayValueForValue(dataSource, choinkVal)) < 100) {
        context.begin().setStyle('left', '%@%'.fmt(choinkDisplayVal)).setClass({
          'sc-slider-step-mark': true,
          'sc-slider-step-mark-first': choinkVal === valueMin
        }).end();
        // Increment.
        choinkVal += step;
      }
      // Draw final choink.
      context.begin().setStyle('left', '100%').setClass({
        'sc-slider-step-mark': true,
        'sc-slider-step-mark-last': true
      }).end();
    }

    // Draw the handle.
    context.begin('img')
      .setAttr('src', SC.BLANK_IMAGE_URL)
      .addClass('sc-handle')
      .setStyle('left', '%@%'.fmt(dataSource.get('value')))
      .end()

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

    // If we've turned markSteps off, hide any choinks.
    if (!dataSource.get('markSteps') && dataSource.didChangeFor('sliderRenderDelegateMarkSteps', 'markSteps')) {
      // jquery.find('.sc-slider-step-mark').addClass('sc-hidden');
      jquery.find('.sc-slider-step-mark').remove();
    }
    // Otherwise, if either the minimum, maximum or step have changed, repoint the choinks.
    else if (dataSource.didChangeFor('sliderRenderDelegateMinimumMaximumStepMarkSteps', 'minimum', 'maximum', 'step', 'markSteps')) {
      // Okay for now we're going to cheat and remove & recreate all choinks. TODO: optimize this to at least the 5th grade level.
      // Remove any previous choinks.
      jquery.find('.sc-slider-step-mark').remove();
      // Create new choinks.
      var step = dataSource.get('step'),
        choinkVal = valueMin,
        choinkDisplayVal,
        choinkTemplate = '<div style="left:%@%" class="sc-slider-step-mark %@"></div>',
        choinkMarkup;
      // Draw each choink.
      while ((choinkDisplayVal = this._displayValueForValue(dataSource, choinkVal)) < 100) {
        choinkMarkup = choinkTemplate.fmt(choinkDisplayVal, (choinkVal === valueMin ? 'sc-slider-step-mark-first' : ''));
        handle.before(choinkMarkup);
        // Increment.
        choinkVal += step;
      }
      // Draw final choink.
      choinkMarkup = choinkTemplate.fmt('100', 'sc-slider-step-mark-last');
      handle.before(choinkMarkup);
    }

    // Update the value, if needed.
    if (dataSource.didChangeFor('sliderRenderDelegateValue', 'value')) {
      var value = dataSource.get('value');
      handle.css('left', value + "%");
    }
  },

  // The justification for this tremendous hack is that render delegates are going away, so reaching directly into the
  // view from here won't be a profound treason against separation of concerns for long.
  _displayValueForValue: function (dataSource, value) {
    return dataSource._view._displayValueForValue(value);
  }

});
