// ==========================================================================
// Project:   SproutCore Statechart - Hierarchical State Machine Library
// Copyright: ©2009 Sprout Systems, Inc. and contributors.
//            Portions ©2009 Apple, Inc. All rights reserved.
// License:   Licened under MIT license (see license.js)
// ==========================================================================

// we don't ever use index zero, so initialize here to get a dense array...
SC._DISPATCH_PATH = [0] ; // avoid repeated allocations of this array

SC.mixin(SC.Object.prototype,
/** SC.Object.prototype */ {
  
  /** @private
    Dispatches events to objects that implement event-handling with 
    hierarchical state machines. SC.RootResponder tries this first; if the 
    return value is NO, SC.RootResponder will then try the normal reponder 
    methods (e.g. mouseDown:) defined by SC.ResponderProtocol.
    
    You should never need to call this method yourself.
    
    This implementation draws heavy inspiration from the QEP event processor
    written by Dr. Miro Samek, author of Practical Statecharts in C/C++. This
    JavaScript implementation was developed by Erich Ocean.
    
    @param {SC.Event} evt The event to handle
    @returns {Boolean} YES if the event was handled
  */
  dispatch: function(evt) {
   var path = SC._DISPATCH_PATH ;
   var current, target, handlerKey, superstateKey, res, idx, ixd2, done = NO ;
   
   // save the current state
   current = this.state ;
   if (!current) return NO ; // fast path -- this object does not use HSMs
   
   // okay, process the event hierarchically...
   res = this.state(evt) ;
   if (res === undefined) {
     superstateKey = current.superstateKey ;
     while (superstateKey) {
       res = this[superstateKey]() ; // call superstate handler...
       if (res !== undefined) {
         handlerKey = superstateKey ;
         break ;
       } else superstateKey = this[superstateKey].superstateKey ;
     }
   }
   
   // was a transition taken? if so, this.state is now set to the target state
   if (res === SC.EVT_TRANSITION) {
      target = this.state ; // save the target of the transition
      
      // exit current state to transition source...
      if (current != this[handlerKey]) {
        // we don't know the property name for current,
        // so there is no way to call it directly...
        current.call(this, SC.EVT_EXIT) ;
        superstateKey = current.superstateKey ;
        
        while (superstateKey && superstateKey !== handlerKey) {
          this[superstateKey](SC.EVT_EXIT) ;
          superstateKey = this[superstateKey].superstateKey ;
        }
      }
      
      // we've now exited from the original current state up to the state
      // that actually requested the transition, so make it current now...
      current = this[handlerKey] ;
      
      // (a) is this a transition to self?
      if (current === target) {
        // exit the handing state
        this.state(SC.EVT_EXIT) ; // this.state == current
        
        // enter the target, aka this.state (actually do it below)
        idx = 0 ;
        
        // stop trying to figure out what to do...
        done = YES ;
      }
      
      // (b) is the handling state the parent of the target state?
      if (!done && this[target.superstateKey] === current) {
        // don't exit the handling state
        
        // enter the target, aka this.state (actually do it below)
        idx = 0 ;
        
        // stop trying to figure out what to do...
        done = YES ;
      }
      
      // (c) do the handling state and the target state have the same parent?
      if (!done && current.superstateKey === target.superstateKey) {
        // exit the handing state
        this[handlerKey](SC.EVT_EXIT) ; // this[handlerKey] == current
        
        // enter the target, aka this.state (actually do it below)
        idx = 0 ;
        
        // stop trying to figure out what to do...
        done = YES ;
      }
      
      // (d) is the handling state's parent the target state?
      if (!done && this[current.superstateKey] === target) {
        // exit the handing state
        this[handlerKey](SC.EVT_EXIT) ; // this[handlerKey] == current
        
        // don't enter the target state -- we're already in it
        idx = -1 ;
        
         // stop trying to figure out what to do...
        done = YES ;
      }
      
      // (e) is the handling state an ancestor of the target?
      if (!done) {
        // enter both target and its superstate
        idx = 1 ;
        superstateKey = path[1] = target.superstateKey ;
        
        // loop over the target state's ancestors, looking for the handling 
        // state (store the entry path along the way)
        if (superstateKey) superstateKey = this[superstateKey].superstateKey ;
        while (superstateKey !== undefined) {
          path[++idx] = superstateKey ; // store the entry path state key
          
          // is this the handling state?
          if (this[superstateKey] === current) {
            // don't exit the handling state
            
            // don't enter the handling state either...
            --idx ;
            
            // stop trying to figure out what to do...
            done = YES ;
            
            // exit the loop
            superstateKey = undefined ;
            
          // nope, didn't find the handling state, so keep going up..
          } else superstateKey = this[superstateKey].superstateKey ;
        }
      }
      
      // (f) is the handling state's superstate one of target's ancestors?
      if (!done) {
        // exit the handing state
        this[handlerKey](SC.EVT_EXIT) ; // this[handlerKey] == current
        
        // update current to the handing state's superstate
        handlerKey = current.superstateKey ;
        
        // does the handling state even have a superstate?
        if (!handlerKey) {
          // FIXME: what should be done here?
          
          // no ancestors to check, stop trying to figure out what to do...
          done = YES ;
          
        // yep, see if the handling state's superstate in an ancestor of 
        // the target state
        } else {
          current = this[handlerKey] ;
          idx2 = idx ;
          
          // loop over the target state's ancestors, looking for the handling 
          // state's superstate
          do {
            // did we find the handling state's superstate?
            if (current === this[path[idx2]]) {
              // don't exit the handling state's superstate
              
              // don't enter the handling state's superstate either...
              idx = idx2 - 1 ;
              
              // stop trying to figure out what to do...
              done = YES ;
              
              // exit the loop
              idx2 = 0 ;
            
            // nope, try a lower superstate of target
            } else --idx2 ;
          } while (idx2 > 0)
        }
      }
      
      // (g) are any of the handling state's ancestors an ancestor of
      // the target state?
      if (!done) {
        do {
          // exit the handing state's superstate
          this[handlerKey](SC.EVT_EXIT) ; // this[handlerKey] == current
          
          // update the handing state's superstate to it's superstate
          handlerKey = current.superstateKey ;
          
          // does the handling state's superstate even have a superstate?
          if (!handlerKey) {
            // FIXME: what should be done here?
            
            // no ancestors to check, stop trying to figure out what to do...
            done = YES ;
            
          // yep, see if the handling state's superstate's superstate is an 
          // ancestor of the target state
          } else {
            current = this[handlerKey] ;
            var idx2 = idx ;
            
            // is the handling state's superstate's superstate one of target's
            // ancestors?
            do {
              // did we find the handling state's superstate's superstate?
              if (current=== this[path[idx2]]) {
                // don't exit the handling state's superstate's superstate
                
                // don't enter the handling state's superstate either...
                idx = idx2 - 1 ;
                
                // stop trying to figure out what to do...
                done = YES ;
                
                // break the inner loop
                idx2 = 0 ;
              } else --idx2 ;
            } while (idx2 > 0)
          }
        } while (!done)
      }
      
      // enter all of the ancestors between target and the least common
      // ancestor of the handling state and target discovered above...
      do {
        this[path[idx]](SC.EVT_ENTER) ;
      } while ((--idx) > 0)
      
      // now enter the target state itself
      if (idx === 0) this.state(SC.EVT_ENTER) ;
      
      // now initialize the target state's substates if necessary
      while (this.state(SC.EVT_INIT) === SC.EVT_TRANSITION) {
        // enter the target of the transition (a substate)
        idx = 0 ;
        
        // get the superstate of the target of the transition...
        superstateKey = path[++idx] = current.superstateKey ;
        current = this[superstateKey] ;
        
        // walk the state hierarchy until we find our target state, storing
        // state keys along the way
        while (current !== target) {
          superstateKey = path[++idx] = current.superstateKey ;
          current = this[superstateKey] ;
        }
        
        // now enter the target's substates in reverse order...
        do {
          this[path[idx]](SC.EVT_ENTER) ;
        } while ((--idx) > 0)
        
        // and finally enter the target's substate itself
        if (idx === 0) this.state(SC.EVT_ENTER) ;
        
        // the loop continues to apply any default transitions as substates
        // are entered...
      }
    }
    return YES ;
  }
  else {
    // only return NO if we completely ignored the event...
    return (res === SC.EVT_IGNORED) ? NO : YES ;
  }
  
});
