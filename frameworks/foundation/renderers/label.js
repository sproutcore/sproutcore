// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple Inc. All rights reserved.
// License:   Licened under MIT license (see license.js)
// ==========================================================================

/** @class
  @extends SC.Renderer
  @since Quilmes
*/
sc_require("renderers/renderer");
SC.BaseTheme.renderers.Label = SC.Renderer.extend({
  init: function(attrs) {
    this.titleRenderer = this.theme.title();
    this.controlRenderer = this.theme.control();
    this.attr(attrs);
  },
  
  updateControlRenderer: function() {
    this.controlRenderer.attr({
      isEnabled: this.isEnabled,
      isActive: this.isActive,
      isSelected: this.isSelected,
      controlSize: this.controlSize
    });
  },
  
  updateTitleRenderer: function() {
    var text = this.value,
        hint = this.hint,
        icon = this.icon,
        escapeHTML = this.escapeHTML,
        classes, styleHash;
    
    this.titleRenderer.attr({
      title: text,
      icon: icon,
      escapeHTML: escapeHTML,
      hint: hint
    });
  },
  
  render: function(context) {
    this.updateTitleRenderer();
    this.updateControlRenderer();
    context.addStyle({
      'textAlign': this.textAlign,
      'fontWeight': this.fontWeight,
      'opacity': this.isEditing ? 0 : 1
    });
    context.setClass("icon", !!this.icon);
    this.renderTitle(context);
    this.controlRenderer.render(context);
  },
  
  renderTitle: function(context) {
    this.titleRenderer.render(context);
  },
  
  update: function() {
    var cq = this.$();
    this.updateTitleRenderer();
    if (this.didChange('text-align')) {
      cq.css('text-align', this.textAlign);
    }
    if (this.didChange('font-weight')) {
      cq.css('font-weight', this.fontWeight);
    }
    if (this.didChange('opacity')) {
      cq.css('opacity', this.isEditing ? 0 : 1);
    }
    if (this.didChange('icon')) {
      cq.setClass("icon", !!this.icon);
    }
    this.resetChanges();
    this.updateTitle();
    this.controlRenderer.update();
  },
  
  updateTitle: function() {
    this.titleRenderer.update();
  },
  
  didAttachLayer: function(l) {
    this.titleRenderer.attachLayer(l);
    this.controlRenderer.attachLayer(l);
  },
  
  didDetachLayer: function() {
    this.titleRenderer.detachLayer();
    this.controlRenderer.detachLayer();
  }
});

SC.BaseTheme.renderers.label = SC.BaseTheme.renderers.Label.create();