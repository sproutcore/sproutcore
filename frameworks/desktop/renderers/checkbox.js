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
SC.BaseTheme.Checkbox = SC.Renderer.extend({

  name: 'checkbox',
  classNames: {
    'sc-checkbox': YES, // for compatibility; themes should change to target 'checkbox'
    'sel': NO,
    'active': NO,
    'disabled': NO
  },

  sizes: [
    { name: SC.SMALL_CONTROL_SIZE, height: 14 },
    { name: SC.REGULAR_CONTROL_SIZE, height: 16 }
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

    context.attr('role', 'checkbox');
    context.attr('name', SC.guidFor(this));
    context.attr("aria-checked", this.classNames.contains('sel').toString());
    context.push('<span class="button"></span>');
    
    /* Render title */
    context = context.begin("span").addClass("label");
    this._titleRenderer.render(context);
    context = context.end();

    this.resetChanges();
  },

  update: function(cq) {
    this.updateClassNames(cq);

    this._titleRenderer.attr({
      title: this.title,
      icon: this.icon,
      needsEllipsis: this.needsEllipsis,
      escapeHTML: this.escapeHTML
    });

    cq.attr("aria-checked", this.classNames.contains('sel').toString());
  }
});

SC.BaseTheme.addRenderer(SC.BaseTheme.Checkbox);

