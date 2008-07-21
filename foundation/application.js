// ========================================================================
// SproutCore
// copyright 2006-2008 Sprout Systems, Inc.
// ========================================================================

require('core');
require('foundation/responder');

/** 

  @class

  The SC.Application object manages a SproutCore application. A single 
  instance is created and placed in a global variable named SC.app. All events 
  and actions are routed through this object.
 
  
  @extends SC.Responder
  @author Skip Baney
  @copyright 2006-2008, Sprout Systems, Inc. and contributors.
  @since SproutCore 1.0
*/
SC.Application = SC.Responder.extend( 
/** @scope SC.Application.prototype */ {

  /**
    The pane that is currently receiving key events.
    
    This is most often the SC.window object but if you display a popup or 
    some other such element, you may set this to some other value.
    
    @field
    @type {SC.View}
  */
  keyPane: function( key, value )
  {
    if ( value != undefined )
    {
      if (this._keyPane) this._keyPane.willResignKeyPane();
      if (this._keyPane) this._keyPane.set('isKeyPane', false);
      this._keyPane = value;
      if (this._keyPane) this._keyPane.set('isKeyPane', true);
      if (this._keyPane) this._keyPane.didBecomeKeyPane();
    }
    return this._keyPane || null;
  }.property(),

  /**
    The main pane for the application.  
    
    The main pane is usually the primary pane you expect users to work in. 
    It receives keyboard equivalent events and other operations even when
    another key pane is positioned over it.
    
    @field
    @type {SC.View}
  */
  mainPane: function( key, value )
  {
    if ( value != undefined )
    {
      if (this._mainPane) this._mainPane.willResignMainPane();
      if (this._mainPane) this._mainPane.set('isMainPane', false);
      this._mainPane = value;
      if (this._mainPane) this._mainPane.set('isMainPane', true);
      if (this._mainPane) this._mainPane.didBecomeMainPane();
    }
    return this._mainPane || null;
  }.property(),

  /**
    Starts the SproutCore application.
    
    Typically this will simply setup the SC.window object so that it starts
    to receive keyboard and mouse events and then makes the window both
    main and key pane.
    
    @returns {void}
  */
  run: function()
  {
    // primary application pane.
    SC.window.setup();
    SC.window.makeMainPane();
    SC.window.makeKeyPane();
  },

  /**
  * Route an action message to the appropriate responder
  * @param {String} action The action to perform - this is a method name.
  * @param {SC.Responder} target The object to perform the action upon. Set to null to search the Responder chain for a receiver.
  * @param {Object} sender The sender of the action
  * @returns return value info
  * @type Array
  */
  sendAction: function( action, target, sender )
  {
    var target = this.targetForAction(action, target, sender);
    return (!!target && (target.tryToPerform(action, sender) != false));
  },
  
  targetForAction: function( action, target, sender )
  {
    // no action, no target...
    if (!action || ($type(action) != T_STRING)) return null;

    // an explicit target was passed...
    if (target) {
      if ($type(target) === T_STRING) {
        target = SC.Object.objectForPropertyPath(target) ;
      }
      return target.respondsTo(action) ? target : null ;
    }

    // ok, no target was passed... try to find one in the responder chain
    var keyPane   = this.get('keyPane');
    var mainPane  = this.get('mainPane');

    // TODO: add in a check for Pane and App delegates once we add support for them...
    if (keyPane)
    {
      target = keyPane.get('firstResponder') || keyPane.get('defaultResponder') || keyPane;
      do {
        if (target.respondsTo(action)) return target;
      } while (target = target.get('nextResponder'));
    }
    if (mainPane && (mainPane != keyPane))
    {
      target = mainPane.get('firstResponder') || mainPane.get('defaultResponder') || mainPane;
      do {
        if (target.respondsTo(action)) return target;
      } while (target = target.get('nextResponder'));
    }
    // last stop, SC.app
    target = this;
    if (target.respondsTo(action)) return target;

    return null;
  },
  

  sendEvent: function( evt, target )
  {
    var target  = target || null;
    var handler = null;

    //console.log( '[SC.Application#sendEvent] type: %s, evt: %o, target: %o', evt._type, evt, target );

    if (target && target.respondsTo(evt._type))
    {
      // explicit target was passed... we send the event to that target only...
      return (target.tryToPerform(evt._type, evt)) ? target : false;
    }
    
    // ok... then we need to resolve the target based on event type...
    switch ( evt._type )
    {
      case 'keyDown':
      case 'keyUp':
      case 'flagsChanged':
        var pane = this.get('keyPane');
        if (!pane) return null;
        target = pane.get('firstResponder') || pane.get('defaultResponder') || pane;
        break;
      case 'mouseOver':
      case 'mouseOut':
      case 'mouseMoved':
      case 'mouseDown':
      case 'mouseUp':
      case 'click':
      case 'doubleClick':
        target = SC.window.firstViewForEvent(evt);
        break;
      default:
        // unrecognized event type.. bail...
        return null;
    }

    // unable to resolve a target... mouseDown on an element not in the view chain, key responder is null, etc...
    if (!target) return null;

    // calling doCommand will crawl up the responder chain until someone handles it or it hits the end of the chain (SC.PaneView).
    handler = target.doCommand( evt._type, evt );
    
    // unhandled keyDown event...
    if ((evt._type == 'keyDown') && !handler)
    {
      // lonely keyDown... the responder chain doesn't want you... 
      // perhaps someone else has defined you as a shortcut?
      if (this._attemptKeyEquivalent(evt)) return true;
      // no?... how about keyView navigation?
      if (this._attemptKeyInterfaceControl(evt)) return true;
    }
    
    //console.log( '[SC.Application#sendEvent] ----- handler: %o', handler );
    return handler;
  },

  _attemptKeyEquivalent: function( evt )
  {
    // keystring is a method name representing the keys pressed (i.e 'alt_shift_escape')
    var keystring = SC.Responder.inputManager.codesForEvent(evt).first();
    
    // inputManager couldn't build a keystring for this key event... nothing to do...
    if (!keystring) return false;
    
    var keyPane  = this.get('keyPane');
    var mainPane = this.get('mainPane');
    
    if (keyPane && keyPane.performKeyEquivalent(keystring, evt)) return true;
    if (mainPane && (mainPane != keyPane) && mainPane.performKeyEquivalent(keystring, evt)) return true;
    return this.performKeyEquivalent(keystring, evt);
  },
  
  _attemptKeyInterfaceControl: function( evt )
  {
    // keystring is a method name representing the keys pressed (i.e 'alt_shift_escape')
    var keystring = SC.Responder.inputManager.codesForEvent(evt).first();

    //console.log( '[SC.Application#_attemptKeyInterfaceControl] keystring: %s, evt: %o', keystring, evt );

    var pane = this.get('keyPane');
    if ( !pane ) return false;
    
    return pane.performKeyInterfaceControl(keystring, evt);
  }

});
