// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple Inc. All rights reserved.
// License:   Licened under MIT license (see license.js)
// ==========================================================================

SC.BaseTheme.Icon = SC.BaseTheme.subtheme('icon');

/** @class
  Button "icon" theme, which renders the button without any chrome.

  @extends SC.Renderer
  @since SproutCore 1.1
*/
SC.BaseTheme.Icon.Button = SC.Renderer.extend({
  name: 'button',
  render: function(context) {
    var icon = this.icon;
    context.addClass('no-min-width');
    if(icon) context.push("<div class='img "+icon+"'></div>");
    else context.push("<div class='img'></div>");
  },
  
  update: function(cq) {
    var img = cq.find('.img'), src = this.icon;
    if (src) {
      img.attr('class', "img "+src);
    } else {
      img.attr('class', "img");
    }  
  }
});

SC.BaseTheme.Icon.addRenderer(SC.BaseTheme.Icon.Button);
