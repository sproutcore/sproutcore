// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/**
  Renders and updates the HTML representation of SC.ButtonView.
*/
SC.BaseTheme.buttonRenderDelegate = SC.Object.create({
  /**
    Called when we need to create the HTML that represents the button.

    @param {SC.Object} dataSource the object containing the information on how to render the button
    @param {SC.RenderContext} context the render context instance
  */
  render: function(dataSource, context) {
    var minWidth          = dataSource.get('titleMinWidth');
    var labelContent;
    
    context.setClass('def', dataSource.get('isDefault'));
    context.setClass('cancel', dataSource.get('isCancel'));

    // Add an icon class name to the button if it contains an icon in its
    // title.
    context.setClass('icon', !!dataSource.get('icon'));

    // Specify a minimum width for the inner part of the button.
    minWidth = (minWidth ? "style='min-width: " + minWidth + "px'" : '');
    context = context.push("<span class='sc-button-inner' " + minWidth + ">");

    // Create the inner label element that contains the text and, optionally,
    // an icon.
    context = context.begin('label').addClass('sc-button-label');
    dataSource.get('theme').labelRenderDelegate.render(dataSource, context);
    context = context.end();
    
    context.push("</span>");

    if (dataSource.get('supportFocusRing')) {
      context.push('<div class="focus-ring">',
                    '<div class="focus-left"></div>',
                    '<div class="focus-middle"></div>',
                    '<div class="focus-right"></div></div>');
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
    
    jquery.setClass('def', dataSource.get('isDefault'));
    jquery.setClass('cancel', dataSource.get('isCancel'));

    dataSource.get('theme').labelRenderDelegate.update(dataSource, jquery.find('label'));
  }
  
});
