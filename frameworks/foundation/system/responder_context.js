// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple Inc. All rights reserved.
// License:   Licened under MIT license (see license.js)
// ==========================================================================

sc_require('system/responder');

/** @class

  The root object for a responder chain.  A responder context can dispatch
  actions directly to a first responder; walking up the responder chain until
  it finds a responder that can handle the action.  
  
  If no responder can be found to handle the action, it will attempt to send
  the action to the defaultResponder.
  
  You can have as many ResponderContext's as you want within your application.
  Every SC.Pane and SC.Application automatically implements this mixin.
  
  Note that to implement this you must be a responder yourself.
  
  @extends SC.Responder
  @since SproutCore 1.0
*/
SC.ResponderContext = SC.Responder.extend({

  // ..........................................................
  // PROPERTIES
  // 
  
  isResponderContext: YES,
  
  /** @property
  
    When set to YES, logs tracing information about all actions sent and 
    responder changes.
  */
  trace: NO,
  
  /** @property
    The default responder.  Set this to point to a responder object that can 
    respond to events when no other view in the hierarchy handles them.
    
    You can also implement actions directly on the application object if you
    prefer.
  */
  defaultResponder: null,
  
  /** @property
    The next responder for an app is always its defaultResponder.
  */
  nextResponder: function() {
    return this.get('defaultResponder');
  }.property('defaultResponder').cacheable(),
  
  /** @property
    The first responder.  This is the first responder that should receive 
    actions.
  */
  firstResponder: null,

  // ..........................................................
  // METHODS
  // 

  /**
    Finds the next responder for the passed responder based on the responder's
    nextResponder property.  If the property is a string, then lookup the path
    in the receiver.
  */
  nextResponderFor: function(responder) {
    var next = responder.get('nextResponder');
    if (typeof next === SC.T_STRING) {
      next = SC.objectForPropertyPath(next, this);
    } else if (!next && (responder !== this)) next = this ;
    return next ;  
  },

  /**
    Finds the responder name by searching the responders one time.
  */
  responderNameFor: function(responder) {
    if (!responder) return "(No Responder)";
    else if (responder._scrc_name) return responder._scrc_name;
    
    // none found, let's go hunting...look three levels deep
    var n = this.NAMESPACE;
    this._findResponderNamesFor(this, 3, n ? [this.NAMESPACE] : []);
    
    return responder._scrc_name || responder.toString(); // try again
  },
  
  _findResponderNamesFor: function(responder, level, path) {
    var key, value;
    
    for(key in responder) {
      if (key === 'nextResponder') continue ;
      value = responder[key];
      if (value && value.isResponder) {
        if (value._scrc_name) continue ;
        path.push(key);
        value._scrc_name = path.join('.');
        if (level>0) this._findResponderNamesFor(value, level-1, path);
        path.pop();
      }
    }
  },
  
  /**
    Makes the passed responder into the new firstResponder for this 
    responder context.  This will cause the current first responder to lose 
    its responder status and possibly keyResponder status as well.
    
    When you change the first responder, this will send callbacks to 
    responders up the chain until you reach a shared responder, at which point
    it will stop notifying.
    
    @param {SC.Responder} responder
    @returns {SC.ResponderContext} receiver
  */
  makeFirstResponder: function(responder) {
    var current = this.get('firstResponder'), 
        last    = this.get('nextResponder'),
        trace   = this.get('trace'),
        common ;

    if (this._locked) {
      if (trace) {
        console.log('%@: AFTER ACTION: makeFirstResponder => %@'.fmt(this, this.responderNameFor(responder)));
      }

      this._pendingResponder = responder;
      return ;
    }
    
    if (trace) {
      console.log('%@: makeFirstResponder => %@'.fmt(this, this.responderNameFor(responder)));
    }
    
    this._locked = YES;
    this._pendingResponder = null;
    
    // Find the nearest common responder in the responder chain for the new
    // responder.  If there are no common responders, use last responder.
    common = responder ? this.nextResponderFor(responder) : null;
    while (common) {
      if (common.get('hasFirstResponder')) break;
      common = (common===last) ? null : this.nextResponderFor(common);
    }
    if (!common) common = last;
    
    // Cleanup old first responder
    this._notifyWillLoseFirstResponder(current, current, common);
    if (current) current.set('isFirstResponder', NO);

    // Set new first responder.  If new firstResponder does not have its 
    // responderContext property set, then set it.
    this.set('firstResponder', responder) ;
    if (responder) responder.set('isFirstResponder', YES);
    
    this._notifyDidBecomeFirstResponder(responder, responder, common);
    
    this._locked = NO ;
    if (this._pendingResponder) {
      this.makeFirstResponder(this._pendingResponder);
      this._pendingResponder = null;
    }
    
    return this ;
  },

  _notifyWillLoseFirstResponder: function(responder, cur, root) {
    if (cur === root) return ; // nothing to do

    cur.willLoseFirstResponder(responder);  
    cur.set('hasFirstResponder', NO);

    var next = this.nextResponderFor(cur);
    if (next) this._notifyWillLoseFirstResponder(responder, next, root);
  },
  
  _notifyDidBecomeFirstResponder: function(responder, cur, root) {
    if (cur === root) return ; // nothing to do

    var next = this.nextResponderFor(cur);
    if (next) this._notifyDidBecomeFirstResponder(responder, next, root);
    
    cur.set('hasFirstResponder', YES);
    cur.didBecomeFirstResponder(responder);  
  },
  
  /**
    Send the passed action down the responder chain, starting with the 
    current first responder.  This will look for the first responder that 
    actually implements the action method and returns YES or no value when 
    called.
    
    @param {String} action name of action
    @param {Object} sender object sending the action
    @param {Object} context optional additonal context info
    @returns {SC.Responder} the responder that handled it or null
  */
  sendAction: function(action, sender, context) {
    var working = this.get('firstResponder'),
        last    = this.get('nextResponder'),
        trace   = this.get('trace'),
        handled = NO,
        responder;

    this._locked = YES;
    if (trace) {
      console.log("%@: begin action '%@' (%@, %@)".fmt(this, action, sender, context));
    }
    
    while (!handled && working) {
      if (working.tryToPerform) {
        handled = working.tryToPerform(action, sender, context);
      }
      
      if (!handled) {
        working = (working===last) ? null : this.nextResponderFor(working);
      }
    }

    if (trace) {
      if (!handled) console.log("%@:  action '%@' NOT HANDLED".fmt(this,action));
      else console.log("%@: action '%@' handled by %@".fmt(this, action, this.responderNameFor(working)));
    }
    
    this._locked = NO ;
    
    if (responder = this._pendingResponder) {
      this._pendingResponder= null ;
      this.makeFirstResponder(responder);
    }
    
    
    return working ;
  }

});
