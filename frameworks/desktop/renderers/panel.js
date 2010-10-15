// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple Inc. All rights reserved.
// License:   Licened under MIT license (see license.js)
// ==========================================================================

/** @class
  @extends SC.Renderer
  @since SproutCore 1.1
*/

SC.BaseTheme.Panel = SC.Renderer.extend({
  name: 'panel',

  render: function(context) {
    if (this.contentProvider) this.contentProvider.renderContent(context);
    context.push(
      "<div class='middle'></div>",
      "<div class='top-left-edge'></div>",
      "<div class='top-edge'></div>",
      "<div class='top-right-edge'></div>",
      "<div class='right-edge'></div>",
      "<div class='bottom-right-edge'></div>",
      "<div class='bottom-edge'></div>",
      "<div class='bottom-left-edge'></div>",
      "<div class='left-edge'></div>"
    );
  },
  
  update: function() {
    // we NEVER update child views. They get to do that on their own.
  }
});

SC.BaseTheme.addRenderer(SC.BaseTheme.Panel);
