// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple Inc. All rights reserved.
// License:   Licened under MIT license (see license.js)
// ==========================================================================

/** @class
  @extends SC.Renderer
  @since Quilmes
*/
require("theme");
SC.EmptyTheme.renderers.FormRow = SC.Renderer.extend({
  rowFlowSpacing: { right: 15, left: 0, top: 0, bottom: 0 },
  render: function(context) {
    if (this.contentProvider) this.contentProvider.renderContent(context);
  },
  
  update: function() {
    
  }
});
SC.EmptyTheme.renderers.formRow = SC.EmptyTheme.renderers.FormRow.create();