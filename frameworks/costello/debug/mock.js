// ========================================================================
// SproutCore -- JavaScript Application Framework
// Copyright ©2006-2008, Sprout Systems, Inc. and contributors.
// Portions copyright ©2008 Apple, Inc.  All rights reserved.
// ========================================================================

require('core');
require('system/object');

/**
  @namespace Mocks for unit testing
  @author Skip Baney
  @copyright 2006-2008, Sprout Systems, Inc. and contributors.
  @version 0.1
  
  Mock objects provide basic support for unit testing.  Look for subclasses.
  
*/
SC.Mock = {};

/**
* Base DOM event mock
* @extends SC.Object
*/
SC.Mock.DOMEvent = SC.Object.extend(
/** @scope SC.Mock.DOMEvent.prototype */ 
{
  type:    null,
  target:  null,
  stopped: false,
  preventDefault: function() {},
  stopPropagation: function() {}
});

/**
* Mock for key events
* @extends SC.Mock.DOMEvent
*/
SC.Mock.KeyEvent = SC.Mock.DOMEvent.extend(
/** @scope SC.Mock.KeyEvent.prototype */ 
{
  keyCode:  0,
  altKey:   false,
  ctrlKey:  false,
  shiftKey: false,
  metaKey:  false
});


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

