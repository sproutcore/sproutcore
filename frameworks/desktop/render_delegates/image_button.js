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
        toolTip = dataSource.get('toolTip'),
        classNames = ['img'];

    // render controlSize
    this.addSizeClassName(dataSource, context);

    context.addClass('no-min-width');

    if (toolTip) {
      context.attr('title', toolTip);
      context.attr('alt', toolTip);
    }

    if (image) {
      classNames.push(image);
    }
    context.addClass(classNames);
  },

  update: function(dataSource, $) {
    var image = dataSource.get('image'),
        toolTip, classNames = ['img'];

    this.updateSizeClassName(dataSource, $);

    if (dataSource.didChangeFor('imageButtonRenderDelegate', 'toolTip')) {
      toolTip = dataSource.get('toolTip');

      $.attr('title', toolTip);
      $.attr('alt', toolTip);
    }

    if (image) {
      classNames.push(image);
    }

    $.addClass(classNames);
  }
});
