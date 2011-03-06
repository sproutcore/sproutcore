// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2009 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

SC.BaseTheme.panelRenderDelegate = SC.RenderDelegate.create({
  name: 'panel',
  
  render: function(dataSource, context) {
    context = context.begin('div').addClass('panel-background');
    this.includeSlices(dataSource, context, SC.NINE_SLICE);
    context = context.end();

    // the label for the panel could change...
    var ariaLabel = dataSource.get('ariaLabel');
    context.attr('aria-label', ariaLabel || '');
  },

  update: function(dataSource, jQuery) {
    // the label for the panel could change...
    var ariaLabel = dataSource.get('ariaLabel');
    jQuery.attr('aria-label', ariaLabel || '');

  }
});
