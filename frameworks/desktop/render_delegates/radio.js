// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
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
        width = dataSource.get('width');
    
    context.setClass({
      active: dataSource.get('isActive'),
      mixed: dataSource.get('isMixed'),
      sel: dataSource.get('isSelected'),
      disabled: !dataSource.get('isEnabled')
    });
    
    context.attr('role', 'radio');
    context.attr('aria-checked', isSelected);
    
    if (width) context.css('width', width);
    
    context.push('<span class = "button"></span>');
    
    context = context.begin('span').addClass('sc-button-label');
    theme.labelRenderDelegate.render(dataSource, context);
    context = context.end();
  },
  
  update: function(dataSource, jquery) {
    var theme = dataSource.get('theme');
    
    var isSelected = dataSource.get('isSelected'), width = dataSource.get('width');
    
    jquery.setClass({
      active: dataSource.get('isActive'),
      mixed: dataSource.get('isMixed'),
      sel: dataSource.get('isSelected'),
      disabled: !dataSource.get('isEnabled')
    });
    
    jquery.attr('aria-checked', isSelected);
    
    jquery.css('width', width ? width : null);
    
    theme.labelRenderDelegate.update(dataSource, jquery.find('.sc-button-label'));
  }
});
