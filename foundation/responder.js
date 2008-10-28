// ========================================================================
// SproutCore
// copyright 2006-2008 Sprout Systems, Inc.
// ========================================================================

require('core') ;
require('foundation/object') ;
require('foundation/input_manager');

/**
  @class 
  
  A responder is capable of responding to events such as mouse clicks and key 
  presses.  
  
  All views are a type of responder, but you can extend this class yourself 
  as well to implement your own responders if you need to.
  
  @extends SC.Object
  
*/
SC.Responder = SC.Object.extend(
  /** @scope SC.Responder.prototype */
  {
    
  // .......................................................................
  // Managing Responder States
  //
  
  /**  
    This method will be called just before you become first responder to see
    if you want to be first responder.  If you don't want to handle
    keyboard events, return false. (this is the default).  Note that this is
    a property.
  */
  acceptsFirstResponder: false,
  
  /**
    This property is the next responder that should be allowed to handle
    events if you don't want to handle it.  For views, this is automatically
    set to your parentNode.
  */
  nextResponder: null,
  
  /**  
    This property is true whenever you are the first responder.  Observable.
  */
  isFirstResponder: false,

  pane: null,
  
  /**
    Call this method to become the first responder.  You will now be the
    first to receive keyboard events, etc.  Return false if you could not
    be made first responder for some reason.
  */
  becomeFirstResponder: function()
  {
    if (!this.get('acceptsFirstResponder')) return false; // responder doesn't want it

    var pane = this.get('pane');
    if (!pane) return false;                              // there's no pane of which to become FR.. doesn't matter if it *does* want it...

    if (pane.get('firstResponder') == this) return true;  // we already got it... and setting it again will trigger the willResign callback

    pane.set('firstResponder',this);
    return true;
  },
  
  /**
    Call this method if you no longer want to be first responder.  Normally
    you don't need to do this since you will lose firstResponder status
    when the user focuses a different view.
  */
  resignFirstResponder: function()
  {
    var pane = this.get('pane');
    if (!pane) return false;
    
    if (pane.get('firstResponder') != this) return false;
    
    pane.set('firstResponder',null);
    return true;
  },
  
  noResponderFor: function() {},
  
  /**
    This method will be called just before you become the first responder
    so you can make changes.
  */
  didBecomeFirstResponder: function() {},
  
  /**
    This method will be called just before you lose first responder status.
  */
  willLoseFirstResponder: function() {},


  // .......................................................................
  // Keyboard Events
  //
  
  /**
    Set this value to an SC.InputManager instance if you want to use a 
    custom input manager for this specific instance.  If you want to override
    the input manager used for all responders, replace SC.Responder.inputManager.
  */
  inputManager: function()
  {
    return SC.Responder.inputManager;
  }.property(),

  /**
    this method is invoked on the firstResponder whenever the user presses
    a key.  You can interpret this yourself or call interpretKeyEvents()
    which will use the inputManager to handle the event.  The default
    version just passes this onto the next responder.
  */
  keyDown: function(evt) {
    var nr = this.get('nextResponder') ;
    return (nr && nr.keyDown) ? nr.keyDown(evt) : false;
  },
  
  /**  
    This method is invoked on the firstResponder whenever the user releases
    a key.  Default version just passes onto the next responder.
  */
  keyUp: function(evt) {
    var nr = this.get('nextResponder') ;
    return (nr && nr.keyUp) ? nr.keyUp(evt) : false ;
  },
  
  /**  
    This method is invoked whenever the user changes the flag keys that are
    pressed.  pressedFlags is a hash.  The default version passes on to the
    nextRespoonder.
  */
  flagsChanged: function(pressedFlags, evt) {
    //var nr = this.get('nextResponder') || SC.window.get('firstResponder') ;
    var nr = this.get('nextResponder') ;
    return (nr && nr.flagsChanges) ? nr.flagsChanges(pressedFlags, evt) : false;
  },

  /**
    This will be called if a keydown event isn't handled by the responder chain.
  */
  performKeyEquivalent: function(keystring, evt) {
    return false;
  },

  /*
    call this method with one or more event objects to process the incoming
    text.  This will use the current inputManager (see above) to process
    the event and then to make an appropriate call on the receiver.
  */
  interpretKeyEvents: function(evts) {
    var inputManager = this.get('inputManager');
    if (inputManager) return inputManager.interpretKeyEvents(evts, this) ;
    return false ;
  },

  /**
  * Attempt to perform a method. If either the method does not exist, or the method returns false, send the request to the nextResponder.
  * @param {String} method The name of the method to perform
  * @return {SC.Responder} The responder that handled the command, or false
  */
  doCommand: function(method)
  {
    var responder = this;
    var args      = SC.$A(arguments);
    var method    = args.shift();
    var aliases   = this._commandAliases[method];
    var handled   = false;
    
    do {
      // attempt to handle the method
      if (this._responderHandledCommand(responder, method, args)) return responder;
      // perhaps under an alias?
      if (aliases)
      {
        for (var i=0, n=aliases.length; i < n; i++)
        {
          if (this._responderHandledCommand(responder, aliases[i], args)) return responder;
        }
      }
      // nope... next responder, please...
    } while (responder = responder.get('nextResponder'));
    // ran out of responders... 
    return false;
  },
  
  /** @private */
  _responderHandledCommand: function( responder, method, args )
  {
    // if the method does not explicitly return a false-y value (false, "", 0), it's considered "handled"
    // WARNING: returning null, or void is *not* == false
    return (responder.respondsTo(method) && (responder[method].apply(responder, args) != false));
  },
  /** @private */
  _commandAliases: {
    'mouseDown':   ['didMouseDown'],
    'mouseUp':     ['didMouseUp'],
    'doubleClick': ['didDoubleClick'],
    'click':       ['didClick'],
    'mouseDown':   ['didMouseDown']
  }

  // .......................................................................
  // Mouse Event Handlers
  //
  // Implement any of these if you want them to be implemented.
  
  // when the mouse is pressed.
  // mouseDown: function(evt) {},
  
  // when the mouse is releases
  // mouseUp: function(evt) {},
  
  // when the mouse is dragged
  // mouseDragged: function(evt) {},
  
  // when the mouse leaves the view responder
  // mouseOut: function(evt) {},
  
  // when the mouse enters the view.
  // mouseOver: function(evt) {},
  
  // when the mouse is moved.
  // mouseMoved: function(evt) {},
  
  // .......................................................................
  // Event Handlers
  //
  // These methods are called by the input manager in response to keyboard
  // events.  Most of these methods are defined here for you, but not actually
  // implemented in code.

  // insert the text or act on the key.
  // insertText: function(text) {},
  
  // if the user presses a key-combination event, this will be called so you
  // can run the command. 
  // performKeyEquivalent: function(charCode, evt) { return false; },
  
  // this method is called if no other view in the current view hierarchy is
  // bound to the escape or command-. key equivalent.  You can use this to 
  // cancel whatever operation is running.
  //
  // cancel: function(sender, evt) {},

  // delete the current selection or delete one element backward from the
  // current selection.
  // deleteBackward: function(sender, evt) {},
  
  // delete the current selection or delete one element forward from the
  // current selection.
  // deleteForward: function(sender, evt) {},
  
  // a field editor might respond by selecting the field before it.
  // insertBacktab: function(sender, evt) {},
  
  // insert a newline character or end editing of the receiver.
  // insertNewline: function(sender, evt) {},
  
  // insert a tab or move forward to the next field.
  // insertTab: function(sender, evt) {},
  
  // move insertion point/selection backward one. (i.e. left arrow key)
  // moveLeft: function(sender, evt) {},
  
  // move the insertion point/selection forward one (i.e. right arrow key)
  // in left-to-right text, this could be the left arrow key.
  // moveRight: function(sender, evt) {},
  
  // move the insertion point/selection up one (i.e. up arrow key)
  // moveUp: function(sender, evt) {},
  
  // move the insertion point/selection down one (i.e. down arrow key)
  // moveDown: function(sender, evt) {},
  
  // move left, extending the selection. - shift || alt
  // moveLeftAndModifySelection: function(sender, evt) {},
  
  // move right, extending the seleciton - shift || alt
  // moveRightAndModifySelection: function(sender, evt) {},
  
  // move up, extending the selection - shift || alt
  // moveUpAndModifySelection: function(sender, evt) {},
  
  // move down, extending selection - shift || alt
  // moveDownAndModifySelection: function(sender, evt) {},
  
  // move insertion point/selection to beginning of document.
  // moveToBeginningOfDocument: function(sender, evt) {},
  
  // move insertion point/selection to end of document.
  // moveToEndOfDocument: function(sender, evt) {},
  
  // page down
  // pageDown: function(sender, evt) {},
  
  // page up
  // pageUp: function(sender, evt) {},
  
  // select all
  // selectAll: function(sender, evt) {},
  
});

SC.Responder.mixin({
  inputManager: SC.InputManager.create()
}) ;
