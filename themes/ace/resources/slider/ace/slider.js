// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
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

SC.AceTheme.sliderRenderDelegate = SC.Object.create({
  
  name: 'slider',
  
  render: function(dataSource, context) {
    var blankImage = SC.BLANK_IMAGE_URL;
    
    context = context.begin('span').addClass('track');
    dataSource.get('theme').slicesRenderDelegate.render(SC.THREE_SLICE, context);
    context = context.end();
    
    context.push(
      '<img src="', blankImage, 
      '" class="sc-handle" style="left: ', dataSource.get('value'), '%" />',
      '</span>'
    );
    
    dataSource.get('renderState')._cachedHandle = null;
  },
  
  update: function(dataSource, jquery) {
    if (dataSource.didChangeFor('sliderRenderDelegate', 'value')) {
      var handle = dataSource.get('renderState')._cachedHandle;
      if (!handle) handle = dataSource.get('renderState')._cachedHandle = jquery.find('.sc-handle');
      
      handle.css('left', dataSource.get('value') + "%");
    }
  }
  
});
