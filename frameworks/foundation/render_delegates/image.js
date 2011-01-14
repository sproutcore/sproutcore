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

  - imageValue: A String which represents the src or CSS class of the image
  - displayToolTip: A String which is rendered as a toolTip on the element
  - type: The type of image being rendered. One of:
              - SC.IMAGE_TYPE_NONE
              - SC.IMAGE_TYPE_URL
              - SC.IMAGE_TYPE_CSS_CLASS
          If not provided, SC.IMAGE_TYPE_URL is the default
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
  - rotation: If provided, the image will be rotated by this amount in degrees (WebKit only)
*/

SC.BaseTheme.imageRenderDelegate = SC.RenderDelegate.create(SC.AdjustableImage, {
  name: 'image',

  render: function(dataSource, context) {
    var image = dataSource.get('image'),
        imageValue = dataSource.get('imageValue'),
        type = dataSource.get('type') || SC.IMAGE_TYPE_URL,
        toolTip = dataSource.get('displayToolTip'),
        frame = {width: dataSource.get('width') || 0, height: dataSource.get('height') || 0},
        scale = dataSource.get('scale') || SC.FILL,
        offsetX = dataSource.get('offsetX') || 0,
        offsetY = dataSource.get('offsetY') || 0,
        rotation =  dataSource.get('rotation') || 0,
        imageRect;

    // Place the img within a div, so that we may scale & offset the img
    context = context.begin('img');
    context.attr('src', image.src);

    if (imageValue && type === SC.IMAGE_TYPE_CSS_CLASS) {
      context.addClass(imageValue);
      this._last_class = imageValue;
    }

    if (toolTip) {
      context.attr('title', toolTip);
      context.attr('alt', toolTip);
    }

    // Adjust the layout of the img
    imageRect = this.calculateImageRect(image, frame, scale, offsetX, offsetY);
    context.addStyle({
      'position': 'absolute',
      'left': imageRect.x,
      'top': imageRect.y,
      'width': imageRect.width,
      'height': imageRect.height,
      '-webkit-transform': 'rotateZ(%@deg)'.fmt(rotation)
    });

    context = context.end();
  },

  update: function(dataSource, jquery) {
    var image = dataSource.get('image'),
        imageValue = dataSource.get('imageValue'),
        type = dataSource.get('type') || SC.IMAGE_TYPE_URL,
        toolTip = dataSource.get('displayToolTip'),
        frame = {width: dataSource.get('width') || 0, height: dataSource.get('height') || 0},
        scale = dataSource.get('scale') || SC.FILL,
        offsetX = dataSource.get('offsetX') || 0,
        offsetY = dataSource.get('offsetY') || 0,
        rotation =  dataSource.get('rotation') || 0,
        imageRect;

    jquery = jquery.find('img');
    jquery.attr('src', image.src);

    if (imageValue !== this._last_class) jquery.setClass(this._last_class, NO);
    jquery.addClass(imageValue);
    this._last_class = imageValue;

    if (toolTip) {
      jquery.attr('title', toolTip);
      jquery.attr('alt', toolTip);
    }

    // Adjust the layout of the img
    imageRect = this.calculateImageRect(image, frame, scale, offsetX, offsetY);
    jquery.css({
      'position': 'absolute',
      'left': imageRect.x,
      'top': imageRect.y,
      'width': imageRect.width,
      'height': imageRect.height,
      '-webkit-transform': 'rotateZ(%@deg)'.fmt(rotation)
    });
  }

});