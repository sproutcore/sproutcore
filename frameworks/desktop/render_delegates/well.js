// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2009 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

SC.BaseTheme.wellRenderDelegate = SC.RenderDelegate.create({
  name: 'well',
  render: function(dataSource, context) {
    this.includeSlices(dataSource, context, SC.THREE_SLICE);
  },
  
  update: function() {

  }
});
