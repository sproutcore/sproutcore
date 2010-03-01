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
SC.EmptyTheme.renderers.Control = SC.Renderer.extend({
  calculateClasses: function() {
    var sel = this.isSelected, disabled = !this.isEnabled,
        names = this._TMP_CLASSNAMES ? this._TMP_CLASSNAMES : this._TMP_CLASSNAMES = {};
    names.mixed = sel === SC.MIXED_STATE;
    names.sel = sel && (sel !== SC.MIXED_STATE) ;
    names.active = this.isActive;
    
    return names;
  },
  render: function(context) {
    // update the CSS classes for the control.  note we reuse the same hash
    // to avoid consuming more memory
    
    context.setClass(this.calculateClasses()).addClass(this.controlSize);
  },
  
  update: function() {
    this.$().setClass(this.calculateClasses()).addClass(this.controlSize);
  }
});

SC.EmptyTheme.renderers.control = SC.EmptyTheme.renderers.Control.create();