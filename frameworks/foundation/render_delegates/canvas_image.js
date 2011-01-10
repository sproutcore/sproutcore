// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2010-2011 Strobe Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

sc_require('render_delegates/render_delegate');

/**
  @class
  Renders and updates DOM representations of an image.
  
  Parameters
  --------------------------
  Expects these properties on the data source:
  
  - image: An Image object which has completed loading
  
  If any of these are not present in the data source, the render delegate
  will throw an error.
  
  Optional Parameters:
  ---------------------------
  If present, these properties will be used.
  
  - width: Used on the canvas element. If not provided, 0 is used and the canvas
            will not be visible.
  - height: Used on the canvas element. If not provided, 0 is used and the canvas
            will not be visible.
  - fit: If provided, the image will maintain aspect ratio as specified by this
          property. One of
            - SC.FILL
            - SC.BEST_FIT
            - SC.FIT_WIDTH
            - SC.FIT_HEIGHT
          If not provided, SC.FILL will be the default (ie. expected image behaviour)
  - backgroundColor: If provided, the canvas will render a backgroundColor
*/

SC.BaseTheme.canvasImageRenderDelegate = SC.RenderDelegate.create({
  name: 'canvasImage',
  
  /** @private
    We don't have an element yet, so we do the minimal necessary setup
    here.
  */
  render: function(dataSource, context) {
    var width = dataSource.get('width') || 0,
        height = dataSource.get('height') || 0;
    
    context.attr('width', width);
    context.attr('height', height);
  },
  
  update: function(dataSource, jquery) {
    var elem = jquery[0],
        image = dataSource.get('image'),
        frame = {width: dataSource.get('width') || 0, height: dataSource.get('height') || 0},
        fit = dataSource.get('fit') || SC.FILL,
        backgroundColor = dataSource.get('backgroundColor'),
        context;
    
    if (elem && elem.getContext) {
      elem.height = frame.height;
      elem.width = frame.width;
      
      context = elem.getContext('2d');
      
      context.clearRect(0, 0, frame.width, frame.height);
      
      if (backgroundColor) {
        context.fillStyle = backgroundColor;
        context.fillRect(0, 0, frame.width, frame.height);
      }
      
      if (image) {
        frame = this._calculateFitFrame(frame, fit, image.width, image.height);
        context.drawImage(image, 0, 0, image.width, image.height, frame.x, frame.y, frame.width, frame.height);
      }
    }
  },
  
  _calculateFitFrame: function(frame, fit, imageWidth, imageHeight) {
    var containerWidth = frame.width,
        containerHeight = frame.height,
        result = {x: 0, y: 0, width: containerWidth, height: containerHeight},
        scaleX, scaleY, scale;
    
    // fast path
    if (fit === SC.FILL) return result;
    
    scaleX = containerWidth / imageWidth;
    scaleY = containerHeight / imageHeight;
    scale = scaleX < scaleY ? scaleX : scaleY;
    
    if (fit === SC.FIT_WIDTH) {
      scale = scaleX;
    } else if (fit === SC.FIT_HEIGHT) {
      scale = scaleY;
    }
    
    imageWidth *= scale;
    result.width = imageWidth;
    result.x = (containerWidth / 2) - (imageWidth / 2);
    
    imageHeight *= scale;
    result.height = imageHeight;
    result.y = (containerHeight / 2) - (imageHeight / 2);
    
    return result;
  }

});