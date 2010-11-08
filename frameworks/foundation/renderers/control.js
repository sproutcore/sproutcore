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
sc_require("renderers/renderer");
SC.BaseTheme.renderers.Control = SC.Renderer.extend({
  /**
    Returns the control size for a given numeric size.
  */
  controlSizeForSize: function(size) {
    var controlSizes = this.controlSizeArray, controlSizeNames = this.controlSizes;
    
    // create map if it isn't around
    if (!controlSizes) {
      var key;
      controlSizes = [];
      for (key in controlSizeNames) controlSizes.push(Number(key));
      controlSizes = controlSizes.sort();
      this.controlSizeArray = controlSizes;
    }
    
    // return exact matches immediately: 
    if (controlSizeNames[size]) return controlSizeNames[size];
    
    var idx, len, val = null;
    len = controlSizes.length;
    
    // if we haven't got nothing, don't do nothing.
    if (len === 0) return null;
    
    // find best match
    for (idx = 0; idx < len; idx++) {
      if (controlSizes[idx] > size) break;
      val = controlSizes[idx];
    }
    
    // and now find actual size.
    if (!val) return null;
    return controlSizeNames[val];
  },
  
  /**
    Returns a control size for a layout object, calling controlSizeForSize.
  */
  controlSizeForLayout: function(layout) {
    if (!SC.none(layout.height)) return this.controlSizeForSize(layout.height);
    return null;
  },
  
  /**
    Figures out the actual control size.
  */
  resolveControlSize: function() {
    var cs = this.controlSize;
    if (!cs) return null; // this way we know not to set anything.
    
    // if it is a string, it is a precreated size name
    if (SC.typeOf(cs) === SC.T_STRING) {
      return cs;
    }
    
    // if it is a number, it is a size
    if (SC.typeOf(cs) === SC.T_NUMBER) {
      return this.controlSizeForSize(cs);
    }
    
    // if it is a hash, it is a layout
    if (SC.typeOf(cs) === SC.T_HASH) {
      return this.controlSizeForLayout(cs);
    }
    
    // nothing valid here
    return null;
  },
  
  
  /** 
    Calculate appropriate hashes.
  */
  calculateClasses: function() {
    var sel = this.isSelected,
        names = this._TMP_CLASSNAMES ? this._TMP_CLASSNAMES : this._TMP_CLASSNAMES = {};
    names.mixed = sel === SC.MIXED_STATE;
    names.sel = sel && (sel !== SC.MIXED_STATE) ;
    names.active = this.isActive;
    
    return names;
  },
  render: function(context) {
    // update the CSS classes for the control.  note we reuse the same hash
    // to avoid consuming more memory
    context.setClass(this.calculateClasses());
    
    
    var controlSize = this.resolveControlSize();
    if (!controlSize) controlSize = SC.REGULAR_CONTROL_SIZE;
    
    if (controlSize) context.addClass(controlSize);
    this._last_control_size = controlSize;
  },
  
  update: function() {
    if (this.didChange('controlSize')) {
      var controlSize = this.resolveControlSize();
      if (!controlSize) controlSize = SC.REGULAR_CONTROL_SIZE;
      
      if (this._last_control_size != this.controlSize) this.$().setClass(this._last_control_size, NO);
      if (controlSize) this.$().setClass(controlSize, YES);
    }
    
    this.$().setClass(this.calculateClasses());
  }
});

SC.BaseTheme.renderers.control = SC.BaseTheme.renderers.Control.create();