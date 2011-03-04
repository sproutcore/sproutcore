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
  InnerFrame provides the innerFrameForSize function, which will return a frame for the given size adjusted
  to fit within the given outer size, according to the align and scale properties.

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

  /**
    Return a frame (x, y, width, height) fitting the size innerWidth & innerHeight within the size
    outerWidth & outerHeight according to the align and scale properties.  This is essential to
    positioning child views or elements within parent views or elements in more elegant ways.

    Examples using 'align' on a 10x10px inner size within a 20x20px outer size ('scale' = SC.SCALE_NONE):

    <table>
    <tr><th>'align'</th><th>innerFrameForSize(10, 10, 20, 20)</th></tr>
    <tr><td>SC.ALIGN_TOP_LEFT</td><td>{x: 0, y: 0, width: 10, height: 10}</td></tr>
    <tr><td>SC.ALIGN_TOP</td><td>{x: 5, y: 0, width: 10, height: 10}</td></tr>
    <tr><td>SC.ALIGN_TOP_RIGHT</td><td>{x: 10, y: 0, width: 10, height: 10}</td></tr>
    <tr><td>SC.ALIGN_LEFT</td><td>{x: 0, y: 5, width: 10, height: 10}</td></tr>
    <tr><td>SC.ALIGN_CENTER</td><td>{x: 5, y: 5, width: 10, height: 10}</td></tr>
    <tr><td>SC.ALIGN_RIGHT</td><td>{x: 10, y: 5, width: 10, height: 10}</td></tr>
    <tr><td>SC.ALIGN_BOTTOM_LEFT</td><td>{x: 0, y: 10, width: 10, height: 10}</td></tr>
    <tr><td>SC.ALIGN_BOTTOM</td><td>{x: 5, y: 10, width: 10, height: 10}</td></tr>
    <tr><td>SC.ALIGN_BOTTOM_RIGHT</td><td>{x: 10, y: 10, width: 10, height: 10}</td></tr>
    </table>


    Examples using 'scale' on a 10x15px inner size within a 20x20px outer size ('align' = SC.ALIGN_CENTER):

    <table>
    <tr><th>'scale'</th><th>innerFrameForSize(10, 15, 20, 20)</th></tr>
    <tr><td>SC.SCALE_NONE</td><td>{x: 5, y: 5, width: 10, height: 10}</td></tr>
    <tr><td>SC.FILL</td><td>{x: 0, y: 0, width: 20, height: 20}</td></tr>
    <tr><td>SC.FILL_PROPORTIONALLY</td><td>{x: 0, y: -5, width: 20, height: 30}</td></tr>
    <tr><td>SC.BEST_FIT</td><td>{x: 3, y: 0, width: 13, height: 20}</td></tr>
    <tr><td>SC.BEST_FIT_DOWN_ONLY</td><td>{x: 5, y: 3, width: 10, height: 15}</td></tr>
    </table>

    @returns {Object} the inner frame with properties: {x: value, y: value, width: value, height: value }
   */

  innerFrameForSize: function(innerWidth, innerHeight, outerWidth, outerHeight) {
    var align = this.get('align'),
        scale = this.get('scale'),
        scaleX,
        scaleY,
        result;

    // Fast path
    result = { x: 0, y: 0, width: outerWidth, height: outerHeight };
    if (scale === SC.FILL) return result;

    // Determine the appropriate scale
    scaleX = outerWidth / innerWidth;
    scaleY = outerHeight / innerHeight;

    switch (scale) {
      case SC.FILL_PROPORTIONALLY:
        scale = scaleX > scaleY ? scaleX : scaleY;
        break;
      case SC.BEST_FIT:
        scale = scaleX < scaleY ? scaleX : scaleY;
        break;
      case SC.BEST_FIT_DOWN_ONLY:
        if ((innerWidth > outerWidth) || (innerHeight > outerHeight)) {
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
        result.y = (outerHeight / 2) - (innerHeight / 2);
        break;
      case SC.ALIGN_RIGHT:
        result.x = outerWidth - innerWidth;
        result.y = (outerHeight / 2) - (innerHeight / 2);
        break;
      case SC.ALIGN_TOP:
        result.x = (outerWidth / 2) - (innerWidth / 2);
        result.y = 0;
        break;
      case SC.ALIGN_BOTTOM:
        result.x = (outerWidth / 2) - (innerWidth / 2);
        result.y = outerHeight - innerHeight;
        break;
      case SC.ALIGN_TOP_LEFT:
        result.x = 0;
        result.y = 0;
        break;
      case SC.ALIGN_TOP_RIGHT:
        result.x = outerWidth - innerWidth;
        result.y = 0;
        break;
      case SC.ALIGN_BOTTOM_LEFT:
        result.x = 0;
        result.y = outerHeight - innerHeight;
        break;
      case SC.ALIGN_BOTTOM_RIGHT:
        result.x = outerWidth - innerWidth;
        result.y = outerHeight - innerHeight;
        break;
      default: // SC.ALIGN_CENTER || SC.ALIGN_MIDDLE
        if (align !== SC.ALIGN_CENTER && align !== SC.ALIGN_MIDDLE) {
          SC.Logger.warn("SC.InnerFrame: The align '%@' was not understood.  Align must be one of SC.ALIGN_CENTER/SC.ALIGN_MIDDLE, SC.ALIGN_LEFT, SC.ALIGN_RIGHT, SC.ALIGN_TOP, SC.ALIGN_BOTTOM, SC.ALIGN_TOP_LEFT, SC.ALIGN_TOP_RIGHT, SC.ALIGN_BOTTOM_LEFT or SC.ALIGN_BOTTOM_RIGHT.".fmt(align));
        }
        result.x = (outerWidth / 2) - (innerWidth / 2);
        result.y = (outerHeight / 2) - (innerHeight / 2);
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