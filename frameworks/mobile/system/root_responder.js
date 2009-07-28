// ========================================================================
// SproutCore -- JavaScript Application Framework
// Copyright ©2006-2008, Sprout Systems, Inc. and contributors.
// Portions copyright ©2008 Apple Inc.  All rights reserved.
// ========================================================================

// Swap in platform-specific subclass.  Class-cluster FTW!
SC.RootResponder = SC.RootResponder.extend({

  platform: 'mobile',
  
  /**
    Setup event listeners for touch events.
  */
  setup: function() {
    sc_super();
    this.listenFor('touchstart touchmove touchend touchcancel'.w(), document);    
  },
  
  touchstart: function(evt) {
    try {
      var view = this.targetViewForEvent(evt) ;
      view = this._touchView = this.sendEvent('touchStart', evt, view) ;
      if (view && view.respondsTo('touchDragged')) this._touchCanDrag = YES ;
    } catch (e) {
      console.log('Exception during touchStart: %@'.fmt(e)) ;
      this._touchView = null ;
      this._touchCanDrag = NO ;
      return NO ;
    }
    return view ? evt.hasCustomEventHandling : YES;
  },

  touchmove: function(evt) {
    SC.RunLoop.begin();
    try {
      var lh = this._lastHovered || [] ;
      var nh = [] ;
      var view = this.targetViewForEvent(evt) ;
        
      // work up the view chain.  Notify of touchEntered and
      // touchMoved if implemented.
      while(view && (view !== this)) {
        if (lh.indexOf(view) !== -1) {
          view.tryToPerform('touchMoved', evt);
          nh.push(view) ;
        } else {
          view.tryToPerform('touchEntered', evt);
          nh.push(view) ;
        }
        
        view = view.get('nextResponder');
      }
      
      // now find those views last hovered over that were no longer found 
      // in this chain and notify of mouseExited.
      for(var loc=0; loc < lh.length; loc++) {
        view = lh[loc] ;
        var exited = view.respondsTo('touchExited') ;
        if (exited && !(nh.indexOf(view) !== -1)) {
          view.tryToPerform('touchExited',evt);
        }
      }
      
      this._lastHovered = nh; 
      
      // also, if a touchView exists, call the touchDragged action, if 
      // it exists.
      if (this._touchView) this._touchView.tryToPerform('touchDragged', evt);
    } catch (e) {
      console.log('Exception during touchMove: %@'.fmt(e)) ;
    }
    SC.RunLoop.end();
    return YES ;
  },
  
  touchend: function(evt) {
    try {
      evt.cancel = NO ;
      var handler = null, view = this._touchView ;
      
      // attempt the call only if there's a target.
      // don't want a touch end going to anyone unless they handled the 
      // touch start...
      if (view) handler = this.sendEvent('touchEnd', evt, view) ;
      
      // try whoever's under the mouse if we haven't handle the mouse up yet
      if (!handler) view = this.targetViewForEvent(evt) ;
      
      // cleanup
      this._touchCanDrag = NO; this._touchView = null ;
    } catch (e) {
      console.log('Exception during touchEnd: %@'.fmt(e)) ;
      this._touchCanDrag = NO; this._touchView = null ;
      return NO ;
    }
    return (handler) ? evt.hasCustomEventHandling : YES ;
  },
  
  /** @private
    Handle touch cancel event.  Works just like touch end except evt.cancel
    is set to YES.
  */
  touchcancel: function(evt) {
    evt.cancel = YES ;
    return this.touchend(evt);
  }  
  
}) ;
