// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple Inc. All rights reserved.
// License:   Licened under MIT license (see license.js)
// ==========================================================================

sc_require("renderers/renderer");

/** @class
  @extends SC.Renderer
  @since SproutCore 1.1
*/
SC.BaseTheme.renderers.CanvasImage = SC.Renderer.extend({

  // we don't have a layer yet, so canvas is useless!
  render: function(context) {
    context.attr('width', this.width);
    context.attr('height', this.height);
  },
  
  update: function() {
    var cq = this.$(),
        elem = cq[0],
        value = this.value,
        context;
    
    if (elem && elem.getContext) {
      context = elem.getContext('2d');
      
      if (value) {
        context.drawImage(value, 0, 0, this.width, this.height);
      }
    }
  }
});

SC.BaseTheme.renderers.canvasImage = SC.BaseTheme.renderers.CanvasImage.create();