// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple Inc. All rights reserved.
// License:   Licened under MIT license (see license.js)
// ==========================================================================

/** @class
  @extends SC.Renderer
  @since SproutCore 1.1
*/

require("theme");
SC.EmptyTheme.renderers.MasterDetail = SC.Renderer.extend({
  BORDER: 1,
  render: function(context) {
    if (this.contentProvider) this.contentProvider.renderContent(context);
  },
  
  update: function() {
  }
});

SC.EmptyTheme.renderers.masterDetail = SC.EmptyTheme.renderers.MasterDetail.create();