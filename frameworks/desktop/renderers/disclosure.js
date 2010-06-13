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
SC.BaseTheme.renderers.Disclosure = SC.Renderer.extend({
  
  classNames: {
    'sc-disclosure': YES
  },
  
  init: function(settings) {
    this._controlRenderer = this.theme.control();
    this.attr(settings);
  },
  
  render: function(context) {
    sc_super();
    
    this.renderControlRenderer(context);
    
    var state = this.state ? "open" : "closed";
    context.push('<img src="' + SC.BLANK_IMAGE_URL + '" class="disclosure button ' + state + '" />');    
  },
  
  update: function(context) {
    sc_super();
    
    this.updateControlRenderer();
    
    var state = this.state,
        elem = this.$("img");
    
    elem.setClass("open", state);
    elem.setClass("closed", !state);
    elem.setClass("active", this.isActive);
  },
  
  renderControlRenderer: function(context) {
    this._controlRenderer.attr({
      controlSize: this.controlSize,
      isActive: this.isActive,
      isEnabled: this.isEnabled,
      isSelected: this.isSelected
    });
    
    this._controlRenderer.render(context);
  },
  
  updateControlRenderer: function() {
    this._controlRenderer.attr({
      controlSize: this.controlSize,
      isActive: this.isActive,
      isEnabled: this.isEnabled,
      isSelected: this.isSelected
    });
    
    this._controlRenderer.update();
  },
  
  focus: function() {
    var elem = this.$()[0];
    elem.focus();
  },
  
  didAttachLayer: function(layer){
    this._controlRenderer.attachLayer(layer);
  },
  
  willDetachLayer: function() {
    this._controlRenderer.detachLayer();
  }
  
});

SC.BaseTheme.renderers.disclosure = SC.BaseTheme.renderers.Disclosure.create();