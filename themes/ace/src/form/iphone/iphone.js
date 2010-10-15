// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple Inc. All rights reserved.
// License:   Licened under MIT license (see license.js)
// ==========================================================================

// FORMS ARE AN OPTIONAL SPROUTCORE COMPONENT!
if (SC.BaseTheme.Form) {

  sc_require("src/theme");
  SC.AceTheme.IphoneForm = SC.AceTheme.subtheme("iphone-form");
  SC.AceTheme.IphoneForm.FORM_FLOW_SPACING = { left: 10, right: 10, top: 0, bottom: 0 };
  SC.AceTheme.IphoneForm.FORM_ROW_FLOW_PADDING = { left: 15, right: 0, top: 0, bototm: 0 };
  SC.AceTheme.IphoneForm.FORM_ROW_FLOW_SPACING = { left: 0, right: 15, top: 0, bottom: 0 };

}
