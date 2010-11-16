// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/** @class
  @extends SC.Renderer
  @since SproutCore 1.1
*/

SC.BaseTheme.Workspace = SC.Renderer.extend({
  name: 'workspace',
  render: function(context) {
    this.renderClassNames(context);
    if (this.contentProvider) this.contentProvider.renderContent(context);
  },
  
  update: function(cq) {
    this.updateClassNames(cq);
  }
});

SC.BaseTheme.addRenderer(SC.BaseTheme.Workspace);

