// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================


SC.BaseTheme.imageButtonRenderDelegate = SC.RenderDelegate.create({
  name: 'image-button',
  render: function(dataSource, context) {
    // render controlSize
    this.addSizeClassName(dataSource, context);

    var image = dataSource.get('image');

    context.addClass('no-min-width');
    if (image) {
      context.push("<div class='img "+image+"'></div>");
    }

    else {
      context.push("<div class='img'></div>");
    }
  },

  update: function(dataSource, $) {
    this.updateSizeClassName(dataSource, $);

    if (dataSource.didChangeFor('imageButtonRenderDelegate', 'image')) {
      var image = dataSource.get('image');

      $.children()[0].className = 'img '+image;
    }
  }
});
