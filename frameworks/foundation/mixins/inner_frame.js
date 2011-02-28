// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2010 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

SC.SCALE_NONE = "none";
SC.FILL = "fill";
SC.FILL_PROPORTIONALLY = "fillProportionally";
SC.BEST_FIT = "fitBest";
SC.BEST_FIT_DOWN_ONLY = "fitBestDown";

/**
  InnerFrame provides the innerFrameForSize function, which will return a frame for the give size adjusted
  to fit within the view's own frame according to the align and scale properties.

  View's that render images will find this mixin particularly useful for fitting their images.

 */
SC.InnerFrame = {

  /**
    Align the shape within its frame.

    <table>
    <tr><td>SC.ALIGN_TOP_LEFT</td><td>SC.ALIGN_TOP</td><td>SC.ALIGN_TOP_RIGHT</td></tr>
    <tr><td>SC.ALIGN_LEFT</td><td>SC.ALIGN_CENTER/td><td>SC.ALIGN_RIGHT</td></tr>
    <tr><td>SC.ALIGN_BOTTOM_LEFT</td><td>SC.ALIGN_BOTTOM</td><td>SC.ALIGN_BOTTOM_RIGHT</td></tr>
    </table>

    @property {SC.ALIGN_CENTER|SC.ALIGN_TOP_LEFT|SC.ALIGN_TOP|SC.ALIGN_TOP_RIGHT|SC.ALIGN_RIGHT|SC.ALIGN_BOTTOM_RIGHT|SC.BOTTOM|SC.BOTTOM_LEFT|SC.LEFT|Number}
    @default SC.ALIGN_CENTER
  */
  align: SC.ALIGN_CENTER,

  innerFrameForSize: function(innerWidth, innerHeight) {
    var align = this.get('align'),
        scale = this.get('scale'),
        frame = this.get('frame') || { width: 0, height: 0 },  // frame is 'null' until rendered when useStaticLayout
        frameWidth = frame.width,
        frameHeight = frame.height,
        scaleX,
        scaleY,
        result;

    // Fast path
    result = { x: 0, y: 0, width: frameWidth, height: frameHeight };
    if (scale === SC.FILL) return result;

    // Determine the appropriate scale
    scaleX = frameWidth / innerWidth;
    scaleY = frameHeight / innerHeight;

    switch (scale) {
      case SC.FILL_PROPORTIONALLY:
        scale = scaleX > scaleY ? scaleX : scaleY;
        break;
      case SC.BEST_FIT:
        scale = scaleX < scaleY ? scaleX : scaleY;
        break;
      case SC.BEST_FIT_DOWN_ONLY:
        if ((innerWidth > frameWidth) || (innerHeight > frameHeight)) {
          scale = scaleX < scaleY ? scaleX : scaleY;
        } else {
          scale = 1.0;
        }
        break;
      case SC.SCALE_NONE:
        scale = 1.0;
        break;
      default: // Number
        if (isNaN(window.parseFloat(scale)) || (window.parseFloat(scale) <= 0)) {
          SC.Logger.warn("SC.InnerFrame: The scale '%@' was not understood.  Scale must be one of SC.FILL, SC.FILL_PROPORTIONALLY, SC.BEST_FIT, SC.BEST_FIT_DOWN_ONLY or a positive number greater than 0.00.".fmt(scale));

          // Don't attempt to scale or offset the image
          return result;
        }
    }

    innerWidth *= scale;
    innerHeight *= scale;
    result.width = Math.round(innerWidth);
    result.height = Math.round(innerHeight);

    // Align the image within its frame
    switch (align) {
      case SC.ALIGN_LEFT:
        result.x = 0;
        result.y = (frameHeight / 2) - (innerHeight / 2);
        break;
      case SC.ALIGN_RIGHT:
        result.x = frameWidth - innerWidth;
        result.y = (frameHeight / 2) - (innerHeight / 2);
        break;
      case SC.ALIGN_TOP:
        result.x = (frameWidth / 2) - (innerWidth / 2);
        result.y = 0;
        break;
      case SC.ALIGN_BOTTOM:
        result.x = (frameWidth / 2) - (innerWidth / 2);
        result.y = frameHeight - innerHeight;
        break;
      case SC.ALIGN_TOP_LEFT:
        result.x = 0;
        result.y = 0;
        break;
      case SC.ALIGN_TOP_RIGHT:
        result.x = frameWidth - innerWidth;
        result.y = 0;
        break;
      case SC.ALIGN_BOTTOM_LEFT:
        result.x = 0;
        result.y = frameHeight - innerHeight;
        break;
      case SC.ALIGN_BOTTOM_RIGHT:
        result.x = frameWidth - innerWidth;
        result.y = frameHeight - innerHeight;
        break;
      default: // SC.ALIGN_CENTER || SC.ALIGN_MIDDLE
        if (align !== SC.ALIGN_CENTER && align !== SC.ALIGN_MIDDLE) {
          SC.Logger.warn("SC.InnerFrame: The align '%@' was not understood.  Align must be one of SC.ALIGN_CENTER/SC.ALIGN_MIDDLE, SC.ALIGN_LEFT, SC.ALIGN_RIGHT, SC.ALIGN_TOP, SC.ALIGN_BOTTOM, SC.ALIGN_TOP_LEFT, SC.ALIGN_TOP_RIGHT, SC.ALIGN_BOTTOM_LEFT or SC.ALIGN_BOTTOM_RIGHT.".fmt(align));
        }
        result.x = (frameWidth / 2) - (innerWidth / 2);
        result.y = (frameHeight / 2) - (innerHeight / 2);
    }

    return result;
  },

  /**
    Determines how the shape will scale to fit within its containing space.

    Examples:

      SC.SCALE_NONE - don't scale
      SC.FILL - stretch/shrink the shape to fill the frame
      SC.FILL_PROPORTIONALLY - stretch/shrink the shape to fill the frame while maintaining aspect ratio, such
        that the shortest dimension will just fit within the frame and the longest dimension will
        overflow and be cropped
      SC.BEST_FIT - stretch/shrink the shape to fit the frame while maintaining aspect ratio, such that the
        longest dimension will just fit within the frame
      SC.BEST_FIT_DOWN_ONLY - shrink the shape to fit the frame while maintaining aspect ratio, such that
        the longest dimension will just fit within the frame.  Do not stretch the shape if the shape's
        width is less than the frame's width.

    @property {SC.SCALE_NONE|SC.FILL|SC.FILL_PROPORTIONALLY|SC.BEST_FIT|SC.BEST_FIT_DOWN_ONLY|Number}
    @default SC.FILL
  */
  scale: SC.FILL
};