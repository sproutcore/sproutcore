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

SC.BaseTheme.Picker = SC.Renderer.extend({
  name: 'picker',
  render: function(context) {
    this.panelRenderer = this.theme.renderer('panel');
    this.panelRenderer.attr("contentProvider", this.contentProvider);
    this.panelRenderer.render(context);

    if (this.preferType == SC.PICKER_POINTER || this.preferType == SC.PICKER_MENU_POINTER) {
      context.push('<div class="sc-pointer ' + this.pointerPos + '" style="margin-top: ' + this.pointerPosY + 'px"></div>');
      context.addClass(this.pointerPos);
    }
  },

  update: function(cq) {
    this.panelRenderer.attr("contentProvider", this.contentProvider);
    this.panelRenderer.update(cq);

    if (this.preferType == SC.PICKER_POINTER || this.preferType == SC.PICKER_MENU_POINTER) {
      var el = cq.find('.sc-pointer');
      el.attr('class', "sc-pointer "+this.pointerPos);
      el.attr('style', "margin-top: "+this.pointerPosY+"px");
      cq.addClass(this.pointerPos);
    }
  }
});

SC.BaseTheme.addRenderer(SC.BaseTheme.Picker);

