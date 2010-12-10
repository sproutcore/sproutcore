// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple Inc. All rights reserved.
// License:   Licened under MIT license (see license.js)
// ==========================================================================

SC.BaseTheme.disclosureRenderDelegate = SC.Object.create({
  name: 'disclosure',
  
  render: function(dataSource, context) {
    var theme = dataSource.get('theme');
    
    var state = '';
    state += dataSource.get('isSelected') ? 'open' : 'closed';
    if (dataSource.get('isActive')) state += ' active';
    
    context.push('<img src = "' + SC.BLANK_IMAGE_URL + '" class = "disclosure button ' + state + '" />');
    
    context = context.begin('span').addClass('sc-button-label');
    theme.labelRenderDelegate.render(dataSource, context);
    context = context.end();
  },
  
  update: function(dataSource, jquery) {
    var theme = dataSource.get('theme');

    jquery.find('img').setClass({
      open: dataSource.get('isSelected'),
      closed: !dataSource.get('isSelected'),
      active: dataSource.get('isActive')
    });
    
    theme.labelRenderDelegate.update(dataSource, jquery.find('span.sc-button-label'));
  }
});

