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

SC.BaseTheme.FormRow = SC.Renderer.extend({
  name: 'form-row',
  rowFlowSpacing: { right: 15, left: 0, top: 0, bottom: 0 },
  rowFlowPadding: { left: 0, right: 0 , bottom: 0, top: 0 },
  render: function(context) {
    if (this.contentProvider) this.contentProvider.renderContent(context);
  },
  
  update: function() {
    
  }
});

SC.BaseTheme.FORM_ROW_FLOW_SPACING = { right: 15, left: 0, top: 0, bottom: 0 };
SC.BaseTheme.FORM_ROW_FLOW_PADDING = { left: 0, right: 0, bottom: 0, top: 0 };

SC.BaseTheme.addTheme(SC.BaseTheme.FormRow);
