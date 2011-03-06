
// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2009 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================


require("theme");

SC.AceTheme.PointLeft = SC.AceTheme.subtheme("point-left", "point-left");
SC.AceTheme.PointRight = SC.AceTheme.subtheme("point-right", "point-right");
SC.AceTheme.Capsule = SC.AceTheme.subtheme("capsule", "capsule");

/**
  Renders and updates the HTML representation of a button.
*/
SC.BaseTheme.buttonRenderDelegate = SC.RenderDelegate.create({
  name: 'button',
  
  /**
    Called when we need to create the HTML that represents the button.

    @param {SC.Object} dataSource the object containing the information on how to render the button
    @param {SC.RenderContext} context the render context instance
  */
  render: function(dataSource, context) {
    var labelContent,
        toolTip =       dataSource.get('toolTip'),
        isSelected =    dataSource.get('isSelected') || NO,
        isActive =      dataSource.get('isActive') || NO;

    context.setClass({
      'icon': !!dataSource.get('icon') || NO,
      'def': dataSource.get('isDefault'),
      'cancel': dataSource.get('isCancel'),
      'active': isActive,
      'sel': isSelected
    });

    if (toolTip) {
      context.attr('title', toolTip);
      context.attr('alt', toolTip);
    }

    this.includeSlices(dataSource, context, SC.THREE_SLICE);

    // accessibility
    context.attr('aria-pressed', isActive);

    // Create the inner label element that contains the text and, optionally,
    // an icon.
    context = context.begin('label').addClass('sc-button-label');
    dataSource.get('theme').labelRenderDelegate.render(dataSource, context);
    context = context.end();

    if (dataSource.get('supportFocusRing')) {
      context = context.begin('div').addClass('focus-ring');
      this.includeSlices(dataSource, context, SC.THREE_SLICE);
      context = context.end();
    }
  },

  /**
    Called when one or more display properties have changed and we need to
    update the HTML representation with the new values.

    @param {SC.Object} dataSource the object containing the information on how to render the button
    @param {SC.RenderContext} jquery the jQuery object representing the HTML representation of the button
  */
  update: function(dataSource, jquery) {
    if (dataSource.get('isActive')) {
      jquery.addClass('active');
    }
    
    jquery.setClass('icon', !!dataSource.get('icon') || NO);
    jquery.setClass('def', dataSource.get('isDefault') || NO);
    jquery.setClass('cancel', dataSource.get('isCancel') || NO);

    dataSource.get('theme').labelRenderDelegate.update(dataSource, jquery.find('label'));
  }
});
