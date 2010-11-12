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

SC.BaseTheme.renderers.Segmented = SC.Renderer.extend({

  controlSizeArray: [18, 24, 30, 44], // pre-create for performance (purely optional optimization)
  controlSizes: {
    18: SC.SMALL_CONTROL_SIZE,
    24: SC.REGULAR_CONTROL_SIZE,
    30: SC.HUGE_CONTROL_SIZE,
    44: SC.JUMBO_CONTROL_SIZE
  },

  init: function(attrs) {
    this._controlRenderer = this.theme.control({
      controlSizes: this.controlSizes,
      controlSizeArray: this.controlSizeArray // purely optional optimization
    });

    this._segments = [];
    this.attr(attrs);
  },
  
  // renderers are renderers and that's all they are.
  render: function(context) {
    var segments = this.segments, idx, len, segs = [],
        reusables = this._segments,
        segment, ren;
    
    this._controlRenderer.attr({
      isEnabled: this.isEnabled,
      isActive: this.isActive,
      isSelected: this.isSelected,
      controlSize: this.controlSize
    });
    this._controlRenderer.render(context);
    
    context.addStyle({
      'textAlign': this.align
    });
    
    // clean up; get rid of layers on our existing segments
    for (idx = 0, len = reusables.length; idx < len; idx++) reusables[idx].detachLayer();
    
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
        ren = this.theme.segment();
      }
      
      // set attributes
      ren.attr(segment);
      ren.attr('layoutDirection', this.layoutDirection);
      ren.attr('isFirstSegment', idx === 0);
      ren.attr('isLastSegment', idx === len - 1);
      ren.attr('isMiddleSegment', idx < len - 1 && idx > 0);
      ren.attr('controlSize', this.controlSize);
      
      // render to context
      ren.render(context);
      
      // finish context
      context = context.end();
      
      // add renderer to our list
      segs.push(ren);
      
      // finally, if we have a layer, we need to attach the renderer to the layer.
      ren.attachLayer(this.provide(".segment-" + idx));
    }
    
    this._segments = segs;
  },
  
  
  update: function() {
    // this is actually performance-oriented. If we are completely changing the list of segments...
    // it may be faster to just re-render them all in one go. Plus it's easy.
    // Otherwise, we'd have to try to append or something crazy like that, which wouldn't be so good;
    // or who knows what.
    if (this._segments.length !== this.segments.length) {
      var layer = this.layer();
      if (!layer) return;
      
      // re-render
      var context = SC.RenderContext(layer);
      this.render(context);
      context.update();
      
      // and done!
      return;
    }
    
    // otherwise, just update each renderer
    var segments = this.segments, idx, len = segments.length, renderers = this._segments,
        segment, renderer;
    
    this._controlRenderer.attr({
      isEnabled: this.isEnabled,
      isActive: this.isActive,
      isSelected: this.isSelected,
      controlSize: this.controlSize
    });
    this._controlRenderer.update();    
        
    // loop through renderers+segments, and update them all
    for (idx = 0; idx < len; idx ++) {
      segment = segments[idx]; renderer = renderers[idx];
      renderer.attr(segment);
      renderer.attr('layoutDirection', this.layoutDirection);
      renderer.attr('controlSize', this.controlSize);
      renderer.update();
    }
  },
  
  didAttachLayer: function(layer) {
    var segments = this._segments, segment, idx, len = segments.length;

    this._controlRenderer.attachLayer(layer);

    for (idx = 0; idx < len; idx++) {
      segment = segments[idx];
      
      // make a layer provider
      segment.attachLayer(this.provide(".segment-" + idx));
    }
  },
  
  willDetachLayer: function() {
    var segments = this._segments, segment, idx, len = segments.length;

    this._controlRenderer.detachLayer();
    
    // just detach the layer.
    for (idx = 0; idx < len; idx++) {
      segments[idx].detachLayer();
    }
  },
  
  indexForEvent: function(evt) {
    var pageX = evt.pageX, pageY = evt.pageY;
    
    var segments = this.$('.sc-segment'), len = segments.length, idx, segment, r;
    for (idx = 0; idx < len; idx++) {
      segment = segments[idx];
      r = segment.getBoundingClientRect();
      if (this.layoutDirection == SC.LAYOUT_VERTICAL) {
        if (pageY > r.top && pageY < r.bottom) return idx;
      }
      else {
        if (pageX > r.left && pageX < r.right) return idx;
      }
    }
    return -1;
  }
});

SC.BaseTheme.renderers.segmented = SC.BaseTheme.renderers.Segmented.create();