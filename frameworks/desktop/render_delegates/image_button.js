// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================


SC.BaseTheme.imageButtonRenderDelegate = SC.RenderDelegate.create({
  className: 'image-button',

  render: function (dataSource, context) {
    var image = dataSource.get('image'),
      toolTip = dataSource.get('toolTip');

    if (toolTip) {
      context.setAttr('title', toolTip);
      context.setAttr('alt', toolTip);
    }


    if (image) {
      context.addClass(image);

      // Track the image class used so that we can remove it when it changes.
      dataSource.renderState._cachedImage = image;
    }
  },

  update: function (dataSource, $) {
    var image, toolTip;

    if (dataSource.didChangeFor('imageButtonRenderDelegate', 'toolTip')) {
      toolTip = dataSource.get('toolTip');

      $.attr('title', toolTip);
      $.attr('alt', toolTip);
    }

    if (dataSource.didChangeFor('imageButtonRenderDelegate', 'image')) {
      image = dataSource.get('image');

      // Remove the last image class and add the new one.
      $.removeClass(dataSource.renderState._cachedImage);
      $.addClass(image);

      // Track the image class used so that we can remove it when it changes.
      dataSource.renderState._cachedImage = image;
    }
  }
});
