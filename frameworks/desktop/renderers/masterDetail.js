// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/** @class
  @extends SC.Renderer
  @since SproutCore 1.1
*/

SC.BaseTheme.renderers.MasterDetail = SC.Renderer.extend({
  BORDER: 1,
  render: function(context) {
    if (this.contentProvider) this.contentProvider.renderContent(context);
  },
  
  update: function() {
  }
});

SC.BaseTheme.renderers.masterDetail = SC.BaseTheme.renderers.MasterDetail.create();