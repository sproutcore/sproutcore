// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/**
  @namespace 
  Views that mix in SC.Buildable can be used by other views that mix in SC.BuildChildren;
  in this case, the paretn view (that mixes in BuildChildren) can call buildInChild and
  buildOutChild instead of appendChild and removeChild, and this allows adding and removing
  of child views in a delayed fashion.
  
  @since SproutCore 1.0
*/
SC.Buildable = {
  /**
    Walks like a duck.
  */
  isBuildable: YES,
  
  /**
    Whether the view is currently building in.
  */
  isBuildingIn: NO,
  
  /**
    Whether the view is currently building out.
  */
  isBuildingOut: NO,
  
  /**
    Implement this, and call didFinishBuildIn when you are done.
  */
  buildIn: function() {
    this.didFinishBuildIn();
  },
  
  /**
    Implement this, and call didFinsihBuildOut when you are done.
  */
  buildOut: function() {
    this.didFinishBuildOut();
  },
  
  /**
    This should reset (without animation) any internal states; sometimes called before.
    
    It is usually called before a build in, by the parent view.
  */
  resetBuild: function() {
    
  },
  
  /**
    Implement this if you need to do anything special when cancelling build out;
    note that buildIn will subsequently be called, so you usually won't need to do
    anything.
    
    This is basically called whenever build in happens.
  */
  buildOutDidCancel: function() {
    
  },
  
  /**
    Implement this if you need to do anything special when cancelling build in.
    You probably won't be able to do anything. I mean, what are you gonna do?
    
    If build in was cancelled, it means build out is probably happening. 
    So, any timers or anything you had going, you can cancel. 
    Then buildOut will happen.
  */
  buildInDidCancel: function() {
    
  },
  
  /**
    Call this when you have built in.
  */
  didFinishBuildIn: function() {
    this.isBuildingIn = NO;
    this._buildingInTo.tryToPerform("buildInDidFinishFor", this);
    this._buildingInTo = null;
  },
  
  /**
    Call this when you have finished building out.
  */
  didFinishBuildOut: function() {
    this.isBuildingOut = NO;
    this._buildingOutFrom.tryToPerform("buildOutDidFinishFor", this);
    this._buildingOutFrom = null;
  },
  
  /**
    @private (semi)
    Called by building parent view's buildInChild method. This prepares
    to build in, but unlike buildInToView, this is called _before_ the child
    is appended. This cancels any current build ins and calls resetBuild, amongst other things.
  */
  willBuildInToView: function(view) {
    var shouldBuildIn = NO;
    
    // we need to build in if the parent has changed
    if (view !== this._activeBuildParent) shouldBuildIn = YES;
    
    // stop any current build outs (and if we need to, we also need to build in again)
    if (this.isBuildingOut) {
      this.buildOutDidCancel();
      shouldBuildIn = YES;
    }
    
    // if the view has changed, we need to change
    if (view !== this._activeBuildParent) {
      shouldBuildIn = YES;
      
      // and we need to cancel any current build ins to, because we're about to do it on our own.
      if (this.isBuildingIn) this.buildInDidCancel();
    }
    
    if (shouldBuildIn) {
      this.isBuildingIn = NO;
      this.isBuildingOut = NO;
      this.resetBuild();
    }
    
    // so we know whether or not to ignore the buildInToView (for instance, if we were already building in)
    this._shouldBuildIn = shouldBuildIn;
  },
  
  /**
    @private (semi)
    Called by building parent view's buildInChild method.
  */
  buildInToView: function(view) {

    
    if (this._shouldBuildIn) {
      this._activeBuildParent = view;
      this._buildingInTo = view;
      this.isBuildingOut = NO;
      this.isBuildingIn = YES;
      this.buildIn();
    }
  },
  
  /**
    @private (semi)
    Called by building parent view's buildOutChild method.
    
    The supplied view should always be the parent view.
  */
  buildOutFromView: function(view) {
    // if we are already building out, do nothing.
    if (this.isBuildingOut) return;
    
    // cancel any build ins
    if (this.isBuildingIn) {
      this.buildInDidCancel();
    }
    
    // in any case, we need to build out
    this.isBuildingOut = YES;
    this.isBuildingIn = NO;
    this._buildingOutFrom = view;
    this._activeBuildParent = view;
    
    this.buildOut();
  }
  
};