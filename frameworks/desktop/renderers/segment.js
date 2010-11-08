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

SC.BaseTheme.renderers.Segment = SC.Renderer.extend({
  init: function(settings) {
    this._buttonRenderer = this.theme.button();
    this.attr(settings);
  },
  
  updateButtonRenderer: function() {
    this._buttonRenderer.attr({
      title: this.title,
      icon: this.icon,
      toolTip: this.toolTip,
      isEnabled: this.isEnabled,
      isSelected: this.isSelected,
      isActive: this.isActive,
      controlSize: this.controlSize
    });
  },
  
  computeClasses: function() {
    var classes = this._class_hash || {};
    
    classes["sc-first-segment"] = this.isFirstSegment;
    classes["sc-middle-segment"] = this.isMiddleSegment;
    classes["sc-last-segment"] = this.isLastSegment;
    classes["sc-segment"] = YES;
    classes['disabled'] = !this.isEnabled;
    
    this._class_hash = classes;
    return classes;
  },
  
  render: function(context) {
    // configure sub renderers
    this.updateButtonRenderer();
    this._buttonRenderer.render(context);
    
    /* Render OUR stuff */
    context.setClass(this.computeClasses());
    if (this.width) context.addStyle('width', this.width + 'px');

    if (this.layoutDirection === SC.LAYOUT_HORIZONTAL) context.addStyle('display', 'inline-block');
    this.resetChanges();
  },
  
  update: function() {
    // well, if we haven't changed, why not be a bit lazy
    if (!this.hasChanges()) return;
    
    this.updateButtonRenderer();
    this._buttonRenderer.update();
    
    // update OUR stuff
    this.$().setClass(this.computeClasses());
    if (this.didChange("width")) this.$().css('width', this.width ? this.width+'px' : '');
    if (this.didChange('layoutDirection')) this.$().css('display', this.layoutDirection == SC.LAYOUT_HORIZONTAL ? 'inline-block' : '');
    this.resetChanges();
  },
  
  didAttachLayer: function(layer){
    this._buttonRenderer.attachLayer(layer);
  },
  
  willDetachLayer: function() {
    this._buttonRenderer.detachLayer();
  }
});

SC.BaseTheme.renderers.segment = SC.BaseTheme.renderers.Segment.create();