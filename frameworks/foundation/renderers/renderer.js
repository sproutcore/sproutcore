// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple Inc. All rights reserved.
// License:   Licened under MIT license (see license.js)
// ==========================================================================

// technically, _we_ don't need it. But the individual renderers that sc_require this
// DO need it.
sc_require("system/theme");

/** @class
  Handles rendering for a view.
  
  Renderers have two primary functions: rendering and updating. Rendering is done
  to a context, to produce one giant string of rendered output. Updating is done
  to layers, usually using CoreQuery.
  
  You should implement at _least_ two functions in a renderer: render and update. You
  may also want to implement init, didAttachLayer, and willDetachLayer if you are using
  sub-renderers.
*/
SC.Renderer = {
  
  //
  // FUNCTIONS SUBCLASSES SHOULD/MAY IMPLEMENT
  //
  
  /**
    Should render into the supplied context.
    
    You should implement this by using the RenderContext API. You can use this.propertyName to
    fetch the value of properties.
  */
  render: function(context) {
    
  },
  
  /**
    Should update the attached layer, if there is one.
    
    You should implement primarily by using CoreQuery functions. If you use CoreQuery, the renderer itself will
    detect whether the layer exists, and do nothing if it does not. If you do _not_ use CoreQuery, you will need
    to call layer() to get the layer, and manually do nothing if there is none.
  */
  update: function() {
    
  },
  
  /**
    You usually should not implement this. It is more proper to implement willDetachLayer instead.
  */
  destroy: function() {
    
  },
  
  /**
    Called when a layer is attached. 
    
    The "layer" parameter is not necessarily the layer itself; it may be a layer provider.
    To get the real layer, use the renderer's "layer" method.
    If you have sub-renderers, you may want to relay this to them by calling their attachLayer methods.
    
    If event handling is necessary, this is the place to do it.
    
    Note: usually, you do not do event handling; instead, the view does, with its mouse and touch
    event handling. Instead, to handle events, you should make sure the causedEvent function works properly.
    
    @param {layer} layer The layer or layer provider being attached.
  */
  didAttachLayer: function(layer) {
    
  },
  
  /**
    Called when a layer is being detached.
  */
  willDetachLayer: function() {
    
  },
  
  //
  // Functions that may be called by subclasses
  //
  /**
    CoreQuery. Need I say more?
  */
  $: function(sel) {
    var ret, layer = this.layer();
    // note: SC.$([]) returns an empty CoreQuery object.  SC.$() would 
    // return an object selecting the document.
    ret = !layer ? SC.$([]) : (sel === undefined) ? SC.$(layer) : SC.$(sel, layer) ;
    layer = null ; // avoid memory leak
    return ret ;
  },
  
  /**
    Applies a context object's attributes and structure to a layer via (j/Core)Query
  */
  applyContextToLayer: function(context, cq) {
    var contextCQ = SC.$(context.join()), attrs, key;
    
    // get classes across to our layer
    cq.addClass(context.classNames().join(" "));
    
    // get attributes across as well
    attrs = contextCQ.attr();
    for (key in attrs) {
      if (!attrs.hasOwnProperty(key)) continue;
      cq.attr(key, attrs[key]);
    }
    
    // finally, append the children on contextCQ to our layer
    // might be better to accomplish this via innerHTML
    cq.append(contextCQ.children());
  },
  
  /**
    Returns YES if the event took place within this view.
  */
  causedEvent: function(evt) {
    return this.$().within(evt.target); // return YES if evt.target is or is inside the layer.
  },
  
  //
  // Functions that should be called by view
  //

  /**
    Call this to attach the renderer to a layer.
    If the layer is a layer provider (views, for instance, are layer providers), then
    the layer provider will be saved, allowing lazy-access.
    
    Views will call this on their own. However, if you use sub-renderers, you may call this
    from didAttachLayer to inform them that their layers have been attached.
  */
  attachLayer: function(layer) {
    // if there is any layer or layer provider, we must detach (because we would attach if it were the other way around)
    if (this._layer || this._layerProvider) this.detachLayer();
    
    if (layer.isLayerProvider) {
      // layer provider case: we just set the layer provider and move on
      this._layerProvider = layer;
    } else {
      // otherwise, set layer
      this._layer = layer;
    }
    
    // and, as we said, even though we did not necessarily set the real layer, we will act as if we did.
    // we're lazy. that doesn't mean we don't do anything. we just don't do it 'til the last minute.
    this.didAttachLayer(layer);
  },
  
  /**
    Called to detach the renderer from a layer.
    
    Views will call this on their own. However, if you have sub-renderers, you'll need to inform them
    that their layer is being detached by calling this method on them from willDetachLayer.
  */
  detachLayer: function() {
    this.willDetachLayer();
    this._layer = null;
    this._layerProvider = null;
  },
  
  /**
    Gets the layer, either from the layer set on the renderer itself, or from the renderer's layer
    provider (if any).
  */
  layer: function(layer) {
    if (this._layer) return this._layer;
    if (this._layerProvider) {
      this._layer = this._layerProvider.getLayer();
      return this._layer;
    }
    return null;
  },
  
  /**
    Extends this renderer.
  */
  extend: function(ext) {
    var ret = SC.mixin(SC.beget(this), ext),
        key, value, cur;
    
    ret.superclass = this;
    for(key in ret) {
      value = ret[key];
      if (value instanceof Function && !value.superclass && (value !== (cur=this[key]))) {
        value.base = cur;
      }
    }
    
    return ret;
  },
 
  /**
    Creates a constructor function for the renderer; you use this when you add the renderer
    to a theme.
  */
  create: function(ext) {
    ext = ext ? SC.mixin(SC.beget(this), ext) : this;
    return function(attrs) {
      var ret = SC.beget(ext);
      ret.theme = this;
      if (ret.init) {
        ret.init(attrs) ;
      } else {
        ret.attr(attrs);
      }
 
      return ret ;
    };
  },
 
  /**
    Sets one or more attributes. Also modifies a "changes" set (allowing, but not requiring you,
    to perform some optimizations).
  */
  attr: function(key, value) {
    var changes = this.changes, didChange, opts;

    if (typeof key === SC.T_STRING) {
       if (value === undefined) return this[key];
       if (this[key] === value) return this; // nothing to do
       this[key] = value;
       if (!changes) changes = this.changes = SC.CoreSet.create(); 
       changes.add(key);
       return this;

    } else {
      opts = key;
      for(key in opts) {
        if (!opts.hasOwnProperty(key)) continue;
        value = opts[key];
        if (this[key] !== value) {
          this[key] = value;
          if (!changes) changes = this.changes = SC.CoreSet.create();
          changes.add(key);
        }
      }
      return this;
    }
  },
  
  hasChanges: function() {
    if (!this.changes || this.changes.length === 0) return NO;
    return YES;
  },
  
  didChange: function(key){
    if (!this.changes) return NO;
    return this.changes.contains(key);
  },
  
  resetChanges: function() {
    this.changes = null;
  },
  
  /**
    @private
    Added to other layer providers.
  */
  _layerFinder: function() {
    var cq = this.renderer.$(this.selector);
    return cq[0];
  },
  
  /**
    Generates a layer provider that will provide the layer determined by the result
    of the provided CoreQuery selector (the first item, if any).
  */
  provide: function(sel) {
    return {
      isLayerProvider: YES,
      renderer: this,
      getLayer: this._layerFinder,
      selector: sel
    };
  },
 
  // other methods
  toString: function() {
    return "SC.Renderer#" + SC.guidFor(this);
  }
};