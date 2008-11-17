// ========================================================================
// SproutCore
// copyright 2006-2008 Sprout Systems, Inc.
// ========================================================================

require('core') ;
require('foundation/system/object') ;
require('foundation/application/input_manager');

/** @static

  The Responder mixin provides common methods needed to respond to user-interface events in SproutCore.
  
  @namespace
  @since SproutCore 1.0
*/
SC.Responder = {
  
  /** @property
    This is the nextResponder in the responder chain.  If the receiver does not
    implement a particular event handler, it will bubble to the next responder.
  */
  nextResponder: null
  
};

