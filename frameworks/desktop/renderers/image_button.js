// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================
 
/** @class

  This renderer is initially intended for image button
  @extends SC.Renderer
  @since SproutCore 1.1
*/

SC.BaseTheme.renderers.ImageButton = SC.Renderer.extend({
  render: function(context) {
    var icon = this.icon;
    context.addClass('no-min-width');
    if(icon) context.push("<div class='img "+icon+"'></div>");
    else context.push("<div class='img'></div>");
  },
  
  update: function() {
    var img = this.$('img'), src = this.icon;
    if (src) {
      img.attr('class', "img "+src);
    } else {
      img.attr('class', "img");
    }  
  }
});
 
SC.BaseTheme.renderers.imageButton = SC.BaseTheme.renderers.ImageButton.create();