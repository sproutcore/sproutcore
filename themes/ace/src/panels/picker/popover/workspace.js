// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple Inc. All rights reserved.
// License:   Licened under MIT license (see license.js)
// ==========================================================================

/** @class
  @extends SC.EmptyTheme.renderers.Workspace
  @since SproutCore 1.1
*/

// requires popover theme.
require("src/panels/picker/popover/popover");

var theme = SC.AceTheme.Popover;

SC.AceTheme.Popover.Workspace = SC.BaseTheme.Workspace.extend({
  name: 'workspace',

  render: function(context) {
    context.push("<div class='sc-workspace-overlay'>",
      "<div class='middle'></div>",
      "<div class='top-left-edge'></div>",
      "<div class='top-edge'></div>",
      "<div class='top-right-edge'></div>",
      "<div class='right-edge'></div>",
      "<div class='bottom-right-edge'></div>",
      "<div class='bottom-edge'></div>",
      "<div class='bottom-left-edge'></div>",
      "<div class='left-edge'></div>",
      "<div class='sc-pointer'></div>",
    "</div>");

    if (this.contentProvider) this.contentProvider.renderContent(context);
  },

  update: function(cq) {
    this.updateClassNames();
  }
});

SC.AceTheme.Popover.addRenderer(SC.AceTheme.Popover.Workspace);
