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

SC.BaseTheme.Segmented = SC.Renderer.extend({
  name: 'segmented',
  sizes: [
    { name: SC.SMALL_CONTROL_SIZE, height: 18 },
    { name: SC.REGULAR_CONTROL_SIZE, height: 24 },
    { name: SC.HUGE_CONTROL_SIZE, height: 30 },
    { name: SC.JUMBO_CONTROL_SIZE, height: 44 }
  ],

  // renderers are renderers and that's all they are.
  render: function(context) {
    sc_super();

    var segments = this.segments, idx, len, segs = [],
        reusables = this._segments,
        segment, ren;

    context.addClass(this.themeName);

    if (!reusables) reusables = this._segments = [];

    // now, create new stuff
    for (idx = 0, len = segments.length; idx < len; idx++) {
      segment = segments[idx];

      // create an <a>
      context = context.begin("a");
      context.addClass('segment-' + idx);

      // check if we have a reusable renderer (waste not, want not)
      if (reusables.length > idx) {
        ren = reusables[idx];
      } else { // otherwise, create a new one.
        ren = this.theme.renderer('segment');
      }

      // set attributes
      ren.attr(segment);
      ren.attr('layoutDirection', this.layoutDirection);
      ren.attr('classNames', {
        'sc-first-segment': idx === 0,
        'sc-last-segment': idx === len - 1,
        'sc-middle-segment': idx < len - 1 && idx > 0
      });

      // render to context
      ren.render(context);

      // finish context
      context = context.end();

      // add renderer to our list
      segs.push(ren);
    }

    this._segments = segs;
  },

  update: function(cq) {
    this.updateClassNames(cq);
    cq.addClass(this.themeName);

    // this is actually performance-oriented. If we are completely changing the list of segments...
    // it may be faster to just re-render them all in one go. Plus it's simple.
    // Otherwise, we'd have to try to append or something like that,
    // which could end up tricky, ugly, and buggy.
    if (this._segments.length !== this.segments.length) {
      var layer = cq[0];
      if (!layer) return;
      var context = SC.RenderContext(layer);
      this.render(context);
      context.update();
      return;
    }

    // otherwise, just update each renderer
    var segments = this.segments, idx, len = segments.length, renderers = this._segments,
        segment, renderer;

    // loop through renderers+segments, and update them all
    for (idx = 0; idx < len; idx ++) {
      segment = segments[idx]; renderer = renderers[idx];
      renderer.attr(segment);
      renderer.attr('layoutDirection', this.layoutDirection);
      renderer.update(cq.find('.segment-' + idx));
    }
  },

  indexForClientPosition: function(cq, x, y) {
    var segments = cq.find('.sc-segment'), len = segments.length, idx, segment, r;
    for (idx = 0; idx < len; idx++) {
      segment = segments[idx];
      r = segment.getBoundingClientRect();
      if (this.layoutDirection == SC.LAYOUT_VERTICAL) {
        if (y > r.top && y < r.bottom) return idx;
      }
      else {
        if (x > r.left && x < r.right) return idx;
      }
    }
    return -1;
  }
});

SC.BaseTheme.addRenderer(SC.BaseTheme.Segmented);
