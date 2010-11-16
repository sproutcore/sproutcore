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

SC.BaseTheme.Form = SC.Renderer.extend({
  name: 'form',

  formFlowSpacing: { left: 5, top: 5, bottom: 5, right: 5 },

  render: function(context) {
    if (this.contentProvider) this.contentProvider.renderContent(context);
  },

  update: function() {

  }
});

SC.BaseTheme.FORM_FLOW_SPACING = { left: 5, top: 5, bottom: 5, right: 5 };
SC.BaseTheme.addRenderer(SC.BaseTheme.Form);

