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
SC.BaseTheme.renderers.Well = SC.Renderer.extend({

  // leave it set to this constant for backwards compatibility
  contentLayout: {
    top: SC.WELL_CONTAINER_PADDING, bottom: SC.WELL_CONTAINER_PADDING,
    left: SC.WELL_CONTAINER_PADDING, right: SC.WELL_CONTAINER_PADDING
  },
  
  render: function(context) {
    context.push("<div class='top-left-edge'></div>",
      "<div class='top-edge'></div>",
      "<div class='top-right-edge'></div>",
      "<div class='right-edge'></div>",
      "<div class='bottom-right-edge'></div>",
      "<div class='bottom-edge'></div>",
      "<div class='bottom-left-edge'></div>",
      "<div class='left-edge'></div>",
      "<div class='content-background'></div>");
    
    if (this.contentProvider) this.contentProvider.renderContent(context);
  },
  
  update: function() {}
});

SC.BaseTheme.renderers.well = SC.BaseTheme.renderers.Well.create();