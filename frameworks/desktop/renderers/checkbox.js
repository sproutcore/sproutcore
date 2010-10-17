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

    context.attr('role', 'checkbox');
    context.attr('name', SC.guidFor(this));
    context.attr("aria-checked", this.classNames.contains('sel').toString());
    context.push('<span class="button"></span>');

    this.resetChanges();
  },

  update: function(cq) {
    this.updateClassNames(cq);
    cq.attr("aria-checked", this.classNames.contains('sel').toString());
  }
});

SC.BaseTheme.addRenderer(SC.BaseTheme.Checkbox);

