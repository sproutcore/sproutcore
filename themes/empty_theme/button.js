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
require("theme");
SC.EmptyTheme.renderers.Button = SC.Renderer.extend({
  render: function(context) {
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
    context.attr('role', 'button').setClass(classes);

    theme = this.oldButtonTheme;
    if (theme) context.addClass(theme);
    
    // render inner html 
    context = context.push("<span class='sc-button-inner test'>");
    
    if (!this.titleRenderer) this.titleRenderer = this.theme.title();
    this.titleRenderer.attr({
      title: this.title,
      icon: this.icon,
      needsEllipsis: this.needsEllipsis,
      escapeHTML: this.escapeHTML
    });
    this.titleRenderer.render(context);
    
    context.push("</span>") ;
    
    if(this.supportFocusRing) {
      context.push('<div class="focus-ring">',
                    '<div class="focus-left"></div>',
                    '<div class="focus-middle"></div>',
                    '<div class="focus-right"></div></div>');
    }
  },
  
  update: function() {
    var classes, theme, q = this.$();
    
    classes = this._TEMPORARY_CLASS_HASH ? this._TEMPORARY_CLASS_HASH : this._TEMPORARY_CLASS_HASH = {};
    classes.def = this.isDefault;
    classes.cancel = this.isCancel;
    classes.icon = !!this.icon;
    
    q.setClass(classes);
    theme = this.oldButtonTheme;
    if (theme) q.addClass(theme);
    
    // update title
    this.titleRenderer.attr({
      title: this.title,
      icon: this.icon,
      needsEllipsis: this.needsEllipsis,
      escapeHTML: this.escapeHTML
    });
    
    this.titleRenderer.update();
  },
  
  didAttachLayer: function(layer){
    this.titleRenderer.attachLayer(layer);
  },
  
  didDetachLayer: function() {
    this.titleRenderer.detachLayer();
  }
});

SC.EmptyTheme.renderers.button = SC.EmptyTheme.renderers.Button.create();