// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2012 Michael Krotscheck and contributors.
// License:   Licened under MIT license (see license.js)
// ==========================================================================

/**
 * Renders and updates the DOM representation of a media slider.
 *
 * Parameters ------------------------- Requires the following parameters: -
 * `value` -- a value from 0 to 1. - `frame` -- containing the frame in which
 * the slider is being drawn.
 */

SC.BaseTheme.mediaSliderRenderDelegate = SC.RenderDelegate.create({

  className: 'sc-media-slider-view',

  render: function(dataSource, context) {
    this.addSizeClassName(dataSource, context);

    var valueMax = dataSource.get('maximum');
    var valueMin = dataSource.get('minimum');
    var valueNow = dataSource.get('ariaValue');

    // addressing accessibility
    context.setAttr({
      'aria-valuemax': valueMax,
      'aria-valuemin': valueMin,
      'aria-valuenow': valueNow,
      'aria-orientation': 'horizontal'
    });
    if(valueMin !== 0 || valueMax !== 100) {
      context.setAttr('aria-valuetext', valueNow);
    }

    context = context.begin('span').addClass('track');
    context.push('<span class="sc-loaded-ranges"></span>');
    context.push('<div class="sc-handle" style="left: ' + dataSource.get('value') + '%"></div>');

    context = context.end();

    dataSource.get('renderState')._cachedHandle = null;
  },

  update: function(dataSource, jquery) {
    this.updateSizeClassName(dataSource, jquery);

    var valueMax = dataSource.get('maximum');
    var valueMin = dataSource.get('minimum');
    var valueNow = dataSource.get('ariaValue');

    // addressing accessibility
    jquery.attr({
      'aria-valuemax': valueMax,
      'aria-valuemin': valueMin,
      'aria-valuenow': valueNow,
      'aria-orientation': 'horizontal'
    });
    if(valueMin !== 0 || valueMax !== 100) {
      jquery.attr('aria-valuetext', valueNow);
    }

    if(dataSource.didChangeFor('sliderRenderDelegate', 'value')) {
      var handle = dataSource.get('renderState')._cachedHandle;
      if(!handle) {
        handle = dataSource.get('renderState')._cachedHandle = jquery.find('.sc-handle');
      }

      var value = dataSource.get('value');
      handle.css('left', value + "%");
    }
  }

});
