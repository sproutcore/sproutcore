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
SC.BaseTheme.renderers.CheckboxControl = SC.Renderer.extend({

  classNames: {
    'sc-checkbox-control': YES
  },
  
  init: function(settings) {
    this._checkboxRenderer = this.theme.checkbox();
    this._titleRenderer = this.theme.title();
    this.attr(settings);
  },

  render: function(context) {
    sc_super();
    
    this.renderCheckboxRenderer(context);
    this.renderTitleRenderer(context);
    
    this.resetChanges();
  },
  
  update: function() {
    sc_super();
    
    this.updateCheckboxRenderer();
    this.updateTitleRenderer();
    
    this.resetChanges();
  },
  
  renderCheckboxRenderer: function(context) {
    this._checkboxRenderer.attr({
      ariaValue: this.ariaValue,
      isActive: this.isActive,
      isEnabled: this.isEnabled,
      isSelected: this.isSelected,
      controlSize: this.controlSize,
      name: this.name
    });
    
    this._checkboxRenderer.render(context);
  },
  
  updateCheckboxRenderer: function() {
    this._checkboxRenderer.attr({
      ariaValue: this.ariaValue,
      isActive: this.isActive,
      isEnabled: this.isEnabled,
      isSelected: this.isSelected,
      controlSize: this.controlSize,
      name: this.name
    });
    
    this._checkboxRenderer.update();
  },
  
  renderTitleRenderer: function(context) {
    this._titleRenderer.attr({
      title: this.title,
      icon: this.icon,
      needsEllipsis: this.needsEllipsis,
      escapeHTML: this.escapeHTML
    });
    
    context = context.begin("span").addClass("label");
    this._titleRenderer.render(context);
    context = context.end();
  },
  
  updateTitleRenderer: function() {
    this._titleRenderer.attr({
      title: this.title,
      icon: this.icon,
      needsEllipsis: this.needsEllipsis,
      escapeHTML: this.escapeHTML
    });
    
    this._titleRenderer.update();
  },
  
  didAttachLayer: function(layer){
    this._checkboxRenderer.attachLayer(layer);
    this._titleRenderer.attachLayer(this.provide("span.label"));
  },
  
  willDetachLayer: function() {
    this._checkboxRenderer.detachLayer();
    this._titleRenderer.detachLayer();
  }
});

SC.BaseTheme.renderers.checkboxControl = SC.BaseTheme.renderers.CheckboxControl.create();