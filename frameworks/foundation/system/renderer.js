// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple Inc. All rights reserved.
// License:   Licened under MIT license (see license.js)
// ==========================================================================

/** @class
  Handles a rendering process.
*/
SC.Renderer = SC.Renderer = {
  //
  // FUNCTIONS SUBCLASSES SHOULD/MAY IMPLEMENT
  //
  
  /**
    Renders into the supplied context.
  */
  render: function(context) {
    
  },
  
  /**
    Updates the attached layer, if there is any.
  */
  update: function() {
    
  },
  
  /**
    You usually do not need to implement this. It is more proper to add code to didDetachLayer instead.
  */
  destroy: function() {
    
  },
  
  /**
    Attaches a layer. If event handling is necessary, this is the place to do it.
    Note: usually, you do not do event handling; instead, the view does, with its mouse and touch
    event handling. Instead, to handle events, you should make sure the within function works properly.
  */
  didAttachLayer: function(layer) {
    
  },
  
  willDetachLayer: function() {
    
  },
  
  //
  // Functions that may be called by subclasses
  //
  $: function(sel) {
    var ret, layer = this.layer();
    // note: SC.$([]) returns an empty CoreQuery object.  SC.$() would 
    // return an object selecting the document.
    ret = !layer ? SC.$([]) : (sel === undefined) ? SC.$(layer) : SC.$(sel, layer) ;
    layer = null ; // avoid memory leak
    return ret ;
  },
  
  /**
    Returns YES if the event took place within this view.
  */
  within: function(evt) {
    return this.$().within(evt.target); // return YES if evt.target is or is inside the layer.
  },
  
  //
  // Functions that should be called by view
  //

  /**
    Call this to attach the renderer to a layer.
    If the layer is a layer provider (views, for instance, are layer providers), then
    the layer provider will be saved, allowing lazy-access.
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
    this.didAttachLayer();
  },
  
  /**
    Called to detach the renderer from a layer.
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
    return SC.beget(this, ext);
  },
 
  /**
    Creates a constructor function for the renderer; you use this when you add the renderer
    to a theme.
  */
  create: function(ext) {
    ext = ext ? SC.beget(this, ext) : ext;
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
 
  attr: function(key, value) {
    var changes = this.changes, didChange, opts;

    if (SC.T_STRING === typeof key) {
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
  }
 
  // other methods
 
};