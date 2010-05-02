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

SC.BaseTheme.renderers.Checkbox = SC.Renderer.extend({
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
    
    this._titleRenderer = this.theme.title();
    this.attr(settings);
  },
  render: function(context) {
    // configure sub renderers
    this._controlRenderer.attr({
      isEnabled: this.isEnabled,
      isActive: this.isActive,
      isSelected: this.isSelected,
      controlSize: this.controlSize
    });
    this._titleRenderer.attr({
      title: this.title,
      icon: this.icon,
      needsEllipsis: this.needsEllipsis,
      escapeHTML: this.escapeHTML
    });
    
    // render control renderer
    this._controlRenderer.render(context);
    
    /* Render OUR stuff */
    // write button
    context.attr('role', 'checkbox');
    if (SC.browser.msie) context.attr('for', this.guid);
    context.push('<span class="button"></span>');
    
    // write label
    context = context.begin("span").addClass("label");
    this._titleRenderer.render(context);
    context = context.end();
    
    // set name
    context.attr('name', this.name);
    context.attr("aria-checked", this.ariaValue);
    this.resetChanges();
  },
  
  update: function() {
    this._controlRenderer.attr({
      isEnabled: this.isEnabled,
      isActive: this.isActive,
      isSelected: this.isSelected,
      controlSize: this.controlSize
    });
    this._titleRenderer.attr({
      title: this.title,
      icon: this.icon,
      needsEllipsis: this.needsEllipsis,
      escapeHTML: this.escapeHTML
    });
    
    // do actual updating
    this._controlRenderer.update();    
    var classes, theme, q = this.$();
    
    this._titleRenderer.update();
    
    if (this.didChange('ariaValue')) q.attr("aria-checked", this.ariaValue);
    this.resetChanges();
  },
  
  didAttachLayer: function(layer){
    this._titleRenderer.attachLayer(this.provide("span.label"));
    this._controlRenderer.attachLayer(layer);
  },
  
  willDetachLayer: function() {
    this._titleRenderer.detachLayer();
    this._controlRenderer.detachLayer();
  }
});

SC.BaseTheme.renderers.checkbox = SC.BaseTheme.renderers.Checkbox.create();