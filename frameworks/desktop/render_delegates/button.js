// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2009 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/**
  Renders and updates the HTML representation of SC.ButtonView.
*/
SC.BaseTheme.buttonRenderDelegate = SC.RenderDelegate.create({
  name: 'button',
  
  /**
    Called when we need to create the HTML that represents the button.

    @param {SC.Object} dataSource the object containing the information on how to render the button
    @param {SC.RenderContext} context the render context instance
  */
  render: function(dataSource, context) {
    var theme             = dataSource.get('theme'),
        minWidth          = dataSource.get('titleMinWidth'),
        toolTip           = dataSource.get('displayToolTip'),
        view              = dataSource.get('view'),
        isSelected        = dataSource.get('isSelected'),
        isActive          = dataSource.get('isActive'),
        isPopUpButton     = NO,
        menu              = view.get('menu');

        if(menu) {
          isPopUpButton = YES;
        }

    var labelContent;

    context.setClass('icon', !!dataSource.get('icon') || 0);    
    context.setClass('def', dataSource.get('isDefault') || 0);
    context.setClass('cancel', dataSource.get('isCancel') || 0);
    
    if (toolTip) {
      context.attr('title', toolTip);
      context.attr('alt', toolTip);
    }

    // addressing accessibility
    context.attr('aria-pressed', isActive);
    if(isPopUpButton) {
      context.attr('aria-haspopup', isPopUpButton.toString());
    }
    
    // Specify a minimum width for the inner part of the button.
    minWidth = (minWidth ? "style='min-width: " + minWidth + "px'" : '');
    context = context.push("<span class='sc-button-inner' " + minWidth + ">");

    // Create the inner label element that contains the text and, optionally,
    // an icon.
    context = context.begin('label').addClass('sc-button-label');
    
    // NOTE: we don't add the label class names because button styles its own label.
    theme.labelRenderDelegate.render(dataSource, context);
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
    var theme         = dataSource.get('theme'),
        isSelected    = dataSource.get('isSelected'),
        isActive      = dataSource.get('isActive'),
        view          = dataSource.get('view'),
        menu          = view.get('menu'),
        isPopUpButton = NO;

        if(menu) {
          isPopUpButton = YES;
        }

    if (dataSource.get('isActive')) jquery.addClass('active');
    if (dataSource.get('isDefault')) jquery.addClass('default');
    if (dataSource.get('isCancel')) jquery.addClass('cancel');
    if (dataSource.get('icon')) jquery.addClass('icon');

    // addressing accessibility
    jquery.attr('aria-pressed', isActive);
    if(isPopUpButton) {
      jquery.attr('aria-haspopup', isPopUpButton.toString());
    }
    theme.labelRenderDelegate.update(dataSource, jquery.find('label'));
  }
  
});
