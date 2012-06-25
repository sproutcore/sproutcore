// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================


SC.BaseTheme.disclosureRenderDelegate = SC.RenderDelegate.create({
  className: 'disclosure',
  
  render: function(dataSource, context) {
    this.addSizeClassName(dataSource, context);

    var theme = dataSource.get('theme'),
        value = dataSource.get('value'),
        labelClassNames = SC.A(dataSource.get('labelClassNames'));

    var labelId = SC.guidFor(dataSource) + "-label";

    //addressing accessibility
    context.attr('aria-expanded', value);
    context.attr('aria-labelledby', labelId);

    if (dataSource.get('isSelected')) context.addClass('sel');
    
    var state = '';
    state += dataSource.get('isSelected') ? 'open' : 'closed';
    if (dataSource.get('isActive')) state += ' active';
    
    context.push('<img src = "' + SC.BLANK_IMAGE_URL + '" class = "disclosure button ' + state + '" />');

    labelClassNames.push('sc-button-label');
    context = context.begin('span').addClass(labelClassNames).id(labelId);
    theme.labelRenderDelegate.render(dataSource, context);
    context = context.end();
  },
  
  update: function(dataSource, jquery) {
    this.updateSizeClassName(dataSource, jquery);

    var theme = dataSource.get('theme'),
        value = dataSource.get('value'),
        labelClassNames = SC.A(dataSource.get('labelClassNames')),
        $label;

    //addressing accessibility
    jquery.attr('aria-expanded', value);

    if (dataSource.get('isSelected')) jquery.addClass('sel');

    jquery.find('img').setClass({
      open: dataSource.get('isSelected'),
      closed: !dataSource.get('isSelected'),
      active: dataSource.get('isActive')
    });

    $label = jquery.find('span.sc-button-label');

    labelClassNames.push('sc-button-label');
    $label.removeClass().addClass(labelClassNames.join(' '));
    
    theme.labelRenderDelegate.update(dataSource, $label);
  }
});

