// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2009 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/**
  Renders and updates the HTML representation of SC.SegmentedView.
*/
SC.BaseTheme.segmentedRenderDelegate = SC.Object.create({
  name: 'segmented',

  /*
    We render everything external to the segments and let each segment use it's own render
    delegate to render its contents.

    */
  render: function(dataSource, context) {
    // Use text-align to align the segments
    context.addStyle('text-align', dataSource.get('align'));
  },

  update: function(dataSource, jquery) {
    jquery.css('text-align', dataSource.get('align'));
  },

  /**
    Return the widths of the DOM elements of the segments.  This will be measured by the view to
    determine which segments should be overflowed.

    It ignores the last segment (the overflow segment).
  */
  segmentWidths: function(dataSource) {
    var elements = dataSource.$('.sc-segment-view'),
        el,
        widths = [];

    for (var i = 0, length = elements.length; i < length - 1; i++) {
      el = elements[i];
      widths[i] = el.getBoundingClientRect().width;
    }

    return widths;
  },

  overflowSegmentWidth: function(dataSource) {
    var elements = dataSource.$('.sc-segment-view'),
        el;

    el = elements[elements.length - 1];

    return el.getBoundingClientRect().width;
  },

  indexForClientPosition: function(dataSource, x, y) {
    var segmentLayers = dataSource.$('.sc-segment-view'),
        length, i,
        segmentLayer, rect,
        point;

    point = {x: x, y: y};
    for (i = 0, length = segmentLayers.length; i < length; i++) {
      segmentLayer = segmentLayers[i];
      rect = segmentLayer.getBoundingClientRect();

      // Convert client rect into standard rect
      //rect.x = rect.left;
      //rect.y = rect.top;
      // IE8 won't let us add x and y to the rect
      var naiveRectFix = {x:rect.left, y: rect.top, width: (rect.right-rect.left), height: (rect.bottom - rect.top)};


      // Return the index early if found
      if (SC.pointInRect(point, naiveRectFix)) return i;
    }

    // Default not found
    return -1;
  }
});
