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
SC.BaseTheme.renderers.Button = SC.Renderer.extend({
  controlSizeArray: [18, 24, 30, 44], // pre-create for performance (purely optional optimization)
  controlSizes: {
    18: SC.SMALL_CONTROL_SIZE,
    24: SC.REGULAR_CONTROL_SIZE,
    30: SC.HUGE_CONTROL_SIZE,
    44: SC.JUMBO_CONTROL_SIZE
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
    // add href attr if tagName is anchor...
    var href, toolTip, classes, theme;
    if (this.isAnchor) {
      href = this.href;
      if (!href || (href.length === 0)) href = "javascript:;";
      context.attr('href', href);
    }

    // If there is a toolTip set, grab it and localize if necessary.
    toolTip = this.toolTip;
    if (SC.typeOf(toolTip) === SC.T_STRING) {
      context.attr('title', toolTip) ;
      context.attr('alt', toolTip) ;
    }
    
    // add some standard attributes & classes.
    classes = this._TEMPORARY_CLASS_HASH ? this._TEMPORARY_CLASS_HASH : this._TEMPORARY_CLASS_HASH = {};
    classes.def = this.isDefault;
    classes.cancel = this.isCancel;
    classes.icon = !!this.icon;
    context.setClass(classes);

    theme = this.oldButtonTheme;
    if (theme) context.addClass(theme);
    
    this.renderContents(context);
  },
  
  renderContents: function(context) {
    // render inner html 
    var minWidth = (this.titleMinWidth ? "style='min-width: " + this.titleMinWidth + "px'" : "");
    context = context.push("<span class='sc-button-inner' " + minWidth + ">");
    
    /* Render title */
    context = context.begin("label").addClass("sc-button-label");
    this._titleRenderer.render(context);
    context = context.end();
    
    context.push("</span>") ;
    
    if(this.supportFocusRing) {
      context.push('<div class="focus-ring">',
                    '<div class="focus-left"></div>',
                    '<div class="focus-middle"></div>',
                    '<div class="focus-right"></div></div>');
    }
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
    
    classes = this._TEMPORARY_CLASS_HASH ? this._TEMPORARY_CLASS_HASH : this._TEMPORARY_CLASS_HASH = {};
    classes.def = this.isDefault;
    classes.cancel = this.isCancel;
    classes.icon = !!this.icon;
    
    q.setClass(classes);
    
    
    // update title
    this.updateContents();
  },
  
  updateContents: function() {
    this._titleRenderer.update();
  },
  
  focus: function() {
    var elem = this.$()[0];
    elem.focus();
  },
  
  didAttachLayer: function(layer){
    this._titleRenderer.attachLayer(this.provide("label"));
    this._controlRenderer.attachLayer(layer);
  },
  
  willDetachLayer: function() {
    this._titleRenderer.detachLayer();
    this._controlRenderer.detachLayer();
  }
});

SC.BaseTheme.renderers.button = SC.BaseTheme.renderers.Button.create();