// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple Inc. All rights reserved.
// License:   Licened under MIT license (see license.js)
// ==========================================================================

require("src/form/iphone/iphone");

if (SC.AceTheme.IphoneForm) {

  SC.AceTheme.IphoneForm.Label = SC.BaseTheme.Label.extend({
    name: 'label',

    renderTitle: function(context) {
      context.push("<div class='inner'>");
      this.titleRenderer.render(context);
      context.push("</div>");
      context.css("font-weight", "");
    },

    updateTitle: function(cq) {
      this.titleRenderer.update(cq);
      cq.css("font-weight", "");
    }
  });

  SC.AceTheme.IphoneForm.addRenderer(SC.AceTheme.IphoneForm.Label);
}
