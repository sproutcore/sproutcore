// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple Inc. All rights reserved.
// License:   Licened under MIT license (see license.js)
// ==========================================================================

/**
  Renders and updates DOM representations of a checkbox (just the box,
  not the title).
  
  Note: most of the actual rendering is done in CSS. The DOM element provided
  to the checkboxRenderDelegate must have the theme class names and the
  class name 'checkbox' (the name of the render delegate).
  
  Parameters
  --------------------------
  Expects these properties on the data source:
  
  - isSelected
  - isActive
  - isEnabled
  - title
  
  Optional parameters include all parameters for the labelRenderDelegate.
  
*/
SC.BaseTheme.checkboxRenderDelegate = SC.RenderDelegate.create({
  name: 'checkbox',
  
  render: function(dataSource, context) {
    var theme = dataSource.get('theme'),
        view  = dataSource.get('view'),
        ariaLabel,ariaLabeledBy;

    if(view) {
      ariaLabel     = view.get('ariaLabel');
      ariaLabeledBy = view.get('ariaLabeledBy');
    }

    var isSelected = dataSource.get('isSelected') || NO;
    var isActive = dataSource.get('isActive');
    var isDisabled = !dataSource.get('isEnabled');

    context.attr('role', 'checkbox');
    context.attr('aria-checked', isSelected.toString());
    if(ariaLabeledBy && ariaLabeledBy !== "") {
      context.attr('aria-labelledby', ariaLabeledBy);
    }
    if(ariaLabel && ariaLabel !== "") {
      context.attr('aria-label', ariaLabel);
    }

    context.setClass({
      'sel': isSelected,
      'active': isActive,
      'disabled': isDisabled
    });
    
    context.push('<span class = "button"></span>');
    
    context = context.begin('span').addClass('label');
    theme.labelRenderDelegate.render(dataSource, context);
    context = context.end();
  },
  
  update: function(dataSource, jquery) {
    var theme = dataSource.get('theme'),
        view  = dataSource.get('view'),
        ariaLabel,ariaLabeledBy;

    if(view) {
      ariaLabel     = view.get('ariaLabel');
      ariaLabeledBy = view.get('ariaLabeledBy');
    }

    var isSelected = dataSource.get('isSelected');
    var isActive = dataSource.get('isActive');
    var isDisabled = !dataSource.get('isEnabled');

    // address accessibility
    jquery.attr('aria-checked', isSelected.toString());
    if(ariaLabeledBy && ariaLabeledBy !== "") {
      jquery.attr('aria-labelledby', ariaLabeledBy);
    }
    if(ariaLabel && ariaLabel !== "") {
      jquery.attr('aria-label', ariaLabel);
    }

    theme.labelRenderDelegate.update(dataSource, jquery.find('span.label'));
    
    // add class names
    jquery.setClass({
      'sel': isSelected,
      'active': isActive,
      'disabled': isDisabled
    });
  }
});

