// ========================================================================
// SproutCore
// copyright 2006-2008 Sprout Systems, Inc.
// ========================================================================

require('core') ;
require('foundation/object') ;

/** @class

  An InputManager knows how to convert incoming keyboard events and convert
  them into actions on a responder.  The default version should provide the
  correct behavior for most people.  However, if you want some special
  behavior, you can always write your own.

  An instance of this input manager is created as a property of
  SC.Responder.  To overide the inputManager used for all responders, replace
  this property with your own instance.  To override the inputManager used 
  only for one responder, set the inputManager property on your specific 
  instance.

  Note that generally you do not want to write your own inputManager.  They
  are tricky to get right.  Instead, you should implement the various handler
  methods on the responder.
  
  @extends SC.Object
  @author Charles Jolley
*/
SC.InputManager = SC.Object.extend(
/** @scope SC.InputManager.prototype */ {
  
  /**
    The is the primary entry point for the inputManager.  If you override
    the input manager, have this method process the key event and invoke
    methods on the responder. 
  */
  interpretKeyEvents: function(event, responder)
  {
    var codes = this.codesForEvent(event) ;
    var cmd = codes[0]; var chr = codes[1];
    if (!cmd && !chr) return false ;  //nothing to do.

    // if this is a command key, try to do something about it.
    if (cmd)
    {
      var methodName = SC.MODIFIED_COMMAND_MAP[cmd] || SC.BASE_COMMAND_MAP[cmd.split('_').last()];
      if (methodName && responder.respondsTo(methodName))
      {
        // the responder has a method matching the keybinding... call it.
        return responder[methodName]( event );
      }
    } 
    // if(cmd == "space") chr = " ";
    if ( chr && responder.respondsTo('insertText'))
    {
      // if we haven't returned yet and there is plain text, then do an insert of the text.
      return responder.insertText(chr);
    }

    return false ; //nothing to do.
  },
  
  /**
    this will get a standardized command code for the event.  It returns
    null if the event is plain text, not a command code.
  */  
  codesForEvent: function(e) {
    var code = e.keyCode ;
    var ret = null ; var key = null ;
    var modifiers = '' ;
    
    // handle function keys.
    if (code) {
      ret = SC.FUNCTION_KEYS[code] ;
      if (!ret && (e.altKey || e.ctrlKey)) ret = SC.PRINTABLE_KEYS[code] ;
      if (ret) {
        if (e.altKey) modifiers += 'alt_' ;
        if (e.ctrlKey) modifiers += 'ctrl_' ;
        if (e.shiftKey) modifiers += 'shift_' ;
      }
    }

    // otherwise just go get the right key.
    if (!ret) {
      var code = e.charCode || e.keyCode ;
      key = ret = String.fromCharCode(code) ;
      var lowercase = ret.toLowerCase() ;
      if (ret != lowercase) {
        modifiers = 'shift_' ;
        ret = lowercase ;
      } else ret = null ;
    }

    if (ret) ret = modifiers + ret ;
    return [ret, key] ;
  }
    
});

SC.MODIFIED_COMMAND_MAP = {
  'ctrl_.': 'cancel',
  'shift_tab': 'insertBacktab',
  'shift_left': 'moveLeftAndModifySelection',
  'shift_right': 'moveRightAndModifySelection',
  'shift_up': 'moveUpAndModifySelection',
  'shift_down': 'moveDownAndModifySelection',
  'alt_left': 'moveLeftAndModifySelection',
  'alt_right': 'moveRightAndModifySelection',
  'alt_up': 'moveUpAndModifySelection',
  'alt_down': 'moveDownAndModifySelection',
  'ctrl_a': 'selectAll'
} ;

SC.BASE_COMMAND_MAP = {
  'escape': 'cancel',
  'backspace': 'deleteBackward',
  'delete': 'deleteForward',
  'return': 'insertNewline',
  'tab': 'insertTab',
  'left': 'moveLeft',
  'right': 'moveRight',
  'up': 'moveUp',
  'down': 'moveDown',
  'home': 'moveToBeginningOfDocument',
  'end': 'moveToEndOfDocument',
  'pagedown': 'pageDown',
  'pageup': 'pageUp'
} ;

SC.MODIFIER_KEYS = {
  16:'shift', 17:'ctrl', 18: 'alt'
};

SC.FUNCTION_KEYS = {
  8: 'backspace',  9: 'tab',  13: 'return',  19: 'pause',  27: 'escape',  
  33: 'pageup', 34: 'pagedown', 35: 'end', 36: 'home', 
  37: 'left', 38: 'up', 39: 'right', 40: 'down', 44: 'printscreen', 
  45: 'insert', 46: 'delete', 112: 'f1', 113: 'f2', 114: 'f3', 115: 'f4', 
  116: 'f5', 117: 'f7', 119: 'f8', 120: 'f9', 121: 'f10', 122: 'f11', 
  123: 'f12', 144: 'numlock', 145: 'scrolllock'
} ;

SC.PRINTABLE_KEYS = {
  32: ' ', 48:"0", 49:"1", 50:"2", 51:"3", 52:"4", 53:"5", 54:"6", 55:"7",
  56:"8", 57:"9", 59:";", 61:"=", 65:"a", 66:"b", 67:"c", 68:"d", 69:"e",
  70:"f", 71:"g", 72:"h", 73:"i", 74:"j", 75:"k", 76:"l", 77:"m", 78:"n",
  79:"o", 80:"p", 81:"q", 82:"r", 83:"s", 84:"t", 85:"u", 86:"v", 87:"w",
  88:"x", 89:"y", 90:"z", 107:"+", 109:"-", 110:".", 188:",", 190:".",
  191:"/", 192:"`", 219:"[", 220:"\\", 221:"]", 222:"\""
} ;

// make reverse keycode lookup for using in unit tests...
SC.KEY_CODES = {};
for (var i=0, n=256; i < n; i++)
{
  if (SC.MODIFIER_KEYS[i] !== undefined) {
    SC.KEY_CODES[ SC.MODIFIER_KEYS[i] ] = i;
  } else if (SC.FUNCTION_KEYS[i] !== undefined) {
    SC.KEY_CODES[ SC.FUNCTION_KEYS[i] ] = i;
  } else if (SC.PRINTABLE_KEYS[i] !== undefined) {
    SC.KEY_CODES[ SC.PRINTABLE_KEYS[i] ] = i;
  }
}


