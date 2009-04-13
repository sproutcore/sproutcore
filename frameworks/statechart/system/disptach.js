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
  
  /**
    Specifies which object property hierarchical state machines are stored in.
    
    @type String
  */
  stateKey: 'state',
  
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
    var stateKey = this.get('stateKey') ;
    var path = SC._DISPATCH_PATH ;
    var current, target, handlerKey, superstateKey, res, idx, ixd2 ;
    
    // .......................................................................
    // Step 1. Process the event hierarchically if a state machine is 
    // available to send the event to.
    //
    
    // save the current state
    current = this[stateKey] ;
    if (!current) return NO ; // fast path -- this object does not use HSMs
    
    // okay, process the event hierarchically...
    res = this[stateKey](evt) ;
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
    
    if (res === undefined) res = SC.EVT_IGNORED_RES ;
    
    // .......................................................................
    // Step 2. Was a transition taken? if so, this[stateKey] is now set to the
    // target state. Figure out (and possibly execute) entry and exit actions.
    //
    
    if (res === SC.EVT_TRANSITION_RES) {
      target = this[stateKey] ; // save the target of the transition
      
      // .....................................................................
      // Exit the current state to the state that handled the event...
      //
      
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
      
      // .....................................................................
      // We've now exited from the original current state up to the state
      // that actually requested the transition, so make it current now...
      
      current = this[handlerKey] ;
      
      // .....................................................................
      // Now figure out--using a carefully orchestrated order of operations--
      // which states need to be exited and entered. Some states will be
      // exited during this task. Once the state transition topology has 
      // been discovered, exit the do-while loop immediately, go to Step 3, 
      // and finish the job.
      
      figureOutWhatToDo: // label used to exit do-while loop early
      do {
        // ...................................................................
        // (a) Is this a transition to self?
        //
        
        if (current === target) {
          // exit the handing state
          this[stateKey](SC.EVT_EXIT) ; // this[stateKey] == current
          
          // enter the target, aka this[stateKey] (actually do it below)
          idx = 0 ;
          
          // stop trying to figure out what to do...
          break figureOutWhatToDo ;
        }
        
        // ...................................................................
        // (b) Is the handling state the parent of the target state?
        //
        
        if (!done && this[target.superstateKey] === current) {
          // don't exit the handling state
          
          // enter the target, aka this[stateKey] (actually do it below)
          idx = 0 ;
          
          // stop trying to figure out what to do...
          break figureOutWhatToDo ;
        }
        
        // ...................................................................
        // (c) Do the handling state and the target state have the same 
        // parent?
        //
        
        if (current.superstateKey === target.superstateKey) {
          // exit the handing state
          this[handlerKey](SC.EVT_EXIT) ; // this[handlerKey] == current
          
          // enter the target, aka this[stateKey] (actually do it below)
          idx = 0 ;
          
          // stop trying to figure out what to do...
          break figureOutWhatToDo ;
        }
        
        // ...................................................................
        // (d) Is the handling state's parent the target state?
        //
        
        if (this[current.superstateKey] === target) {
          // exit the handing state
          this[handlerKey](SC.EVT_EXIT) ; // this[handlerKey] == current
          
          // don't enter the target state -- we're already in it
          idx = -1 ;
          
           // stop trying to figure out what to do...
          break figureOutWhatToDo ;
        }
        
        // ...................................................................
        // (e) Is the handling state an ancestor of the target?
        //
        
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
            break figureOutWhatToDo ;
            
          // nope, didn't find the handling state, so keep going up..
          } else superstateKey = this[superstateKey].superstateKey ;
        }
        
        // ...................................................................
        // (f) Is the handling state's superstate one of target's ancestors?
        //
        
        // exit the handing state
        this[handlerKey](SC.EVT_EXIT) ; // this[handlerKey] == current
        
        // update current to the handing state's superstate
        handlerKey = current.superstateKey ;
        
        // does the handling state even have a superstate?
        if (!handlerKey) {
          // FIXME: what should be done here?
          
          // no ancestors to check, stop trying to figure out what to do...
          break figureOutWhatToDo ;
          
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
              break figureOutWhatToDo ;
              
            // nope, try a lower superstate of target
            } else --idx2 ;
          } while (idx2 > 0)
        }
        
        // ...................................................................
        // (g) Are any of the handling state's ancestors an ancestor of
        // the target state?
        
        for (;;) {
          // exit the handing state's superstate
          this[handlerKey](SC.EVT_EXIT) ; // this[handlerKey] == current
          
          // update the handing state's superstate to it's superstate
          handlerKey = current.superstateKey ;
          
          // does the handling state's superstate even have a superstate?
          if (!handlerKey) {
            // FIXME: what should be done here?
            
            // no ancestors to check, stop trying to figure out what to do...
            break figureOutWhatToDo ;
            
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
                break figureOutWhatToDo ;
              } else --idx2 ;
            } while (idx2 > 0)
          }
        }
      } while(NO)
      
      // .....................................................................
      // Step 3. Enter all of the ancestors between target and the least 
      // common ancestor of the handling state and target discovered above...
      //
      
      do {
        this[path[idx]](SC.EVT_ENTER) ;
      } while ((--idx) > 0)
      
      // .....................................................................
      // Step 4. Enter the target state itself.
      //
      
      if (idx === 0) this[stateKey](SC.EVT_ENTER) ;
      
      // .....................................................................
      // Step 5. Initialize the target state's substates if necessary.
      //
      
      while (this[stateKey](SC.EVT_INIT) === SC.EVT_TRANSITION_RES) {
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
        if (idx === 0) this[stateKey](SC.EVT_ENTER) ;
        
        // the loop continues to apply any default transitions as substates
        // are entered...
      }
      
      // if we transitioned, we definitely handled the event...
      return YES ;
    }
    else {
      // otherwise, return NO if we completely ignored the event...
      return (res === SC.EVT_IGNORED_RES) ? NO : YES ;
    }
  }
  
});
