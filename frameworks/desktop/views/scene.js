// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple Inc. All rights reserved.
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
SC.SceneView = SC.ContainerView.extend(
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
  nowShowing: null,
  
  /**
    Speed of transition.  Should be expressed in msec.
  */
  transitionDuration: 200,
  
  _state: 'NO_VIEW', // no view

  /** @private
  
    Whenever called to change the content, save the nowShowing state and 
    then animate in by adjusting the layout.
    
  */
  replaceContent: function(content) {
    if (content && this._state===this.READY) this.animateScene(content);
    else this.replaceScene(content);
    return this ;
  },

  /** @private
  
    Invoked whenever we just need to swap the scenes without playing an
    animation.
  */
  replaceScene: function(newContent) {
    var oldContent = this._targetView,
        layout     = this.STANDARD_LAYOUT,
        scenes     = this.get('scenes'),
        idx        = scenes ? scenes.indexOf(this.get('nowShowing')) : -1;

    // cleanup animation here too..
    this._targetView = newContent ;
    this._targetIndex  = idx;
    
    if (this._timer) this._timer.invalidate();
    this._leftView = this._rightView = this._start = this._end = null;
    this._timer = null;
    
    
    this.removeAllChildren();

    if (oldContent) oldContent.set('layout', layout);
    if (newContent) newContent.set('layout', layout);
    
    if (newContent) this.appendChild(newContent);
    this._state = newContent ? this.READY : this.NO_VIEW ;
  },

  /** @private
  
    Invoked whenever we need to animate in the new scene.
  */
  animateScene: function(newContent) {
    var oldContent = this._targetView,
        outIdx     = this._targetIndex,
        scenes     = this.get('scenes'),
        inIdx      = scenes ? scenes.indexOf(this.get('nowShowing')) : -1,
        layout;

    if (outIdx<0 || inIdx<0 || outIdx===inIdx) {
      return this.replaceScene(newContent);
    }

    this._targetView = newContent ;
    this._targetIndex = inIdx; 
    
    // save some info needed for animation
    if (inIdx > outIdx) {
      this._leftView  = oldContent;
      this._rightView = newContent;
      this._target    = -1;
    } else {
      this._leftView  = newContent ;
      this._rightView = oldContent ;
      this._target    = 1 ;
    }

    // setup views
    this.removeAllChildren();

    if (oldContent) this.appendChild(oldContent)
    if (newContent) this.appendChild(newContent);

    // setup other general state
    this._start   = Date.now();
    this._end     = this._start + this.get('transitionDuration');
    this._state   = this.ANIMATING;
    this.tick();
  },

  /** @private - called while the animation runs.  Compute the new layout for
    the left and right views based on the portion completed.  When we finish
    call replaceScene().
  */
  tick: function() {  
    this._timer = null ; // clear out
    
    var now    = Date.now(),
        pct    = (now-this._start)/(this._end-this._start),
        target = this._target,
        left   = this._leftView,
        right  = this._rightView,
        layout, adjust;
        
    if (pct<0) pct = 0;
    
    // if we're done or the view is no longer visible, just replace the 
    // scene.
    if (!this.get('isVisibleInWindow') || (pct>=1)) {
      return this.replaceScene(this._targetView);
    }

    // ok, now let's compute the new layouts for the two views and set them
    layout = SC.clone(this.get('frame'));
    adjust = Math.floor(layout.width * pct);
    
    // set the layout for the views, depending on the direction
    if (target>0) {
      layout.left = 0-(layout.width-adjust);
      left.set('layout', layout);

      layout = SC.clone(layout);
      layout.left = adjust ;
      right.set('layout', layout);
      
    } else {
      layout.left = 0-adjust ;
      left.set('layout', layout);
      
      layout = SC.clone(layout);
      layout.left = layout.width-adjust;
      right.set('layout', layout);
    }

    this._timer = this.invokeLater(this.tick, 20);
    return this;
  },
  

  // states for view animation
  NO_VIEW: 'NO_VIEW',
  ANIMATING: 'ANIMATING',
  READY: 'READY',

  /** @private - standard layout assigned to views at rest */
  STANDARD_LAYOUT: { top: 0, left: 0, bottom: 0, right: 0 }
  
  
});
