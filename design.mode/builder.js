// ========================================================================
// SproutCore
// copyright 2006-2008 Sprout Systems, Inc.
// ========================================================================

require('views/builder');

/** Extend the builder to support design mode.  
  Save the localized and design attributes separately for later editing.
*/
SC.mixin(SC.View.build.prototype, {
  
  setupDesignAttributes: function() {
    var attrs ;
    if (SC.none(this.designAttrs)) {
      attrs = SC.clone(this.attrs) ;
      this.designAttrs = this.attrs ;
      this.attrs = attrs ;
    }
    return attrs ;
  },
  
  /**
    Mixin the attributes, but first save the design attributes if needed
  */
  localizeAttributes: function(loc) {
    this.localizedAttrs = loc ; 
    return SC.mixin(this.setupDesignAttributes(), loc);
  },
  
  /**
    Mixin extra attributes, but first save design attributes if needed.  Also
    create a designer and apply it.
  */
  prepareAttributes: function(extra) {
    // add in any extra attributes if needed
    var attrs = this.setupDesignAttributes() ;
    if (attrs) {
      if (extra) SC.mixin(attrs, extra);
    } else attrs = extra || {} ;
    this.attrs = attrs ;
    
    return attrs ;
  },
  
  /** 
    Actually creates the view.  This is overloaded by the designer.
  */
  createView: function(viewClass, attrs) { 
    // also setup designer
    var ret = viewClass.create(attrs); 
    
    // add designer if page is in design mode
    var page = ret.get('page');
    if (page && page.get('needsDesigner')) {
      while(viewClass && !viewClass.Designer) {
        viewClass = viewClass.superclass;
      }
      var DesignerClass = (viewClass) ? viewClass.Designer : SC.View.Designer;
      ret.designer = DesignerClass.create({
        attributes: this.designAttrs,
        localized: this.localizedAttrs,
        view: ret 
      });
    }
    return ret ;
  },
  
  /**
    Internal method to cleanup memory consumed by internal attributes.  This
    is overloaded in design mode.
  */
  destroyAttributes: function() {
    delete this.attrs; 
    delete this.designAttrs; 
    delete this.localizedAttrs;
  }
    
}) ;
