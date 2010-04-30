// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/**
  @namespace 
  Views that mix in SC.BuildChildren have an alternative to append/removeChild:
  buildIn/buildOutChild. This pair of functions will, assuming the subview is
  able to be built in and out, call buildIn after appendChild and call buildOut
  
  
  @since SproutCore 1.0
*/
SC.BuildChildren = {
  /**
    Call this to append a child while building it in. If the child is not
    buildable, this is the same as calling appendChild.
  */
  buildInChild: function(view) {
    if (view.isBuildable) view.willBuildInToView(this);
    this.appendChild(view);
    if (view.isBuildable) view.buildInToView(this);
  },
  
  /**
    Call to remove a child after building it out. If the child is not buildable,
    this will simply call removeChild.
  */
  buildOutChild: function(view) {
    if (view.isBuildable) view.buildOutFromView(this);
    else this.removeChild(view);
  },
  
  /**
    Implement this if you want to know when a child finished building in.
  */
  childDidBuildIn: function(child) {
    
  },
  
  /**
    Implement this if you want to know when a child finished building out.
    The child will no longer be a child view.
  */
  childDidBuildOut: function(child) {

  },
  
  /**
    @private
    Called by child view when build in finishes. This will call
    childViewDidBuildIn, which you can use.
  */
  buildInDidFinishFor: function(child) {
    this.childDidBuildIn(child);
  },
  
  /**
    @private
    Called by child view when build out finishes. This will remove the
    view and call childDidBuildOut, which you may use.
  */
  buildOutDidFinishFor: function(child) {
    this.removeChild(child);
    this.childDidBuildOut(child);
  }
};