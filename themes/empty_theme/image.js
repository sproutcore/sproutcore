// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple Inc. All rights reserved.
// License:   Licened under MIT license (see license.js)
// ==========================================================================
 
/** @class

  This renderer is initially intended for image button
  @extends SC.Renderer
  @since SproutCore 1.1
*/
require("theme");
SC.EmptyTheme.renderers.Image = SC.Renderer.extend({
  render: function(context) {
    var src = this.src, toolTip = this.toolTip || '', image = '';
    
    if ((this.isSprite !== YES && src.indexOf('/') >= 0) || this.isSprite === NO) {
      context.attr('src', src);
      this._last_sprite_class = NO;
    } else {
      context.attr('src', SC.BLANK_IMAGE_URL);
      context.addClass(src);
      this._last_sprite_class = src;
    }
    
    context.attr('title', toolTip);
    context.attr('alt', toolTip);
  },
  
  update: function() {
    var cq = this.$();
    
    var src = this.src, toolTip = this.toolTip || '', image = '';
    
    if ((this.isSprite !== YES && src.indexOf('/') >= 0) || this.isSprite === NO) {
      cq.attr('src', src);
      this._last_sprite_class = NO;
    } else {
      if (this._last_sprite_class) context.setClass(this._last_sprite_class, NO);
      cq.attr('src', SC.BLANK_IMAGE_URL);
      cq.setClass(src, YES);
      this._last_sprite_class = src;
    }
    
    cq.attr('title', toolTip);
    cq.attr('alt', toolTip);
 
  }
});
 
SC.EmptyTheme.renderers.image = SC.EmptyTheme.renderers.Image.create();