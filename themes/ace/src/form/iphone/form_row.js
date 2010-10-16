// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

require("src/form/iphone/iphone");

if (SC.AceTheme.IphoneForm) {


  /** @class
    @extends SC.Renderer
    @since Quilmes
  */
  SC.AceTheme.IphoneForm.renderers.FormRow = SC.EmptyTheme.renderers.FormRow.extend({
    rowFlowPadding: { left: 15, right: 0, top: 0, bottom: 0 },
    rowFlowSpacing: { left: 0, right: 15, top: 0, bottom: 0 }
  });

  SC.AceTheme.IphoneForm.renderers.formRow = SC.AceTheme.IphoneForm.renderers.FormRow.create();

}