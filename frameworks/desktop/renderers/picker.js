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

SC.BaseTheme.renderers.Picker = SC.Renderer.extend({
  init: function(attr) {
    this.attr(attr);
    
    this.panelRenderer = this.theme.panel();
  },
  render: function(context) {
    this.panelRenderer.attr("contentProvider", this.contentProvider);
    this.panelRenderer.render(context);
    
    if (this.preferType == SC.PICKER_POINTER || this.preferType == SC.PICKER_MENU_POINTER) {
      context.push('<div class="sc-pointer '+this.pointerPos+'" style="margin-top: '+this.pointerPosY+'px"></div>');
      context.addClass(this.pointerPos);
    }
  },
  
  update: function() {
    this.panelRenderer.attr("contentProvider", this.contentProvider);
    this.panelRenderer.update();
    
    if (this.preferType == SC.PICKER_POINTER || this.preferType == SC.PICKER_MENU_POINTER) {
      var el = this.$('.sc-pointer');
      el.attr('class', "sc-pointer "+this.pointerPos);
      el.attr('style', "margin-top: "+this.pointerPosY+"px");
      this.$().addClass(this.pointerPos);
    }
  },
  
  didAttachLayer: function(l) {
    this.panelRenderer.attachLayer(l);
  },
  
  willDetachLayer: function() {
    this.panelRenderer.detachLayer();
  }
});

SC.BaseTheme.renderers.picker = SC.BaseTheme.renderers.Picker.create();
