// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================


SC.BaseTheme.imageButtonRenderDelegate = SC.RenderDelegate.create({
  name: 'image-button',

  render: function(dataSource, context) {
    var image = dataSource.get('image'),
        toolTip = dataSource.get('toolTip');

    // render controlSize
    this.addSizeClassName(dataSource, context);

    context.addClass('no-min-width');

    if (toolTip) {
      context.attr('title', toolTip);
      context.attr('alt', toolTip);
    }

    if (image) {
      context.push("<div class='img "+image+"'></div>");
    } else {
      context.push("<div class='img'></div>");
    }
  },

  update: function(dataSource, $) {
    var image, toolTip;

    this.updateSizeClassName(dataSource, $);

    if (dataSource.didChangeFor('imageButtonRenderDelegate', 'toolTip')) {
      toolTip = dataSource.get('toolTip');

      $.attr('title', toolTip);
      $.attr('alt', toolTip);
    }

    if (dataSource.didChangeFor('imageButtonRenderDelegate', 'image')) {
      image = dataSource.get('image');

      $.children()[0].className = 'img '+image;
    }
  }
});
