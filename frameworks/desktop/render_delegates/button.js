// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================


/**
  Renders and updates the HTML representation of a button.
*/
SC.BaseTheme.buttonRenderDelegate = SC.RenderDelegate.create({
  name: 'button',

  //
  // SIZE DEFINITIONS
  //
  'sc-small-size': {
    height: 18,
    autoResizePadding: 15
  },

  'sc-regular-size': {
    height: 24,
    autoResizePadding: 20
  },

  'sc-huge-size': {
    height: 30,
    autoResizePadding: 30
  },

  'sc-jumbo-size': {
    height: 44,
    autoResizePadding: 50
  },


  //
  // RENDERING LOGIC
  //

  /**
    Called when we need to create the HTML that represents the button.

    @param {SC.Object} dataSource the object containing the information on how to render the button
    @param {SC.RenderContext} context the render context instance
  */
  render: function(dataSource, context) {
    this.addSizeClassName(dataSource, context);

    var labelContent,
        toolTip     = dataSource.get('toolTip'),
        isSelected  = dataSource.get('isSelected') || NO,
        isActive    = dataSource.get('isActive') || NO,
        labelId     = SC.guidFor(dataSource) + '-label';

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
    context.attr('aria-pressed', isActive.toString());
    context.attr('aria-labelledby', labelId);

    // Create the inner label element that contains the text and, optionally,
    // an icon.
    context = context.begin('label').addClass('sc-button-label').id(labelId);
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
    this.updateSizeClassName(dataSource, jquery);

    if (dataSource.get('isActive')) {
      jquery.addClass('active');
    }

    jquery.attr('aria-pressed', dataSource.get('isActive').toString());

    jquery.setClass('icon', !!dataSource.get('icon') || NO);
    jquery.setClass('def', dataSource.get('isDefault') || NO);
    jquery.setClass('cancel', dataSource.get('isCancel') || NO);

    dataSource.get('theme').labelRenderDelegate.update(dataSource, jquery.find('label'));
  }
});
