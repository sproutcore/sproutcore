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
SC.BaseTheme.renderers.Checkbox = SC.Renderer.extend({

  classNames: {
    'sc-checkbox': YES
  },
  
  controlSizeArray: [14, 16], // pre-create for performance (purely optional optimization)
  controlSizes: {
    14: SC.SMALL_CONTROL_SIZE,
    16: SC.REGULAR_CONTROL_SIZE
  },
  
  init: function(settings) {
    this._controlRenderer = this.theme.control({
      controlSizes: this.controlSizes,
      controlSizeArray: this.controlSizeArray // purely optional optimization
    });
    this.attr(settings);
  },

  render: function(context) {
    sc_super();
    
    this.renderControlRenderer(context);
    
    if (SC.browser.msie) context.attr('for', this.guid);
    context.attr('name', this.name);
    context.attr("aria-checked", this.ariaValue);
    context.push('<span class="button"></span>');
    
    this.resetChanges();
  },

  update: function() {
    sc_super();
    
    this.updateControlRenderer();
    
    if (this.didChange('ariaValue')) this.$().attr("aria-checked", this.ariaValue);
    
    this.resetChanges();
  },
  
  renderControlRenderer: function(context) {
    this._controlRenderer.attr({
      isEnabled: this.isEnabled,
      isActive: this.isActive,
      isSelected: this.isSelected,
      controlSize: this.controlSize
    });
    
    this._controlRenderer.render(context);
  },
  
  updateControlRenderer: function() {
    this._controlRenderer.attr({
      isEnabled: this.isEnabled,
      isActive: this.isActive,
      isSelected: this.isSelected,
      controlSize: this.controlSize
    });
    this._controlRenderer.update();
  },
  
  didAttachLayer: function(layer){
    this._controlRenderer.attachLayer(layer);
  },
  
  willDetachLayer: function() {
    this._controlRenderer.detachLayer();
  }

});

SC.BaseTheme.renderers.checkbox = SC.BaseTheme.renderers.Checkbox.create();