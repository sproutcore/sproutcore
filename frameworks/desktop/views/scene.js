// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple, Inc. All rights reserved.
// License:   Licened under MIT license (see license.js)
// ==========================================================================

/** @class

  Displays several views as scenes that can slide on and off the screen.  The
  scene view is a nice way to provide a simple effect of moving from a 
  higher level screen to a more detailed level screen.  You will be able to
  optionally choose the kind of animation used to transition the two scenes 
  as well if supported on the web browser.
  
  h1. Using The View
  
  To setup the scene view, you should define the 'scenes' property with an 
  array of scene names.  These will be the properties on the scene view that
  you can shift in an out of view as needed.  You can edit the scenes property
  at any time.  It will only be used when you start to transition from one
  scene to another.
  
  Next you should set your nowShowing property to the name of the scene you 
  would like to display.  This will cause the view to transition scenes if it
  is visible on screen.  Otherwise, it will simply make the new scene view 
  the current content view and that's it.

  @extends SC.View
  @since SproutCore 1.0
*/
SC.SceneView = SC.View.extend(
  /** @scope SC.SceneView.prototype */ {

  /**
    Array of scene names.  Scenes will slide on and off screen in the order
    that you specifiy them here.  That is, if you shift from a scene at index
    2 to a scene at index 1, the scenes will animation backwards.  If you
    shift to a scene at index 3, the scenes will animate forwards.
    
    The default scenes defined are 'master' and 'detail'.  You can replace or 
    augment this array as you like.
    
    @property {Array}
  */
  scenes: ['master', 'detail'],

  /**
    The currently showing scene.  Changing this property will cause the 
    scene view to transition to the new scene.  If you set this property to 
    null, an empty string, or a non-existant scene, then the scene will appear
    empty.
  */
  nowShowing: null
  
});
