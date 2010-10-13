// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

require("src/form/iphone/iphone");

if (SC.AceTheme.IphoneForm) {

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

  SC.AceTheme.IphoneForm.renderers.label = SC.AceTheme.IphoneForm.renderers.Label.create();

}