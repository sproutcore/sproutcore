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
  - scale: If provided, the image will maintain aspect ratio as specified by this
          property. One of
            - SC.SCALE_NONE
            - SC.FILL
            - SC.FILL_PROPORTIONALLY
            - SC.BEST_FIT
            - SC.BEST_FIT_DOWN_ONLY
            - percentage {Number}
          If not provided, SC.FILL will be the default (ie. expected image behaviour)
  - align: If provided, the image will align itself within its frame.  One of
            - SC.ALIGN_CENTER
            - SC.ALIGN_TOP_LEFT
            - SC.ALIGN_TOP
            - SC.ALIGN_TOP_RIGHT
            - SC.ALIGN_RIGHT
            - SC.ALIGN_BOTTOM_RIGHT
            - SC.ALIGN_BOTTOM
            - SC.ALIGN_BOTTOM_LEFT
            - SC.ALIGN_LEFT
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
        frame = dataSource.get('frame'),
        frameWidth = frame.width,
        frameHeight = frame.height,
        innerFrame = dataSource.get('innerFrame'),
        backgroundColor = dataSource.get('backgroundColor'),
        renderState = dataSource.get('renderState'),
        context;

    // We only care about specific values, check specifically for what matters
    var frameDidChange = ![frameWidth, frameHeight].isEqual(renderState._lastFrameValues),
        innerFrameDidChange = ![innerFrame.x, innerFrame.y, innerFrame.width, innerFrame.height].isEqual(renderState._lastInnerFrameValues),
        backgroundDidChange = dataSource.didChangeFor('canvasImageRenderDelegate', 'backgroundColor'),
        imageDidChange = dataSource.didChangeFor('canvasImageRenderDelegate', 'image') || (image && image.complete) !== renderState._lastImageComplete;

    if (frameDidChange || innerFrameDidChange || backgroundDidChange || imageDidChange) {
      if (elem && elem.getContext) {
        elem.height = frameHeight;
        elem.width = frameWidth;

        context = elem.getContext('2d');

        context.clearRect(0, 0, frameWidth, frameHeight);

        if (backgroundColor) {
          context.fillStyle = backgroundColor;
          context.fillRect(0, 0, frameWidth, frameHeight);
        }

        if (image && image.complete) {
          context.drawImage(image, Math.floor(innerFrame.x), Math.floor(innerFrame.y), Math.floor(innerFrame.width), Math.floor(innerFrame.height));
        }
      }

      // Update caches
      renderState._lastFrameValues = [frameWidth, frameHeight];
      renderState._lastInnerFrameValues = [innerFrame.x, innerFrame.y, innerFrame.width, innerFrame.height];
      renderState._lastImageComplete = image && image.complete;
    }
  }

});
