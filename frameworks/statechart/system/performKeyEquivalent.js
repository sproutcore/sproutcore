// ==========================================================================
// Project:   SproutCore Statechart - Hierarchical State Machine Library
// Copyright: ©2009 Sprout Systems, Inc. and contributors.
//            Portions ©2009 Apple, Inc. All rights reserved.
// License:   Licened under MIT license (see license.js)
// ==========================================================================

SC.mixin(SC.View.prototype,
/** SC.View.prototype */ {
  
  /**
    Attempts to dispatch the event to the object's statechart, if present. 
    Otherwise, has same behavior as the default SC.View implementation.
    
    @param {String} keystring
    @param {SC.Event} evt
    @returns {Boolean}
  */
  performKeyEquivalent: function(keystring, evt) {
    console.log('%@.performKeyEquivalent(keystring=%@, evt=%@)'.fmt(this, keystring, evt));
    var ret = null, childViews = this.get('childViews'), childView ;
    var len = childViews.length, idx = -1 ;
    
    while(!ret && (++idx<len)) {
      childView = childViews[idx] ;
      if (childView.hasStatechart) {
        console.log('dispatching event to child views');
        evt.sig = keystring ;
        ret = this.dispatch(evt) ;
      }
      
      if (!ret) ret = childView.performKeyEquivalent(keystring, evt) ;
    }
    return ret ;
  }
  
});

SC.mixin(SC.Pane.prototype,
/** SC.Pane.prototype */ {
  
  /**
    Attempts to dispatch the event to the object's statechart, if present. 
    Otherwise, has same behavior as the default SC.View implementation.
    
    @param {String} keystring
    @param {SC.Event} evt
    @returns {Boolean}
  */
  performKeyEquivalent: function(keystring, evt) {
    console.log('%@.performKeyEquivalent(keystring=%@, evt=%@)'.fmt(this, keystring, evt));
    var ret = null, childViews = this.get('childViews'), childView ;
    var len = childViews.length, idx = -1 ;
    
    while(!ret && (++idx<len)) {
      childView = childViews[idx] ;
      if (childView.hasStatechart) {
        evt.sig = keystring ;
        ret = childView.dispatch(evt) ;
      }
      
      if (!ret) ret = childView.performKeyEquivalent(keystring, evt) ;
    }
    
    if (ret) console.log("ret is true") ;
    
    if (!ret) {
      console.log('calling our default resonder') ;
      // now try our default responder...
      var defaultResponder = this.get('defaultResponder') ;
      if (defaultResponder) {
        if (defaultResponder.hasStatechart) {
          console.log('now...');
          evt.sig = keystring ;
          ret = defaultResponder.dispatch(evt) ;
        }

        if (!ret) ret = defaultResponder.performKeyEquivalent(keystring, evt) ;
        
      }
    }
    
    return ret ;
  }
  
});
