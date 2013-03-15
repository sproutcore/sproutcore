// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

sc_require('render_delegates/render_delegate');

/**
  @class
  Renders and updates DOM representations of a label.

  Parameters
  --------------------------
  Expects these properties on the data source:

  - title

  If any of these are not present in the data source, the render delegate
  will throw an error.

  Optional Parameters:
  ---------------------------
  If present, these properties will be used.

  - icon: should be either a class name or a URL
  - hint: allows the label to display a hint value if its title is empty.
  - escapeHTML: whether the HTML should be escaped to prevent XSS attacks
    and the like.
  - textAlign
  - fontWeight
  - needsEllipsis: Whether an ellipsis (...) should be added after the title
    if the title is too long.
*/

SC.BaseTheme.labelRenderDelegate = SC.RenderDelegate.create({
  className: 'label',

  render: function(dataSource, context) {
    this.addSizeClassName(dataSource, context);

    var toolTip = dataSource.get('toolTip');
    if (toolTip) {
      context.setAttr('title', toolTip);
    }

    /*
      TODO [CC @ 1.5] These properties have been deprecated. We should remove them
            in the next release
    */
    context.addStyle({
      fontWeight: dataSource.get('fontWeight') || null,
      textAlign: dataSource.get('textAlign') || null
    });

    context.setClass('ellipsis', dataSource.get('needsEllipsis') || NO);
    context.setClass('icon', dataSource.get('icon') || NO);

    var html = this.htmlForTitleAndIcon(dataSource);
    context.push(html);

    // we could use didChangeFor, but in this case, checking the generated
    // HTML will probably be faster (and definitely be simpler)
    // because several properties are used.
    dataSource.get('renderState')._lastHTMLForTitleAndIcon = html;
  },

  update: function(dataSource, jquery) {
    this.updateSizeClassName(dataSource, jquery);

    /*
      TODO [CC @ 1.5] These properties have been deprecated. We should remove them
            in the next release
    */
    jquery.css({
      fontWeight: dataSource.get('fontWeight') || null,
      textAlign: dataSource.get('textAlign') || null
    });

    var toolTip = dataSource.get('toolTip');
    if (toolTip) {
      jquery.attr('title', toolTip);
    }
    else {
      jquery.removeAttr('title');
    }

    jquery.setClass('ellipsis', dataSource.get('needsEllipsis') || NO);

    var html = this.htmlForTitleAndIcon(dataSource);
    if (dataSource.get('renderState')._lastHTMLForTitleAndIcon !== html) {
      jquery.html(html);
      dataSource.get('renderState')._lastHTMLForTitleAndIcon = html;
    }
  },

  /**
    Generates the HTML for the title and icon of the label. Render delegates can
    override this to change how that HTML renders without affecting the rest of the
    rendering of the label.

    @param dataSource The data source that provides the title and icon properties.
    @return the html to use
  */
  htmlForTitleAndIcon: function(dataSource) {
    var title = dataSource.get('title'),
        hint = dataSource.get('hint'),
        hintEnabled = dataSource.get('hintEnabled'),
        escapeHTML = dataSource.get('escapeHTML'),
        icon = dataSource.get('icon') || '';

    // Escape the title of the button if needed. This prevents potential
    // XSS attacks.
    if (title && escapeHTML) {
      title = SC.RenderContext.escapeHTML(title) ;
    }

    if (hintEnabled && hint && !title) {
      if (escapeHTML) hint = SC.RenderContext.escapeHTML(hint);
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
        icon = '<span class="icon '+icon+'"></span>';
      }
    }

    return icon + (SC.none(title) ? '' : title);
  }

});
