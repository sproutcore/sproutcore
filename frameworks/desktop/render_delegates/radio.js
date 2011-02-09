// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/**
  Renders and updates the DOM representation of a radio button (a single button,
  not the group).
  
  Expected Properties
  -----------------------------------
  
  - isSelected
  - isActive
  - isMixed
  - isEnabled
  - title
  
  Optional Properties
  -----------------------------------
  
  - width: an optional width of the radio button
  - labelRenderDelegate properties
  
*/
SC.BaseTheme.radioRenderDelegate = SC.RenderDelegate.create({
  name: 'radio',
  
  render: function(dataSource, context) {
    var theme = dataSource.get('theme');
    
    var isSelected = dataSource.get('isSelected'),
        width = dataSource.get('width'),
        title = dataSource.get('title'),
        value = dataSource.get('value'),
        ariaLabeledBy = dataSource.get('ariaLabeledBy'),
        ariaLabel     = dataSource.get('ariaLabel');

    context.setClass({
      active: dataSource.get('isActive'),
      mixed: dataSource.get('isMixed'),
      sel: dataSource.get('isSelected'),
      disabled: !dataSource.get('isEnabled')
    });

    //accessing accessibility
    context.attr('role', 'radio');
    context.attr('aria-checked', isSelected);
    if(ariaLabel !== "") {
      context.attr('aria-label', ariaLabel);
    }
    if(ariaLabeledBy !== "") {
      context.attr('aria-labelledby', ariaLabeledBy);
    }

    if (width) context.css('width', width);
    
    context.push('<span class = "button"></span>');
    
    context = context.begin('span').addClass('sc-button-label');
    theme.labelRenderDelegate.render(dataSource, context);
    context = context.end();
  },
  
  update: function(dataSource, jquery) {
    var theme = dataSource.get('theme');
    
    var isSelected = dataSource.get('isSelected'),
        width = dataSource.get('width'),
        title = dataSource.get('title'),
        value = dataSource.get('value'),
        ariaLabeledBy = dataSource.get('ariaLabeledBy'),
        ariaLabel     = dataSource.get('ariaLabel');

    jquery.setClass({
      active: dataSource.get('isActive'),
      mixed: dataSource.get('isMixed'),
      sel: dataSource.get('isSelected'),
      disabled: !dataSource.get('isEnabled')
    });
    
    jquery.attr('aria-checked', isSelected);
    if(ariaLabel !== ""){
      jquery.attr('aria-label', ariaLabel);
    }
    if(ariaLabeledBy !== "") {
      jquery.attr('aria-labelledby', ariaLabeledBy);
    }
    jquery.css('width', width ? width : null);
    
    theme.labelRenderDelegate.update(dataSource, jquery.find('.sc-button-label'));
  }
});
