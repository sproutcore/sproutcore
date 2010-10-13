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

SC.BaseTheme.renderers.Workspace = SC.Renderer.extend({
  render: function(context) {
    if (this.contentProvider) this.contentProvider.renderContent(context);
  },
  
  update: function() {
  }
});

SC.BaseTheme.renderers.workspace = SC.BaseTheme.renderers.Workspace.create();