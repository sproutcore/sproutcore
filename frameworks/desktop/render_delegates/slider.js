// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2009 Apple Inc. All rights reserved.
// License:   Licened under MIT license (see license.js)
// ==========================================================================

/**
  Renders and updates the DOM representation of a slider.
  
  Parameters
  -------------------------
  Requires the following parameters:
  
  - value: a value from 0 to 1.
  - frame: containing the frame in which the slider is being drawn.
*/

SC.BaseTheme.sliderRenderDelegate = SC.RenderDelegate.create({
  
  name: 'slider',
  
  render: function(dataSource, context) {
    var blankImage  = SC.BLANK_IMAGE_URL,
        valueMax    = dataSource.get('maximum'),
        valueMin    = dataSource.get('minimum'),
        valueNow    = dataSource.get('value');

    context.push('<span class="sc-inner">',
                  '<span class="sc-leftcap"></span>',
                  '<span class="sc-rightcap"></span>',
                  '<img src="', blankImage, 
                  '" class="sc-handle" style="left: ', dataSource.get('value'), '%" />',
                  '</span>');

    //addressing accessibility
    context.attr('aria-valuemax', valueMax);
    context.attr('aria-valuemin', valueMin);
    context.attr('aria-valuenow', valueNow);
    context.attr('aria-valuetext', valueNow);
    context.attr('aria-orientation', 'horizontal');

  },
  
  update: function(dataSource, jquery) {

    var valueNow    = dataSource.get('value');

    if (dataSource.didChangeFor('sliderRenderDelegate', 'value')) {
      jquery.find(".sc-handle").css('left', dataSource.get('value') + "%");
    }

    //addressing accessibility
    jquery.attr('aria-valuenow', valueNow);
    jquery.attr('aria-valuetext', valueNow);
  }
  
});
