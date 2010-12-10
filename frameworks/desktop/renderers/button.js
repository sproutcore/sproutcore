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
SC.BaseTheme.Button = SC.Renderer.extend({
  name: 'button',

  sizes: [
    { 'height': 18, 'name': SC.SMALL_CONTROL_SIZE },
    { 'height': 24, 'name': SC.REGULAR_CONTROL_SIZE },
    { 'height': 30, 'name': SC.HUGE_CONTROL_SIZE },
    { 'height': 44, 'name': SC.JUMBO_CONTROL_SIZE }
  ],

  render: function(context) {
    sc_super();

    this._titleRenderer = this.theme.renderer('title');

    // configure sub renderers
    this._titleRenderer.attr({
      title: this.title,
      icon: this.icon,
      needsEllipsis: this.needsEllipsis,
      escapeHTML: this.escapeHTML
    });

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
    context.setClass('icon', !!this.icon);

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
  
  update: function(query) {
    this.updateClassNames(query);

    this._titleRenderer.attr({
      title: this.title,
      icon: this.icon,
      needsEllipsis: this.needsEllipsis,
      escapeHTML: this.escapeHTML
    });

    // do actual updating
    //this._controlRenderer.update();    
    query.setClass('icon', !!this.icon);

    // update title
    this.updateContents(query);
  },
  
  updateContents: function(query) {
    this._titleRenderer.update(query.find('.sc-button-label'));
  }

});

SC.BaseTheme.addRenderer(SC.BaseTheme.Button);
