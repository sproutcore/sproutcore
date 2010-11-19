// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple Inc. All rights reserved.
// License:   Licened under MIT license (see license.js)
// ==========================================================================

/**
  Renders an HTML representation of SC.ButtonView.
*/
SC.BaseTheme.buttonRenderDelegate = SC.Object.create({
  render: function(dataSource, context) {
    var displayProperties = dataSource.getDisplayProperties();
    var minWidth          = displayProperties.titleMinWidth;
    var labelContent;

    // Add an icon class name to the button if it contains an icon in its
    // title.
    context.setClass('icon', !!displayProperties.icon);

    // Specify a minimum width for the inner part of the button.
    minWidth = (minWidth ? "style='min-width: " + minWidth + "px'" : '');
    context = context.push("<span class='sc-button-inner' " + minWidth + ">");

    // Create the inner label element that contains the text and, optionally,
    // an icon.
    context = context.begin('label').addClass('sc-button-label');
    labelContent = this._htmlForTitleAndIcon(displayProperties);
    context.push(labelContent);

    // By adding the 'ellipsis' class, the text-overflow: ellipsis CSS
    // rule will be applied.
    if (displayProperties.needsEllipsis){
      context.addClass('ellipsis');
    }

    context = context.end();
    context.push("</span>");

    if (displayProperties.supportFocusRing) {
      context.push('<div class="focus-ring">',
                    '<div class="focus-left"></div>',
                    '<div class="focus-middle"></div>',
                    '<div class="focus-right"></div></div>');
    }
  },

  update: function(dataSource, query) {
    var displayProperties = dataSource.getDisplayProperties();
    var icon              = displayProperties.icon || '';
    var title             = displayProperties.title;
    var titleMinWidth     = displayProperties.titleMinWidth;
    var hint              = displayProperties.hint;
    var escapeHTML        = displayProperties.escapeHTML;
    var minWidth          = displayProperties.titleMinWidth;
    var didChangeForKey   = 'buttonRenderDelegate';

    if (dataSource.didChangeFor(didChangeForKey, 'isActive')) {
      if (displayProperties.isActive) {
        query.addClass('active');
      }
    }

    if (dataSource.didChangeFor(didChangeForKey,'displayTitle','icon')) {
      query.find('label').html(this._htmlForTitleAndIcon(displayProperties));
    }
  },

  _htmlForTitleAndIcon: function(displayProperties) {
    var title = displayProperties.title,
        titleMinWidth = displayProperties.titleMinWidth,
        hint = displayProperties.hint,
        escapeHTML = displayProperties.escapeHTML,
        icon = displayProperties.icon || '';

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
