// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple Inc. All rights reserved.
// License:   Licened under MIT license (see license.js)
// ==========================================================================

SC.BaseTheme.Checkbox = SC.BaseTheme.subtheme('checkbox');

/** @class
  The Checkbox-themed Button is a full button, complete with
  title. You can use this renderer to render the whole control,
  which will include the checkbox itself and the title.
  
  If you just want the checkbox, use the checkbox renderer (which
  this renderer actually uses).
  
  @extends SC.Renderer
  @since SproutCore 1.1
*/
SC.BaseTheme.Checkbox.Button = SC.Renderer.extend({
  name: 'button',
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

SC.BaseTheme.Checkbox.addRenderer(SC.BaseTheme.Checkbox.Button);
