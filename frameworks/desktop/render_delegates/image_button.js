// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple Inc. All rights reserved.
// License:   Licened under MIT license (see license.js)
// ==========================================================================

SC.BaseTheme.imageButtonRenderDelegate = SC.RenderDelegate.create({
  render: function(dataSource, context) {
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
    if (dataSource.didChangeFor('imageButtonRenderDelegate', 'image')) {
      var image = dataSource.get('image');

      $.children()[0].className = 'img '+image;
    }
  }
});