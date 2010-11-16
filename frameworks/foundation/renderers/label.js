// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/** @class
  @extends SC.Renderer
  @since Quilmes
*/
sc_require("renderers/renderer");
SC.BaseTheme.Label = SC.Renderer.extend({
  name: 'label',

  init: function(attrs) {
    this.titleRenderer = this.theme.Title.create();
    this.attr(attrs);
  },


  updateTitleRenderer: function() {
    var text = this.value,
        hint = this.hint,
        icon = this.icon,
        escapeHTML = this.escapeHTML,
        classes, styleHash;
    
    this.titleRenderer.attr({
      title: text,
      icon: icon,
      escapeHTML: escapeHTML,
      hint: hint
    });
  },
  
  render: function(context) {
    this.renderClassNames(context);
    this.updateTitleRenderer();
    
    context.addStyle({
      'textAlign': this.textAlign,
      'fontWeight': this.fontWeight,
      'opacity': this.classNames.contains('editing') ? 0 : 1
    });
    context.setClass("icon", !!this.icon);

    this.titleRenderer.render(context);
  },
  
  update: function(cq) {
    this.updateClassNames(cq);

    this.updateTitleRenderer(cq);
    this.updateTitle(cq);
    
    // NOTE: we have to update ALL of these properties every time
    // because SC.Views like to blow away styles and class names.
    // Unfortunate, but true.
    cq.css({
      'text-align': this.textAlign,
      'font-weight': this.fontWeight,
      'opacity': this.isEditing ? 0 : 1
    })
    .setClass('icon', !!this.icon);
  },
  
  updateTitle: function(cq) {
    this.titleRenderer.update(cq);
  }
});

SC.BaseTheme.addRenderer(SC.BaseTheme.Label);

