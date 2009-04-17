// ==========================================================================
// Project:   SproutCore Statechart - Hierarchical State Machine Library
// Copyright: ©2009 Sprout Systems, Inc. and contributors.
//            Portions ©2009 Apple, Inc. All rights reserved.
// License:   Licened under MIT license (see license.js)
// ==========================================================================

SC._DISPATCH_PATH = [] ; // avoid repeated allocations of this array

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
    var current, target, handlerKey, superstateKey, pathKey, res, idx, idx2 ;
    
    path.length = 0 ; // reset array
    
    // .......................................................................
    // Step 1. Process the event hierarchically if a state machine is 
    // available to send the event to.
    //
    
    // debugger ;
    
    // save the current state
    current = this[stateKey] ;
    if (!current) return NO ; // fast path -- this object does not use HSMs
    
    // okay, process the event hierarchically...
    res = this[this[stateKey]](evt) ;
    if (!res) {
      superstateKey = this[current].superstateKey ;
      while (superstateKey) {
        res = this[superstateKey](evt) ; // call superstate handler...
        if (res) {
          handlerKey = superstateKey ;
          break ;
        } else superstateKey = this[superstateKey].superstateKey ;
      }
    }
    
    if (!res) {
      return NO ; // we ignored the event
    
    // .......................................................................
    // Step 2. Was a transition taken? if so, this[stateKey] is now set to the
    // target state. Figure out (and possibly execute) entry and exit actions.
    //
    
    } else if (res === SC.EVT_TRANSITION_RES) {
      target = this[stateKey] ; // save the target of the transition
      path[0] = this[target].superstateKey ;
      
      // debugger ;
      
      // .....................................................................
      // Exit the current state to the state that handled the event...
      //
      
      if (handlerKey && current != this[handlerKey]) {
        this._sc_statechart_exit(current) ;
        superstateKey = this[current].superstateKey ;
        
        while (superstateKey && superstateKey !== handlerKey) {
          this._sc_statechart_exit(superstateKey) ;
          superstateKey = this[superstateKey].superstateKey ;
        }
      }
      
      // .....................................................................
      // We've now exited from the original current state up to the state
      // that actually requested the transition, so make it current now...
      
      if (handlerKey) current = handlerKey ;
      
      // debugger ;
      
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
          this._sc_statechart_exit(current) ;
          
          // enter the target, aka this[stateKey] (actually do it below)
          idx = 0 ;
          
          // stop trying to figure out what to do...
          break figureOutWhatToDo ;
        }
        
        // ...................................................................
        // (b) Is the handling state the parent of the target state?
        //
        
        if (this[target].superstateKey === current) {
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
        
        if (this[current].superstateKey === this[target].superstateKey) {
          // exit the handing state
          this._sc_statechart_exit(current) ;
          
          // enter the target, aka this[stateKey] (actually do it below)
          idx = 0 ;
          
          // stop trying to figure out what to do...
          break figureOutWhatToDo ;
        }
        
        // ...................................................................
        // (d) Is the handling state's parent the target state?
        //
        
        if (this[current].superstateKey === target) {
          // exit the handing state
          this._sc_statechart_exit(current) ;
          
          // don't enter the target state -- we're already in it
          idx = -1 ;
          
           // stop trying to figure out what to do...
          break figureOutWhatToDo ;
        }
        
        // debugger ;
        
        // ...................................................................
        // (e) Is the handling state an ancestor of the target?
        //
        
        // enter both target and its superstate
        idx = 1 ;
        superstateKey = path[1] = this[target].superstateKey ;
        
        // loop over the target state's ancestors, looking for the handling 
        // state (store the entry path along the way)
        if (superstateKey) superstateKey = this[superstateKey].superstateKey ;
        while (superstateKey !== undefined) {
          path[++idx] = superstateKey ; // store the entry path state key
          
          // is this the handling state?
          if (superstateKey === current) {
            // don't exit the handling state
            
            // don't enter the handling state either...
            --idx ;
            
            // stop trying to figure out what to do...
            break figureOutWhatToDo ;
            
          // nope, didn't find the handling state, so keep going up..
          } else superstateKey = this[superstateKey].superstateKey ;
        }
        
        // debugger ;
        
        // ...................................................................
        // (f) Is the handling state's superstate one of target's ancestors?
        //
        
        // exit the handing state's superstate
        this._sc_statechart_exit(current) ;
        
        // update current to the handing state's superstate
        handlerKey = this[current].superstateKey ;
        
        // does the handling state even have a superstate?
        if (!handlerKey) {
          // FIXME: what should be done here?
          debugger ;
          // console.log('(f) handleKey unexpectedly miissing');
          
          // no ancestors to check, stop trying to figure out what to do...
          break figureOutWhatToDo ;
          
        // yep, see if the handling state's superstate in an ancestor of 
        // the target state
        } else {
          current = handlerKey ;
          idx2 = idx ;
          
          // loop over the target state's ancestors, looking for the handling 
          // state's superstate
          do {
            pathKey = path[idx2] ;
            
            // did we find the handling state's superstate's superstate?
            if (pathKey && current === pathKey) {
              // don't exit the handling state's superstate
              
              // don't enter the handling state's superstate either...
              idx = idx2 - 1 ;
              
              // stop trying to figure out what to do...
              break figureOutWhatToDo ;
              
            // nope, try a lower superstate of target
            } else --idx2 ;
          } while (idx2 > 0)
        }
        
        // debugger ;
        
        // ...................................................................
        // (g) Are any of the handling state's ancestors an ancestor of
        // the target state?
        
        for (;;) {
          // exit the handing state's superstate
          this._sc_statechart_exit(handlerKey) ;
          
          // update the handing state's superstate to it's superstate
          handlerKey = this[current].superstateKey ;
          
          // does the handling state's superstate even have a superstate?
          if (!handlerKey) {
            // don't enter the handling state's superstate
            debugger ;
            
            // no ancestors to check, stop trying to figure out what to do...
            break figureOutWhatToDo ;
            
          // yep, see if the handling state's superstate's superstate is an 
          // ancestor of the target state
          } else {
            current = handlerKey ;
            var idx2 = idx ;
            
            // is the handling state's superstate's superstate one of target's
            // ancestors?
            do {
              pathKey = path[idx2] ;
              
              // did we find the handling state's superstate's superstate?
              if (pathKey && current === pathKey) {
                // don't exit the handling state's superstate's superstate
                
                // don't enter the handling state's superstate either...
                idx = idx2 - 1 ;
                
                // stop trying to figure out what to do...
                break figureOutWhatToDo ;
              } else {
                superstateKey = this[current].superstateKey ;
                current = superstateKey || null ;
                --idx2 ;
                if (!current) {
                  idx = -1 ;
                  break ;
                }
              }
            } while (idx2 >= 0)
          }
          
          if (!current) {
            idx = -1 ;
            break ;
          }
        }
      } while(NO)
      
      // debugger ;
      
      // .....................................................................
      // Step 3. Enter all of the ancestors between target and the least 
      // common ancestor of the handling state and target discovered above...
      //
      
      if (idx > 0) {
        do {
          this._sc_statechart_enter(path[idx]) ;
        } while ((--idx) > 0)
      }
      
      // enter the target if needed
      if (idx === 0) this._sc_statechart_enter(this[stateKey]) ;
      
      // .....................................................................
      // Step 4. Initialize the target state's substates if necessary.
      //
      
      // debugger ;
      
      current = this[stateKey] ;
      
      while (this._sc_statechart_init(this[stateKey]) === SC.EVT_TRANSITION_RES) {
        target = this[stateKey] ;
        
        // enter the target of the transition (a substate)
        idx = 0 ;
        
        if (target !== current) {
          // get the superstate of the target of the transition...
          target = path[++idx] = this[target].superstateKey ;
          
          // debugger ;
          
          if (target !== current) {
            // walk the state hierarchy until we find our target state, storing
            // state keys along the way
            while (target !== current) {
              target = path[++idx] = this[target].superstateKey ;
            } 
          }
          
          // don't enter current a second time...
          --idx ;
        }
        
        // now enter the target's superstates in top-down order...
        if (idx > 0) {
          do {
            this._sc_statechart_enter(path[idx]) ;
          } while ((--idx) > 0)
        }
        
        // enter the target if needed
        if (idx === 0) this._sc_statechart_enter(this[stateKey]) ;
        
        // the loop continues to apply any default transitions as substates
        // are entered...
      }
      
      // if we transitioned, we definitely handled the event...
      return YES ;
    }
    else {
      // we did handle the event, but we didn't make a state transition
      return YES ;
    }
  },
  
  /** @private
    Enters a given state. This method is overriden in debug mode to implement
    state tracing.
    
    @param {String} state a local property containing a state handler
    @returns {SC.EVT_HANDLED_RES or undefined}
  */
  _sc_statechart_enter: function(state) {
    console.log("-> enter " + state) ;
    return this[state](SC.EVT_ENTER) ;
  },
  
  /** @private
    Exits a given state. This method is overriden in debug mode to implement
    state tracing.
    
    @param {String} state a local property containing a state handler
    @returns {SC.EVT_HANDLED_RES or undefined}
  */
  _sc_statechart_exit: function(state) {
    console.log("<- exit " + state) ;
    return this[state](SC.EVT_EXIT) ;
  },
  
  /** @private
    Inits a given state. This method is overriden in debug mode to implement
    state tracing.
    
    @param {String} state a local property containing a state handler
    @returns {SC.EVT_TRANSITION_RES or undefined}
  */
  _sc_statechart_init: function(state) {
    var res = this[state](SC.EVT_INIT) ;
    if (res === SC.EVT_TRANSITION_RES) console.log(".. init substates of " + state) ;
    return res ;
  }
  
});
