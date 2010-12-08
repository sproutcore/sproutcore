// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2010 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2010 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

sc_require("src/theme");

/**
  Renders and updates DOM representations of progress bars.
  
  Parameters
  --------------------------
  Expects these properties on the data source:
  
  - isIndeterminate
  - isRunning
  - isEnabled
  - value
  
  Theme Constants
  -------------------------------------
  Ace's progressRenderDelegate's rendering process is not affected by 
  any theme constants.
*/
SC.AceTheme.progressRenderDelegate = {
  name: 'progress',
  
  render: function(dataSource, context) {
    var theme = dataSource.get('theme');
    
    var value;
    if (dataSource.get('isIndeterminate')) {
      value = 120;
    } else {
      value = dataSource.get('value');
    }  
    
    context.setClass({
      indeterminate: dataSource.get('isIndeterminate'),
      running: dataSource.get('isRunning'),
      disabled: !dataSource.get('isEnabled'),
      'sc-empty': (value <= 0),
      'sc-complete': (value >= 100)
    });
    
    context = context.begin('div').addClass('track');
    theme.slicesRenderDelegate.render(SC.THREE_SLICE, context);
    context = context.end();
    
    context = context.begin('div').addClass('content');
    context.css('width', (value * 100) + "%");
    theme.slicesRenderDelegate.render(SC.THREE_SLICE, context);
    context = context.end();
  },
  
  update: function(dataSource, $) {
    var theme = dataSource.get('theme');
    
    var value;
    if (dataSource.get('isIndeterminate')) {
      value = 120;
    } else {
      value = dataSource.get('value');
    }
    
    $.setClass({
      indeterminate: dataSource.get('isIndeterminate'),
      running: dataSource.get('isRunning'),
      disabled: !dataSource.get('isEnabled'),
      'sc-empty': (value <= 0),
      'sc-complete': (value >= 100)
    });
    
    $.find('.content').css('width', (value * 100) + "%");
  }
};