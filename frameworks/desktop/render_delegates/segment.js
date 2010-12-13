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

  render: function(dataSource, context) {
    var displayProperties = dataSource.getDisplayProperties(), // Properties of the data source that affect the rendered output
    theme = dataSource.get('theme'),
    buttonDelegate,
    classes;

    // Segment specific additions
    classes = {
      'sc-segment': YES,
      'sc-first-segment': displayProperties.isFirstSegment,
      'sc-middle-segment': displayProperties.isMiddleSegment,
      'sc-last-segment': displayProperties.isLastSegment,
      'sc-overflow-segment': displayProperties.isOverflowSegment
    };
    classes['sc-segment-' + displayProperties.index] = YES;
    context.setClass(classes);

    // Use the SC.ButtonView render delegate for the current theme to render the segment as a button
    buttonDelegate = theme['buttonRenderDelegate'];
    buttonDelegate.render(dataSource, context);
  },

  update: function(dataSource, jquery) {
    var displayProperties = dataSource.getDisplayProperties(),
        changedDisplayProperties = dataSource.getChangedDisplayProperties(),
        theme = dataSource.get('theme'),
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
      'sc-first-segment': displayProperties.isFirstSegment,
      'sc-middle-segment': displayProperties.isMiddleSegment,
      'sc-last-segment': displayProperties.isLastSegment,
      'sc-overflow-segment': displayProperties.isOverflowSegment
    };
    classes['sc-segment-' + displayProperties.index] = YES;
    jquery.setClass(classes);
    
    // Use the SC.ButtonView render delegate for the current theme to update the segment as a button
    buttonDelegate = theme['buttonRenderDelegate'];
    
    // 1. This should be the proper way to do it, but getChangedDisplayProperties() when called in the button delegate will show no changes
    // buttonDelegate.update(originalDataSource, jquery);
    // 2. So do it ourselves
    if (changedDisplayProperties.contains('titleMinWidth')) {
      titleMinWidth = (displayProperties.titleMinWidth ? displayProperties.titleMinWidth + "px" : null);
      jquery.find('.sc-button-inner').css('min-width', titleMinWidth);
    }
    if (changedDisplayProperties.contains('title', 'isActive')) {
      jquery.find('label').html(buttonDelegate._htmlForTitleAndIcon(displayProperties));
    }
  }

});
