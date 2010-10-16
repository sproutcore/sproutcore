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

SC.BaseTheme.renderers.Slider = SC.Renderer.extend({
  controlSizeArray: [14, 16, 22], // pre-create for performance (purely optional optimization)
  controlSizes: {
    14: SC.SMALL_CONTROL_SIZE,
    16: SC.REGULAR_CONTROL_SIZE,
    22: SC.JUMBO_CONTROL_SIZE
  },
  
  init: function(attrs) {
    this._controlRenderer = this.theme.control({
      controlSizes: this.controlSizes,
      controlSizeArray: this.controlSizeArray // purely optional optimization
    });
    
    this.attr(attrs);
  },
  render: function(context) {
    this._controlRenderer.attr({
      isEnabled: this.isEnabled,
      isActive: this.isActive,
      isSelected: this.isSelected,
      controlSize: this.controlSize
    });
    this._controlRenderer.render(context);
    
    this.renderSlider(context);
    this.resetChanges();
  },
  
  renderSlider: function(context) {
    var blankImage = SC.BLANK_IMAGE_URL;
    context.push('<span class="sc-inner">',
                  '<span class="sc-leftcap"></span>',
                  '<span class="sc-rightcap"></span>',
                  '<img src="', blankImage, 
                  '" class="sc-handle" style="left: ', this.value, '%" />',
                  '</span>');
  },
  
  update: function() {
    this._controlRenderer.attr({
      isEnabled: this.isEnabled,
      isActive: this.isActive,
      isSelected: this.isSelected,
      controlSize: this.controlSize
    });
    this._controlRenderer.update();
    
    this.updateSlider();
    this.resetChanges();
  },
  
  updateSlider: function() {
    if (this.didChange('value')) {
      this.$(".sc-handle").css("left", this.value + "%");
    }
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

SC.BaseTheme.renderers.slider = SC.BaseTheme.renderers.Slider.create();