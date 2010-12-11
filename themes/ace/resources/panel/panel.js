// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

SC.AceTheme.panelRenderDelegate = SC.Object.create({
  name: 'panel',
  
  render: function(dataSource, context) {
    context = context.begin('div').addClass('panel-background');
    dataSource.get('theme').slicesRenderDelegate.render(SC.NINE_SLICE, context);
    context = context.end();
  },
  
  update: function() {
    // doesn't get updated
  }
});
