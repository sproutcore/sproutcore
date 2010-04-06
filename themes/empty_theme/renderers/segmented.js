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
require("theme");
SC.EmptyTheme.renderers.Segmented = SC.Renderer.extend({
  init: function(attrs) {
    this._segments = [];
    this.attr(attrs);
  },
  
  // renderers are renderers and that's all they are.
  render: function(context) {
    var segments = this.segments, idx, len, segs = [],
        reusables = this._segments,
        segment, ren;
    
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
    
    // loop through renderers+segments, and update them all
    for (idx = 0; idx < len; idx ++) {
      segment = segments[idx]; renderer = renderers[idx];
      renderer.attr(segment);
      renderer.attr('layoutDirection', this.layoutDirection);
      renderer.update();
    }
  },
  
  didAttachLayer: function(provier) {
    var segments = this._segments, segment, idx, len = segments.length;
    for (idx = 0; idx < len; idx++) {
      segment = segments[idx];
      
      // make a layer provider
      segment.attachLayer(this.provide(".segment-" + idx));
    }
  },
  
  willDetachLayer: function() {
    var segments = this._segments, segment, idx, len = segments.length;
    
    // just detach the layer.
    for (idx = 0; idx < len; idx++) {
      segments[idx].detachLayer();
    }
  },
  
  indexForEvent: function(evt) {
    var elem = SC.$(evt.target) ;
    if (!elem || elem===document) return -1; // nothing found
    
    // start at the target event and go upwards until we reach either the 
    // root responder or find an element with an 'sc-segment' class.
    var root = this.$(), match = null ;
    while(!match && (elem.length>0) && (elem[0]!==root[0])) {
      if (elem.hasClass('sc-segment')) {
        match = elem;
      } else elem = elem.parent();
    }
    
    elem = root = null;

    // if a match was found, return the index of the match in subtags
    var ret = (match) ? this.$('.sc-segment').index(match) : -1;
    return ret;
  }
});

SC.EmptyTheme.renderers.segmented = SC.EmptyTheme.renderers.Segmented.create();