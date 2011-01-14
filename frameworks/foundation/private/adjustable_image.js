// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2010 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2010 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/**
  @ignore

  The SC.AdjustableImage mixin is used by the imageRenderDelegate and canvasImageRenderDelegate
  in order to calculate the proper image dimensions based on the provided scale & offset values.

  This mixin is not a separate file within the mixins directory, because it is very specific
  to these two renderers and exists to prevent code duplication between the two.
  */
SC.AdjustableImage = {
  calculateImageRect: function(image, frame, scale, offsetX, offsetY) {
    var result,
        imageWidth = image.width,
        imageHeight = image.height,
        scaleX,
        scaleY;

    // Fast path
    result = { x: offsetX, y: offsetY, width: frame.width , height: frame.height };
    if (scale === SC.FILL) return result;

    // Determine the appropriate scale
    scaleX = frame.width / imageWidth;
    scaleY = frame.height / imageHeight;

    if (scale === SC.FIT_WIDTH) {
      scale = scaleX;
    } else if (scale === SC.FIT_HEIGHT) {
      scale = scaleY;
    } else if (scale === SC.FIT_SMALLEST) {
      scale = scaleX > scaleY ? scaleX : scaleY;
    } else if (scale === SC.FIT_LARGEST) {
      scale = scaleX < scaleY ? scaleX : scaleY;
    } else if ((SC.typeOf(scale) !== SC.T_NUMBER) || ((SC.typeOf(scale) === SC.T_NUMBER) && (scale < 0))) {
      SC.Logger.warn("SC.AdjustableImage: scale must be one of SC.FILL, SC.FIT_WIDTH, SC.FIT_HEIGHT, SC.FIT_SMALLEST, SC.FIT_LARGEST or a number greater than 0.00".fmt(this));

      // Don't attempt to scale or offset the image
      return result;
    }

    // Scale the image according to the scale parameter
    imageWidth *= scale;
    imageHeight *= scale;
    result.width = imageWidth;
    result.height = imageHeight;

    // Center the image within its frame
    result.x = Math.round((frame.width / 2) - (imageWidth / 2));
    result.y = Math.round((frame.height / 2) - (imageHeight / 2));

    // Offset the image as specified
    result.x = result.x + offsetX;
    result.y = result.y + offsetY;

    return result;
  }
};