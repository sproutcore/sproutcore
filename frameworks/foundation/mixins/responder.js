// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple, Inc. All rights reserved.
// License:   Licened under MIT license (see license.js)
// ==========================================================================

/** @static

  The Responder mixin provides common methods needed to respond to user-interface events in SproutCore.
  
  @namespace
  @since SproutCore 1.0
*/
SC.Responder = {

  /** @property
    The pane this responder belongs to.  This is used to determine where you 
    belong to in the responder chain.
  */
  pane: null,
  
  /** @property
    This is the nextResponder in the responder chain.  If the receiver does 
    not implement a particular event handler, it will bubble to the next 
    responder.
  */
  nextResponder: null,
  
  /** @property 
    YES if the view is currently first responder.  This property is always 
    edited by the pane during its makeFirstResponder() method.
  */
  isFirstResponder: NO,
  
  /** @property
    YES if the view is currently first responder and the pane the view belongs 
    to is also key pane.  While this property is set, you should expect to 
    receive keyboard events.
  */
  isKeyResponder: NO,
  
  /** @property
    Set to YES if your view is willing to accept first responder status.  This is used when calculcating key responder loop.
  */
  acceptsFirstResponder: NO,
  
  /** 
    Call this method on your view or responder to make it become first responder.
    
    @returns {SC.Responder} receiver
  */
  becomeFirstResponder: function() {  
    var pane = this.get('pane');
    if (pane && this.get('acceptsFirstResponder')) {
      if (pane.get('firstResponder') !== this) pane.makeFirstResponder(this);
    } 
    return this ;
  },
  
  /**
    Call this method on your view or responder to resign your first responder status. Normally this is not necessary since you will lose first responder status automatically when another view becomes first responder.
    
    @returns {SC.Responder} receiver
  */
  resignFirstResponder: function() {
    var pane = this.get('pane');
    if (pane && (pane.get('firstResponder') === this)) {
      pane.makeFirstResponder(null);
    }
    return YES;  
  },

  /**
    This method will be called just before you lose first responder status.
  */
  willLoseFirstResponder: function() {},
  
  /**
    This method is invoked just before you lost the key responder status.  The passed view is the view that is about to gain keyResponder status.  This gives you a chance to do any early setup.
    
    Remember that you can gain/lose key responder status either because another view in the same pane is becoming first responder or because another pane is about to become key.
    
    @param {SC.Responder} responder
  */
  willLoseKeyResponderTo: function(responder) {},
  
  /**
    This method is invoked just before you become the key responder.  The passed view is the view that is about to lose keyResponder status.  You can use this to do any setup before the view changes.
    
    Remember that you can gain/lose key responder status either because another view in the same pane is becoming first responder or because another pane is about to become key.
    
    @param {SC.Responder} responder
  */
  willBecomeKeyResponderFrom: function(responder) {},
  
  /**
    Invokved just after the responder loses key responder status.
  */
  didLoseKeyResponderTo: function(responder) {},
  
  /**
    Invoked just after the responder gains key responder status.
  */
  didBecomeKeyResponderFrom: function(responder) {},
  
  /**
    This method will be called just before you become the first responder
    so you can make changes.
  */
  didBecomeFirstResponder: function() {},
  
  /**
    This method will process a key input event, attempting to convert it to an appropriate action method and sending it up the responder chain.  The event is converted using the SC.KEY_BINDINGS hash, which maps key events into method names.  If no key binding is found, then the key event will be passed along using an insertText() method.
    
    @param {SC.Event} event
    @returns {Object} object that handled event, if any
  */
  interpretKeyEvents: function(event) {
    var codes = event.commandCodes(), cmd = codes[0], chr = codes[1];

    if (!cmd && !chr) return null ;  //nothing to do.

    // if this is a command key, try to do something about it.
    if (cmd) {
      var methodName = SC.MODIFIED_KEY_BINDINGS[cmd] || SC.BASE_KEY_BINDINGS[cmd.match(/[^_]+$/)[0]];
      if (methodName) {
        var target = this, pane = this.get('pane'), handler = null;
        while(target && !(handler = target.tryToPerform(methodName, event))){
          target = (target===pane)? null: target.get('nextResponder') ;
        }
        return handler ;
      }
    } 

    if (chr && this.respondsTo('insertText')) {
      // if we haven't returned yet and there is plain text, then do an insert 
      // of the text.  Since this is not an action, do not send it up the 
      // responder chain.
     return this.insertText(chr);
    }

    return null ; //nothing to do.
  },
  
  /**
    This method is invoked by interpretKeyEvents() when you receive a key event matching some plain text.  You can use this to actually insert the text into your application, if needed.
    
    @param {SC.Event} event
    @returns {Object} receiver or object that handled event
  */
  insertText: function(chr) {
    return this ;
  }

};
