// ==========================================================================
// Project:   SproutCore Costello - Property Observing Library
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

// ........................................................................
// ObserverSet
//

/**
  @namespace

  This private class is used to store information about observers on a
  particular key.  Note that this object is not observable.  You create new
  instances by calling SC.beget(SC.ObserverSet) ;

  @private
  @since SproutCore 1.0
*/
SC.ObserverSet = {

  /**
    Adds the named target/method observer to the set.  The method must be
    a function, not a string.
  */
  add: function(target, method, context) {
    var targetGuid = SC.guidFor(target),
        methodGuid = SC.guidFor(method),
        targets    = this._members,
        members    = this.members,
        indexes    = targets[targetGuid],       // get the set of methods
        index;

    if ( !indexes ) indexes = targets[targetGuid] = {};

    index = indexes[methodGuid];
    if (index === undefined) {
      indexes[methodGuid] = members.length;
    }
    else {
      //@if(debug)
      // If context was specified (such as when logging is enabled), we need to
      // add this new context to the enqueued target/method.
      var member, memberContext;
      if (context) {
        member        = members[index];
        memberContext = member[2];
        if (!memberContext) {
          member[2] = [context];
        }
        else if (!(memberContext instanceof Array)) {
          member[2] = [memberContext, context];
        }
      }
      //@endif

      return;
    }

    members.push([target, method, context]);
  },

  /**
    removes the named target/method observer from the set.  If this is the
    last method for the named target, then the number of targets will also
    be reduced.

    returns YES if the items was removed, NO if it was not found.
  */
  remove: function(target, method) {
    var targetGuid = SC.guidFor(target), methodGuid = SC.guidFor(method);
    var indexes = this._members[targetGuid], members = this.members;

    if( !indexes ) return false;

    var index = indexes[methodGuid];
    if ( index === undefined) return false;

    if (index !== members.length - 1) {
      var entry = (members[index] = members[members.length - 1]);
      this._members[SC.guidFor(entry[0])][SC.guidFor(entry[1])] = index;
    }

    members.pop();
    delete this._members[targetGuid][methodGuid];

    return true;
  },

  /**
    Invokes the target/method pairs in the receiver.  Used by SC.RunLoop
    Note: does not support context
  */
  invokeMethods: function() {
    var members = this.members, member;

    //@if(debug)
    var shouldLog = SC.LOG_DEFERRED_CALLS,
        target, method, methodName, context, contexts, originatingTarget,
        originatingMethod, originatingMethodName, originatingStack, j, jLen;
    //@endif

    for( var i=0, l=members.length; i<l; i++ ) {
      member = members[i];

      // method.call(target);
      member[1].call(member[0]);

      //@if(debug)
      // If we have context specified for who scheduled the particular
      // invocation, and logging is enabled, then output it.
      if (shouldLog) {
        target     = member[0];
        method     = member[1];
        methodName = method.displayName || method;
        context    = member[2];
        if (context) {
          // If the context is not an array, that means only one place scheduled
          // the invocation.
          if (!(context instanceof Array)) {
            // We'll treat single-scheduler cases specially to make the output
            // better for the user, even if it means some essentially-duplicated
            // code.
            originatingTarget     = context.originatingTarget;
            originatingMethod     = context.originatingMethod;
            originatingStack      = context.originatingStack;            
            originatingMethodName = (originatingMethod ? originatingMethod.displayName : "(unknown)") || originatingMethod;
            SC.Logger.log("Invoking runloop-scheduled method %@ on %@.  Originated by target %@,  method %@,  stack: ".fmt(methodName, target, originatingTarget, originatingMethodName), originatingStack);
          }
          else {
            SC.Logger.log("Invoking runloop-scheduled method %@ on %@, which was scheduled by multiple target/method pairs:".fmt(methodName, target));
            contexts = context;
            for (j = 0, jLen = contexts.length;  j < jLen;  ++j) {
              context               = contexts[j];
              originatingTarget     = context.originatingTarget;
              originatingMethod     = context.originatingMethod;
              originatingStack      = context.originatingStack;
              originatingMethodName = (originatingMethod ? originatingMethod.displayName : "(unknown)") || originatingMethod;
              SC.Logger.log("  [%@]  originated by target %@,  method %@,  stack:".fmt(j, originatingTarget, originatingMethodName), originatingStack);
            }
          }
        }
        else {
          // If we didn't capture information for this invocation, just report
          // what we can.
          SC.Logger.log("Invoking runloop-scheduled method %@ on %@, but we didn’t capture information about who scheduled it…".fmt(methodName, target));
        }
      }
      //@endif
    }
  },

  /**
    Returns a new instance of the set with the contents cloned.
  */
  clone: function() {
    var newSet = SC.ObserverSet.create(), memberArray = this.members;

    newSet._members = SC.clone(this._members);
    var newMembers = newSet.members;

    for( var i=0, l=memberArray.length; i<l; i++ ) {
      newMembers[i] = SC.clone(memberArray[i]);
      newMembers[i].length = 3;
    }

    return newSet;
  },

  /**
    Creates a new instance of the observer set.
  */
  create: function() {
    return new SC.ObserverSet.constructor();
  },

  getMembers: function() {
    return this.members.slice(0);
  },

  constructor: function() {
    this._members = {};
    this.members = [];
  }

} ;

SC.ObserverSet.constructor.prototype = SC.ObserverSet;
SC.ObserverSet.slice = SC.ObserverSet.clone;
SC.ObserverSet.copy = SC.ObserverSet.clone;

