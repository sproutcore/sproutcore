// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/**
  Renders and updates the HTML representation of SC.SegmentedView.
*/
SC.BaseTheme.segmentedRenderDelegate = SC.RenderDelegate.create({
  className: 'segmented',

  /*
    We render everything external to the segments and let each segment use it's own render
    delegate to render its contents.

    */
  render: function (dataSource, context) {
    var items = dataSource.get('items'),
      length = 0;

    // Use text-align to align the segments
    this.addSizeClassName(dataSource, context);
    context.addStyle('text-align', dataSource.get('align'));

    if (items) {
      length = items.get('length');
      context.addClass('sc-length-' + length);
    }

    // Cache the last length so that we can remove this class name.
    dataSource.renderState._sc_last_length = length;
  },

  update: function (dataSource, jquery) {
    var items = dataSource.get('items'),
      lastLength = dataSource.renderState._sc_last_length,
      length;

    this.updateSizeClassName(dataSource, jquery);
    jquery.css('text-align', dataSource.get('align'));

    if (length !== lastLength) {
      jquery.removeClass('sc-length-' + lastLength);

      if (items) {
        length = items.get('length');
        jquery.addClass('sc-length-' + length);
      }

      // Cache the last length so that we can remove this class name.
      dataSource.renderState._sc_last_length = length;
    }
  }

});
