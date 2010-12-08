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
    labelContent = this._htmlForTitleAndIcon(dataSource);
    context.push(labelContent);

    // By adding the 'ellipsis' class, the text-overflow: ellipsis CSS
    // rule will be applied.
    if (dataSource.get('needsEllipsis')){
      context.addClass('ellipsis');
    }

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

    if (dataSource.didChangeFor('buttonRenderDelegate', 'title', 'isActive')) {
      jquery.find('label').html(this._htmlForTitleAndIcon(dataSource));
    }
  },

  /**
    Returns the HTML for the button's label, which can include a title and
    an icon.

    @param {Object} dataSource the object containing the properties needed to generate the label
    @returns {String} a string of HTML
  */
  _htmlForTitleAndIcon: function(dataSource) {
    var title = dataSource.get('title'),
        titleMinWidth = dataSource.get('titleMinWidth'),
        hint = dataSource.get('hint'),
        escapeHTML = dataSource.get('escapeHTML'),
        icon = dataSource.get('icon') || '';

    // Escape the title of the button if needed. This prevents potential
    // XSS attacks.
    if (title && escapeHTML) {
      title = SC.RenderContext.escapeHTML(title) ;
    }

    if (hint && !title) {
      if (escapeHTML) {
        hint = SC.RenderContext.escapeHTML(hint);
      }
      title = "<span class='sc-hint'>" + hint + "</span>";
    }

    if (icon) {
      // If the icon property is the path to an image, create an image tag
      // that points to that URL.
      if (icon.indexOf('/') >= 0) {
        icon = '<img src="'+icon+'" alt="" class="icon" />';

      // Otherwise, the icon property is a class name that should be added
      // to the image tag. Display a blank image so that the user can add
      // background image using CSS.
      } else {
        icon = '<img src="'+SC.BLANK_IMAGE_URL+'" alt="" class="'+icon+'" />';
      }
    }

    return icon+title;
  }
});
