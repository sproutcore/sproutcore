// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2010-2011 Strobe Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

sc_require('render_delegates/render_delegate');
sc_require('private/adjustable_image');

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
            - SC.FILL
            - SC.FIT_SMALLEST
            - SC.FIT_LARGEST
            - SC.FIT_WIDTH
            - SC.FIT_HEIGHT
            - percentage {Number}
          If not provided, SC.FILL will be the default (ie. expected image behaviour)
  - offsetX: If provided, the image will be offset horizontally by this amount
  - offsetY: If provided, the image will be offset vertically by this amount
  - backgroundColor: If provided, the canvas will render a backgroundColor
*/

SC.BaseTheme.canvasImageRenderDelegate = SC.RenderDelegate.create(SC.AdjustableImage, {
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
        scale = dataSource.get('scale') || SC.FILL,
        offsetX = dataSource.get('offsetX') || 0,
        offsetY = dataSource.get('offsetY') || 0,
        rotation =  dataSource.get('rotation') || 0,
        backgroundColor = dataSource.get('backgroundColor'),
        imageRect,
        midX = 0, midY = 0,
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

      if (image && image.complete) {

        imageRect = this.calculateImageRect(image, frame, scale, offsetX, offsetY);

        // For rotation move to the center of the image and then rotate
        if (rotation !== 0) {
          midX = imageRect.width / 2 + imageRect.x;
          midY = imageRect.height / 2 + imageRect.y;
          context.translate(midX, midY);
          context.rotate(rotation * Math.PI / 180);

          imageRect.x = imageRect.x - midX;
          imageRect.y = imageRect.y - midY;
        }

        context.drawImage(image, imageRect.x, imageRect.y, imageRect.width, imageRect.height);
      }
    }
  }

});