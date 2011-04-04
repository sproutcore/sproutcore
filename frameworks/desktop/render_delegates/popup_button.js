// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================


/**
 * Renders and updates the HTML representation of a popup button.
 */
SC.BaseTheme.popupButtonRenderDelegate = SC.RenderDelegate.create({
  render: function(dataSource, context) {
    context.attr('aria-haspopup', 'true');
    dataSource.get('theme').buttonRenderDelegate.render(dataSource, context);
  },

  update: function(dataSource, jQuery) {
    dataSource.get('theme').buttonRenderDelegate.update(dataSource, jQuery);
  }
});
