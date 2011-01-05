// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/**
  Renders and updates the HTML representation of a segment child view within
  SC.SegmentedView.
*/
SC.BaseTheme.segmentRenderDelegate = SC.Object.create({
  name: 'segment',
  
  render: function(dataSource, context) {
    var theme = dataSource.get('theme'),
        buttonDelegate,
        classes;

    // Segment specific additions
    classes = {
      'sc-segment': YES,
      'sc-first-segment': dataSource.get('isFirstSegment'),
      'sc-middle-segment': dataSource.get('isMiddleSegment'),
      'sc-last-segment': dataSource.get('isLastSegment'),
      'sc-overflow-segment': dataSource.get('isOverflowSegment')
    };
    classes['sc-segment-' + dataSource.get('index')] = YES;
    context.setClass(classes);

    // Use the SC.ButtonView render delegate for the current theme to render the segment as a button
    buttonDelegate = theme.buttonRenderDelegate;
    buttonDelegate.render(dataSource, context);
  },

  update: function(dataSource, jquery) {
    var theme = dataSource.get('theme'),
        buttonDelegate,
        titleMinWidth,
        classes = {};

    // Segment specific additions
    // 1. This should be the proper way to do it, only update the classes if necessary, but SC.View will reset all the classes that we added in render!
    // if (displayProperties.contains('index', 'isFirstSegment', 'isMiddleSegment', 'isLastSegment', 'isOverflowSegment')) {
    //   
    //   if (displayProperties.index) classes['sc-segment-' + displayProperties.index] = YES;
    //   if (displayProperties.isFirstSegment) classes['sc-first-segment'] = displayProperties.isFirstSegment;
    //   if (displayProperties.isMiddleSegment) classes['sc-middle-segment'] = displayProperties.isMiddleSegment;
    //   if (displayProperties.isLastSegment) classes['sc-last-segment'] = displayProperties.isLastSegment;
    //   if (displayProperties.isOverflowSegment) classes['sc-overflow-segment'] = displayProperties.isOverflowSegment;
    //   
    //   jquery.setClass(classes);
    // }
    // 2. So just re-assign them (even if unchanged)
    classes = {
      'sc-segment': YES,
      'sc-first-segment': dataSource.get('isFirstSegment'),
      'sc-middle-segment': dataSource.get('isMiddleSegment'),
      'sc-last-segment': dataSource.get('isLastSegment'),
      'sc-overflow-segment': dataSource.get('isOverflowSegment') || NO
    };
    classes['sc-segment-' + dataSource.get('index')] = YES;
    jquery.setClass(classes);
    
    // Use the SC.ButtonView render delegate for the current theme to update the segment as a button
    buttonDelegate = theme['buttonRenderDelegate'];
    buttonDelegate.update(dataSource, jquery);
  }

});
