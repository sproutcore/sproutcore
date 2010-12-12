// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/**
  Renders and updates the HTML representation of SC.SegmentedView.
*/
SC.BaseTheme.segmentedRenderDelegate = SC.Object.create({
  
  /*
    We render everything external to the segments and let each segment use it's own render
    delegate to render its contents.
    
    */
  render: function(dataSource, context) {  
    var displayProperties = dataSource.getDisplayProperties();
    
    // Use text-align to align the segments
    context.addStyle('text-align', displayProperties.align);
  },
  
  update: function(dataSource, jquery) {
    var changedDisplayProperties = dataSource.getChangedDisplayProperties();
    
    if (changedDisplayProperties.contains('align')) {
      jquery.css('text-align', changedDisplayProperties.align);
    }
  },
  
  /**
    Return the DOM elements of the segments.  This will be measured by the view to 
    determine which segments should be overflowed.
  */
  segmentLayers: function(dataSource) {
    return dataSource.$('.sc-segment');
  },

  indexForClientPosition: function(dataSource, x, y) {
    var segmentLayers = dataSource.$('.sc-segment'), 
        length, i,
        segmentLayer, rect,
        point;
    
    point = {x: x, y: y};
    for (i = 0, length = segmentLayers.length; i < length; i++) {
      segmentLayer = segmentLayers[i];
      rect = segmentLayer.getBoundingClientRect();
      
      // Convert client rect into standard rect
      rect.x = rect.left;
      rect.y = rect.top;
      
      // Return the index early if found
      if (SC.pointInRect(point, rect)) return i;
    }
    
    // Default not found
    return -1;
  }
});