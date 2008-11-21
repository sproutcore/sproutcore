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

  Note that you can run a builder only once.  When the builder runs it will
  teardown its own contents.
  
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
    Set to NO once the builder has actually been run.  If you try to run the
    builder again (using create() or design()), the builder will raise an 
    exception.
    
    @property {Boolean}
  */
  canBuild: YES,
  
  /** 
    Creates a new instance of the view based on the currently loaded config.
    This will create a new DOM element.  Add any last minute attrs here.
  */
  create: function(attrs) {
    if (!this.canBuild) throw "This builder has already run." ;
    this.canBuild = NO ; // do not allow another call
    
    if (attrs) SC.mixin(this.attrs, attrs) ; // add last minute attrs
    var ret = this.defaultClass.create(this.attrs) ; // create view.
    this.attrs = attrs = null ; // teardown
    return ret ;
  },
  
  /**
    Creates a new instance of the view with the passed view as the parent
    view.
    
    This is called internally by views.
  */
  createChildView: function(owner, parentView, designMode) { 
    
    // try to find a matching DOM element by tracing the path
    var root = owner.rootElement ;
    var path = this.rootElementPath, idx=0, len = (path) ? path.length : 0;
    while((idx<len) && root) root = root.childNodes[path[idx++]];
    
    // Now add this to the attributes and create.
    var attrs = this.attrs || {} ;

    attrs.rootElement = root ;
    attrs.owner = owner ;
    attrs.parentView = parentView;

    return this.defaultClass.create(attrs) ;
  }
  
}) ;
