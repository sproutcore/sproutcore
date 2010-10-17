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
SC.BaseTheme.CheckboxControl = SC.Renderer.extend({
  name: 'checkbox-control',
  classNames: 'sc-checkbox-control',

  render: function(context) {
    sc_super();

    this.renderCheckboxRenderer(context);
    if (SC.browser.msie) context.attr('for', SC.guidFor(this._checkboxRenderer));
    
    this.renderTitleRenderer(context);
    
    this.resetChanges();
  },
  
  update: function(cq) {
    this.updateCheckboxRenderer(cq);
    this.updateTitleRenderer(cq);
    this.resetChanges();
  },
  
  renderCheckboxRenderer: function(context) {
    this._checkboxRenderer = this.theme.renderer('checkbox');

    this._checkboxRenderer.attr({
      classNames: this.classNames,
      size: this.size,
      name: this.name
    });

    this._checkboxRenderer.render(context);
  },
  
  updateCheckboxRenderer: function(cq) {
    this._checkboxRenderer.attr({
      classNames: {
        'sel': this.classNames.contains('sel'),
        'active': this.classNames.contains('active')
      },
      size: this.size,
      name: this.name
    });

    this._checkboxRenderer.update(cq);
  },
  
  renderTitleRenderer: function(context) {
    this._titleRenderer = this.theme.renderer('title');

    this._titleRenderer.attr({
      title: this.title,
      icon: this.icon,
      needsEllipsis: this.needsEllipsis,
      escapeHTML: this.escapeHTML
    });
 
    context = context.begin("span").addClass("label");
    this._titleRenderer.render(context);
    context = context.end();
  },

  updateTitleRenderer: function(cq) {
    this._titleRenderer.attr({
      title: this.title,
      icon: this.icon,
      needsEllipsis: this.needsEllipsis,
      escapeHTML: this.escapeHTML
    });

    this._titleRenderer.update(cq.find('span.label'));
  }
});

SC.BaseTheme.addRenderer(SC.BaseTheme.CheckboxControl);
