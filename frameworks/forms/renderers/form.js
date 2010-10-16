// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/** @class
  @extends SC.Renderer
  @since Quilmes
*/

SC.BaseTheme.renderers.Form = SC.Renderer.extend({
  formFlowSpacing: { left: 5, top: 5, bottom: 5, right: 5 },
  
  render: function(context) {
    if (this.contentProvider) this.contentProvider.renderContent(context);
  },
  
  update: function() {
    
  }
});
SC.BaseTheme.renderers.form = SC.BaseTheme.renderers.Form.create();