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

SC.BaseTheme.Segment = SC.Renderer.extend({
  name: 'segment',
  classNames: 'sc-segment',

  updateButtonRenderer: function() {
    this._buttonRenderer.attr({
      title: this.title,
      icon: this.icon,
      toolTip: this.toolTip,
      classNames: {
        sel: this.classNames.contains('sel'),
        disabled: this.classNames.contains('disabled'),
        active: this.classNames.contains('active')
      },
      size: this.size
    });
  },


  render: function(context) {
    sc_super();

    // configure child renderers
    this._buttonRenderer = this.theme.renderer('button');
    this.updateButtonRenderer();
    this._buttonRenderer.render(context);

    if (this.width) context.addStyle('width', this.width + 'px');

    if (this.layoutDirection === SC.LAYOUT_HORIZONTAL) context.addStyle('display', 'inline-block');
    this.resetChanges();
  },
  
  update: function(cq) {
    this.updateClassNames(cq);

    // well, if we haven't changed, why not be a bit lazy
    if (!this.hasChanges()) return;

    this.updateButtonRenderer();
    this._buttonRenderer.update(cq);

    // update OUR stuff
    // NOTE: we are counting on not being called from an SC.View here;
    // if we were, we should reset these every time because it blows styles away.
    if (this.didChange("width")) cq.css('width', this.width ? this.width+'px' : '');
    if (this.didChange('layoutDirection')) cq.css('display', this.layoutDirection == SC.LAYOUT_HORIZONTAL ? 'inline-block' : '');
    this.resetChanges();
  },
});

SC.BaseTheme.addRenderer(SC.BaseTheme.Segment);

