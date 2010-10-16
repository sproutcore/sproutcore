// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple Inc. All rights reserved.
// License:   Licened under MIT license (see license.js)
// ==========================================================================

sc_require('src/theme');

/** @class
  @extends SC.BaseTheme.renderers.Well
  @since SproutCore 1.1
*/
SC.AceTheme.renderers.Well = SC.BaseTheme.renderers.Well.extend({
  render: function(context) {
    if (this.contentProvider) this.contentProvider.renderContent(context);
  },
  
  update: function() {}
});

SC.AceTheme.renderers.well = SC.AceTheme.renderers.Well.create();