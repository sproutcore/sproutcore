// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple Inc. All rights reserved.
// License:   Licened under MIT license (see license.js)
// ==========================================================================

SC.BaseTheme.Disclosure = SC.BaseTheme.subtheme('disclosure');

/** @class
  While we could have disclosure control get its own renderer, this is pointless,
  as all it really amounts to is a different way of rendering a button.

  As such, while this will use 'disclosure' renderer to render the actual disclosure
  triangle, the disclosure control renderer will be named "button" and be in a 
  "disclosure" subtheme.

  @extends SC.Renderer
  @since SproutCore 1.1
*/
SC.BaseTheme.Disclosure.Button = SC.Renderer.extend({
  name: 'button',
  classNames: 'sc-disclosure-control',

  render: function(context) {
    sc_super();

    this.renderDisclosureRenderer(context);
    this.renderTitleRenderer(context);
  },

  update: function(cq) {
    this.updateClassNames(cq);
    this.updateDisclosureRenderer(cq);
    this.updateTitleRenderer(cq);
  },

  renderTitleRenderer: function(context) {
    this._titleRenderer = this.theme.renderer('title');
    this._titleRenderer.attr({
      title: this.title,
      icon: this.icon,
      needsEllipsis: this.needsEllipsis,
      escapeHTML: this.escapeHTML,

      size: this.size
    });

    context = context.begin("span").addClass("sc-button-label");
    this._titleRenderer.render(context);
    context = context.end();
  },

  updateTitleRenderer: function(cq) {
    this._titleRenderer.attr({
      title: this.title,
      icon: this.icon,
      needsEllipsis: this.needsEllipsis,
      escapeHTML: this.escapeHTML,

      size: this.size
    });

    this._titleRenderer.update(cq.find('span.sc-button-label'));
  },

  renderDisclosureRenderer: function(context) {
    this._disclosureRenderer = this.theme.renderer('disclosure');
    this._disclosureRenderer.attr({
      classNames: {
        sel: this.classNames.contains('sel'),
        active: this.classNames.contains('active')
      },

      size: this.size
    });

    this._disclosureRenderer.render(context);
  },

  updateDisclosureRenderer: function(cq) {
    this._disclosureRenderer.attr({
      classNames: {
        sel: this.classNames.contains('sel'),
        active: this.classNames.contains('active')
      },

      size: this.size
    });

    this._disclosureRenderer.update(cq);
  }

});

SC.BaseTheme.Disclosure.addRenderer(SC.BaseTheme.Disclosure.Button);

