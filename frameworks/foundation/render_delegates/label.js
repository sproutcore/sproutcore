// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple Inc. All rights reserved.
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
  name: 'label',
  
  render: function(dataSource, context) {
    var view = dataSource.get('view'),
        ariaLabeledBy;

    if(view) {
      ariaLabeledBy = view.get('ariaLabeledBy');
    }

    // CONSIDER DEPRECATING THESE PROPERTIES BECAUSE THEY ARE
    // ANNOYING PAINS IN THE BUTT THAT EVERYONE HATES
    context.addStyle({
      'textAlign': dataSource.get('textAlign'),
      'fontWeight': dataSource.get('fontWeight')
    });
    
    context.setClass('ellipsis', dataSource.get('needsEllipsis') || NO);
    context.setClass('icon', dataSource.get('icon') || NO);

    //addressing accessibility
    if(ariaLabeledBy && ariaLabeledBy !== "") {
      context.attr('aria-labelledby', ariaLabeledBy);
    }
    
    var html = this._htmlForTitleAndIcon(dataSource);
    context.push(html);
    
    // we could use didChangeFor, but in this case, checking the generated
    // HTML will probably be faster (and definitely be simpler)
    // because several properties are used.
    dataSource.get('renderState')._lastHTMLForTitleAndIcon = html;
  },
  
  update: function(dataSource, jquery) {
    var view = dataSource.get('view'),
        ariaLabeledBy;

    if(view) {
      ariaLabeledBy = view.get('ariaLabeledBy');
    }

    // CONSIDER DEPRECATING THESE PROPERTIES BECAUSE THEY ARE
    // ANNOYING PAINS IN THE BUTT THAT EVERYONE HATES
    jquery.css({
      'textAlign': dataSource.get('textAlign') || null,
      'fontWeight': dataSource.get('fontWeight') || null
    });
    
    jquery.setClass('ellipsis', dataSource.get('needsEllipsis') || NO);

    //addressing accessibility
    if(ariaLabeledBy && ariaLabeledBy !== "") {
      jquery.attr('aria-labelledby', ariaLabeledBy);
    }

    var html = this._htmlForTitleAndIcon(dataSource);
    if (dataSource.get('renderState')._lastHTMLForTitleAndIcon !== html) {
      jquery.html(html);
      dataSource.get('renderState')._lastHTMLForTitleAndIcon = html;
    }
  },
  
  _htmlForTitleAndIcon: function(dataSource) {
    var title = dataSource.get('title'),
        hint = dataSource.get('hint'),
        escapeHTML = dataSource.get('escapeHTML'),
        icon = dataSource.get('icon') || '';

    // Escape the title of the button if needed. This prevents potential
    // XSS attacks.
    if (title && escapeHTML) {
      title = SC.RenderContext.escapeHTML(title) ;
    }

    if (hint && !title) {
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
        icon = '<img src="'+SC.BLANK_IMAGE_URL+'" alt="" class="icon '+icon+'" />';
      }
    }
    
    return icon + title;
  }
  
});