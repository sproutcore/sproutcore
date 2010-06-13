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
SC.BaseTheme.renderers.DisclosureControl = SC.Renderer.extend({
  
  classNames: {
    'sc-disclosure-control': YES
  },
  
  init: function(settings) {
    this._disclosureRenderer = this.theme.disclosure();
    this._titleRenderer = this.theme.title();
    this.attr(settings);
  },
  
  render: function(context) {
    sc_super();
    
    this.renderDisclosureRenderer(context);
    this.renderTitleRenderer(context);
  },
  
  update: function(context) {
    sc_super();
    
    this.updateDisclosureRenderer();
    this.updateTitleRenderer();
  },
  
  renderTitleRenderer: function(context) {
    this._titleRenderer.attr({
      title: this.title,
      icon: this.icon,
      needsEllipsis: this.needsEllipsis,
      escapeHTML: this.escapeHTML
    });

    context = context.begin("span").addClass("sc-button-label");
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
  
  renderDisclosureRenderer: function(context) {
    this._disclosureRenderer.attr({
      controlSize: this.controlSize,
      isActive: this.isActive,
      isEnabled: this.isEnabled,
      isSelected: this.isSelected,
      state: this.state
    });
    
    this._disclosureRenderer.render(context);
  },
  
  updateDisclosureRenderer: function() {
    this._disclosureRenderer.attr({
      controlSize: this.controlSize,
      isActive: this.isActive,
      isEnabled: this.isEnabled,
      isSelected: this.isSelected,
      state: this.state
    });
    
    this._disclosureRenderer.update();
  },
  
  focus: function() {
    var elem = this.$()[0];
    elem.focus();
  },
  
  didAttachLayer: function(layer){
    this._disclosureRenderer.attachLayer(layer);
    this._titleRenderer.attachLayer(this.provide("span.sc-button-label"));
  },
  
  willDetachLayer: function() {
    this._disclosureRenderer.detachLayer();
    this._titleRenderer.detachLayer();
  }
  
});

SC.BaseTheme.renderers.disclosureControl = SC.BaseTheme.renderers.DisclosureControl.create();