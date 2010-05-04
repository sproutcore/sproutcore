// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

sc_require("views/toolbar");

/** @class
  NavigationBars do Great Things. They transition themselves (fade in/out) and
  all children (swoosh left/right). They accept isSwipeLeft and isSwipeRight views
  that handle, well, swiping. In short, they are neat.
  
  @extends SC.ToolbarView
  @since SproutCore 1.0
*/
SC.NavigationBarView = SC.ToolbarView.extend({
  init: function() {
    sc_super();
    
    if (!SC.Animatable) {
      SC.Logger.error(
        "NavigationBarView requires SC.Animatable. " +
        "Please make your app or framework require the animation framework. CRASH."
      );
    }
    
    this.mixin(SC.Animatable);
    this.transitions = this._transitions;
  },
  
  _transitions: { 
    opacity: {
      duration: 0.25, action: "didFinishTransition"
    } 
  },
  
  style: {
    opacity: 1
  },
  
  // callback
  didFinishTransition: function() {
    if (this.isBuildingIn) {
      // and please continue
      this.buildInDidFinish();
    } else if (this.isBuildingOut) this.buildOutDidFinish();
  },
  
  preBuildIn: function() {
    // first, fade this view out
    this.disableAnimation();
    this.adjust("opacity", 0).updateLayout();
    this.enableAnimation();
    
    // now, loop over child views
    var cv = this.get("childViews"), child, idx, len = cv.get("length");
    for (idx = 0; idx < len; idx++) {
      child = cv[idx];
      
      // if the child disables navigation transitions, skip
      if (child.disableNavigationTransition) continue;
      
      // make sure the navigation stuff is mixed in as needed
      if (!child._nv_mixedIn) this.mixinNavigationChild(child);
      
      // now, set the initial state, which is either to the left or to the right 100px.
      child.disableAnimation();
      child.transform(this.buildDirection === SC.TO_LEFT ? 100  : -100);
      child.enableAnimation();
    }
  },
  
  buildIn: function() {
    // first, we do the precursor
    this.preBuildIn();
    
    // then, we queue the actual animation
    this.invokeLater("startBuildIn", 10);
  },
  
  startBuildIn: function() {
    this.adjust("opacity", 1);

    // get our frame, because we use it when computing child frames.
    var cv = this.get("childViews"), child, idx, len = cv.get("length");
    for (idx = 0; idx < len; idx++) {
      child = cv[idx];
      if (child.disableNavigationTransition) continue;
      child.transform(0);
    }
  },

  buildOut: function() {
    this.adjust("opacity", 0);
    
    var cv = this.get("childViews"), child, idx, len = cv.get("length");
    for (idx = 0; idx < len; idx++) {
      child = cv[idx];
      if (child.disableNavigationTransition) continue;
      if (!child._nv_mixedIn) this.mixinNavigationChild(child);
      child.transform(this.buildDirection === SC.TO_LEFT ? -100  : 100);
    }
  },
  
  /* CHILD VIEWS */
  mixinNavigationChild: function(child) {
    if (child.isAnimatable) return;
    
    // mix in animatable
    child.mixin(SC.Animatable);
    
    // mix in the transitions (and the "natural" layout)
    child.mixin({
      transitions: {
        transform: {timing: SC.Animatable.TRANSITION_EASE_IN_OUT, duration: 0.25}
      },
      naturalLayout: child.get("layout"),
      transform: function(pos) {
        if (SC.Animatable.enableCSS3DTransforms) {
          this.adjust("transform", "translate3d(" + pos + "px,0px,0px)");
        } else {
          this.adjust("transform", "translate(" + pos + "px,0px)");          
        }
      }
    });
    
    // and mark as having mixed in.
    child._nv_mixedIn = YES;
  }
});