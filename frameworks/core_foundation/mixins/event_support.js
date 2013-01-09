// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2013 Michael Krotscheck and contributors
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

sc_require("system/event");

/**
 * @class
 * 
 * Implements a simplified, instance-specific API that mirrors the DOM event
 * methods that may be mixed in to any class.
 * 
 * @author Michael Krotscheck
 * @since SproutCore 2.0
 */
SC.EventSupport =
/** @scope SC.EventSupport.prototype */
{
  /**
   * @private
   * 
   * This flag is used by the SproutCore event system to distinguish between a
   * basic DOM element, which has the addEventListener method, and a SproutCore
   * instance with EventSupport.
   */
  hasEventSupport: YES,
  
  /**
   * Bind an event to this element.
   * 
   * This method will cause the passed handler to be executed whenever a
   * relevant event occurs on the named element. This method supports a variety
   * of handler types, depending on the kind of support you need. For more
   * details on the handler types, please see SC.Event
   * 
   * @param {String}
   *          eventType the event type you want to respond to
   * @param {Object}
   *          target The target object for a method call or a function.
   * @param {Object}
   *          method optional method or method name if target passed
   * @param {Object}
   *          context optional context to pass to the handler as event.data
   * @returns {Object} receiver
   */
  addEventListener: function(eventType, target, method, context, useCapture) {
    return SC.Event.add(this, eventType, target, method, context, useCapture);
  },
  
  /**
   * Removes a specific handler or all handlers for an event or event+type.
   * 
   * To remove a specific handler, you must pass in the same function or the
   * same target and method as you passed into
   * <code>SC.EventSupport.addEventListener(). See that method for full documentation
   * on the parameters you can pass in.
   * 
   * If you omit a specific handler but provide both an element and eventType,
   * then all handlers for that element will be removed. If you provide only and
   * element, then all handlers for all events on that element will be removed.
   * 
   * @param {String}
   *          eventType the event type to remove
   * @param {Object}
   *          target The target object for a method call. Or a function.
   * @param {Object}
   *          method optional name of method
   * @returns {Object} receiver
   */
  removeEventListener: function(eventType, target, method) {
    return SC.Event.remove(this, eventType, target, method);
  },
  
  /**
   * Trigger an event execution immediately. You can use this method to simulate
   * arbitrary events on arbitrary elements.s
   * 
   * @param eventType
   *          {String} the event type
   * @param args
   *          {Array} optional argument or arguments to pass to handler.
   * @param donative ??
   * @returns {Boolean} Return value of trigger or undefined if not fired
   */
  triggerEvent: function(eventType, args, donative) {
    return SC.Event.trigger(this, eventType, args, donative);
  },
  
  /**
   * @private
   */
  destroyMixin: function() {
    // When an instance is destroyed, make sure we remove all remaining
    // event handlers so that GC can pick it up.
    SC.Event.remove(this);
  }

};