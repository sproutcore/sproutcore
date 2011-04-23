// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/**
  Renders and updates DOM representations of progress bars.
  
  Parameters
  --------------------------
  Expects these properties on the data source:
  
   - `isIndeterminate`
   - `isRunning`
   - `isEnabled`
   - `value`
  
  Theme Constants
  -------------------------------------
  Ace's `progressRenderDelegate`'s rendering process is not affected by 
  any theme constants.
*/
SC.BaseTheme.progressRenderDelegate = SC.RenderDelegate.create({
  name: 'progress',
  
  render: function(dataSource, context) {
    this.addSizeClassName(dataSource, context);

    var theme = dataSource.get('theme'),
        valueMax = dataSource.get('maximum'),
        valueMin = dataSource.get('minimum'),
        valueNow = dataSource.get('ariaValue');

    var value;
    if (dataSource.get('isIndeterminate')) {
      value = 120;
    } else {
      value = dataSource.get('value');
    }

    // make accessible
    context.attr('aria-valuemax', valueMax);
    context.attr('aria-valuemin', valueMin);
    context.attr('aria-valuenow', valueNow);
    context.attr('aria-valuetext', valueNow);

    
    context.setClass({
      indeterminate: dataSource.get('isIndeterminate'),
      running: dataSource.get('isRunning'),
      disabled: !dataSource.get('isEnabled'),
      'sc-empty': (value <= 0),
      'sc-complete': (value >= 100)
    });
    
    context = context.begin('div').addClass('track');
    this.includeSlices(dataSource, context, SC.THREE_SLICE);
    context = context.end();
    
    context = context.begin('div').addClass('content');
    context.css('width', (value * 100) + "%");
    this.includeSlices(dataSource, context, SC.THREE_SLICE);
    context = context.end();
  },
  
  update: function(dataSource, $) {
    this.updateSizeClassName(dataSource, $);

    var theme = dataSource.get('theme'),
        valueMax = dataSource.get('maximum'),
        valueMin = dataSource.get('minimum'),
        valueNow = dataSource.get('ariaValue');

    // make accessible
    $.attr('aria-valuemax', valueMax);
    $.attr('aria-valuemin', valueMin);
    $.attr('aria-valuenow', valueNow);
    $.attr('aria-valuetext', valueNow);


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
});
