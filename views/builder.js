// ========================================================================
// SproutCore
// copyright 2006-2008 Sprout Systems, Inc.
// ========================================================================

require('system/builder');
require('views/view');

/** @constructor

  Builds a new view based on the passed instance.  The return object can be 
  used to actually generate a view or possibly its components when serializing
  a design.
  
  @param {Hash} attrs to assign to view
  @param {Array} optional path when bulding with HTML
  @returns {SC.Builder} view builder
*/
SC.View.build = SC.Builder.create({
  
  isViewBuilder: YES, // walk like a duck

  init: function(attrs, path) {
    this.attrs = attrs;
    this.rootElementPath = path ;
    return this ;
  },
  
  /** 
    Creates a new instance of the view based on the currently loaded config.
    This will create a new DOM element.  Add any last minute attrs here.
  */
  create: function(attrs) {
    if (attrs) SC.mixin(this.attrs, attrs) ;
    return this.defaultClass.create(this.attrs) ;
  },
  
  /**
    Creates a new instance of the view with the passed view as the parent
    view.  If the parentView has a DOM element, then follow the path to
    find the matching DOM.
    
    This is called internally by views.
  */
  createChildView: function(owner, parentView, designMode) { 
    
    // try to find a matching DOM element by tracing the path
    var root = owner.rootElement ;
    var path = this.rootElementPath, idx=0, len = (path) ? path.length : 0;
    while((idx<len) && root) root = root.childNodes[path[idx++]];
    
    // Now add this to the attributes and create.
    var attrs = this.attrs || {} ;

    if (designMode) {
      attrs.designAttributes = SC.clone(attrs) ; // save attributes
      attrs.designMode = YES;
    }

    attrs.rootElement = root ;
    attrs.owner = owner ;
    attrs.parentView = parentView;

    return this.defaultClass.create(attrs) ;
  },
  
  /**
    Creates a new instance of the view in design mode.  This will cause any
    outlets created by the view to be setup in design mode also.
  */
  design: function() {
    var attrs = this.attrs || {} ;
    attrs.designAttributes = SC.clone(attrs) ;
    attrs.designMode = YES ;
    return this.viewClass.create(attrs) ;  
  }
  
}) ;
