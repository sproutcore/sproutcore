require('core');
require('foundation/object');

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

