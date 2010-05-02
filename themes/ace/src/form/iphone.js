// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple Inc. All rights reserved.
// License:   Licened under MIT license (see license.js)
// ==========================================================================

SC.AceTheme.IphoneForm = SC.AceTheme.subtheme("iphone-form", "iphone-form");

/** @class
  @extends SC.Renderer
  @since Quilmes
*/
require("theme");
SC.AceTheme.IphoneForm.renderers.Form = SC.EmptyTheme.renderers.Form.extend({
  formFlowSpacing: { left: 10, right: 10, top: 0, bottom: 0 }
});

SC.AceTheme.IphoneForm.renderers.FormRow = SC.EmptyTheme.renderers.FormRow.extend({
  rowFlowPadding: { left: 15, right: 0, top: 0, bottom: 0 },
  rowFlowSpacing: { left: 0, right: 15, top: 0, bottom: 0 }
});


SC.AceTheme.IphoneForm.renderers.Label = SC.EmptyTheme.renderers.Label.extend({
  renderTitle: function(context) {
    context.push("<div class='inner'>");
    this.titleRenderer.render(context);
    context.push("</div>");
    context.css("font-weight", "");
  },
  
  updateTitle: function() {
    this.titleRenderer.update();
    this.$().css("font-weight", "");
  },
  
  didAttachLayer: function(l) {
    this.titleRenderer.attachLayer(this.provide(".inner"));
  }
});


SC.AceTheme.IphoneForm.renderers.form = SC.AceTheme.IphoneForm.renderers.Form.create();
SC.AceTheme.IphoneForm.renderers.formRow = SC.AceTheme.IphoneForm.renderers.FormRow.create();
SC.AceTheme.IphoneForm.renderers.label = SC.AceTheme.IphoneForm.renderers.Label.create();