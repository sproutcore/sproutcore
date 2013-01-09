// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================
/*global module test equals context ok same */

eventReceiver = SC.Object.create({
  onEventReceived: function(event, context) {
    lastEvent.type = event.type;
    lastEvent.context = context;
    lastEvent.data = event.data;
    eventCount++;
  },
  onEventReceived2: function(event, context) {
    lastEvent.type = event.type;
    lastEvent.context = context;
    lastEvent.data = event.data;
    eventCount++;
  }
});

lastEvent = {
  type: null,
  context: null,
  data: null,
};
eventCount = 0;

function resetEvent() {
  lastEvent.type = null;
  lastEvent.context = null;
  lastEvent.data = null;
  eventCount = 0;
}

module("SC.EventSupport", {
  setup: function() {
    resetEvent();
  },
  
  teardown: function() {
    resetEvent();
  }
});

/**
 * Asserts that the mixin exists, is usable, and contains the expected API
 * methods.
 */
test("Identity", function() {
  ok(SC.EventSupport, "SC.EventSupport must exist");
  equals(SC.typeOf(SC.EventSupport), "hash", "Type of SC.EventSupport must be an object (mixin)");
  
  // Must not be able to create it
  try {
    SC.EventSupport.create();
    ok(false, "You must not be able to create an event");
  } catch(e) { // continue
  }
  
  // Must be mixinnable
  var obj = SC.Object.create(SC.EventSupport);
  ok(obj, "Mixin must create instance with event support");
  ok(obj.hasEventSupport, "Mixin must apply the hasEventSupport flag");
  ok(obj.addEventListener, "SC.EventSupport must have method addEventListener");
  ok(obj.removeEventListener, "SC.EventSupport must have method removeEventListener");
  ok(obj.triggerEvent, "SC.EventSupport must have method triggerEvent");
  
  // cleanup
  obj.destroy();
});

/**
 * Asserts that the addEventListener method works.
 */
test("Test addEventListener", function() {
  var obj = SC.Object.create(SC.EventSupport);
  resetEvent();
  
  obj.addEventListener('hello_world', eventReceiver, 'onEventReceived', 'new_data');
  SC.Event.trigger(obj, 'hello_world', "new_context");
  
  equals(lastEvent.type, "hello_world", "Last event must have been hello_world");
  equals(lastEvent.context, "new_context", "Last context must be 'new_context'");
  equals(lastEvent.data, "new_data", "Last event must be 'new_data'");
  equals(eventCount, 1, "Only one event must have been dispatched");
  
  obj.addEventListener('foo', eventReceiver, 'onEventReceived', 'foo_data');
  SC.Event.trigger(obj, 'foo', "foo_context");
  
  equals(lastEvent.type, "foo", "Last event must have been foo");
  equals(lastEvent.context, "foo_context", "Last context must be 'foo_context'");
  equals(lastEvent.data, "foo_data", "Last event must be 'foo_data'");
  equals(eventCount, 2, "2 events must have been dispatched");
  
  SC.Event.trigger(obj, 'bar', "bar_context");
  
  equals(lastEvent.type, "foo", "Last event must have been foo");
  equals(lastEvent.context, "foo_context", "Last context must be 'foo_context'");
  equals(lastEvent.data, "foo_data", "Last event must be 'foo_data'");
  equals(eventCount, 2, "2 events must have been dispatched");
  
  obj.destroy();
});

/**
 * Asserts that the triggerEvent method works.
 */
test("Test triggerEvent", function() {
  var obj = SC.Object.create(SC.EventSupport);
  resetEvent();
  
  obj.addEventListener('hello_world', eventReceiver, 'onEventReceived', 'new_data');
  obj.triggerEvent('hello_world', "new_context");
  
  equals(lastEvent.type, "hello_world", "Last event must have been hello_world");
  equals(lastEvent.context, "new_context", "Last context must be 'new_context'");
  equals(lastEvent.data, "new_data", "Last event must be 'new_data'");
  equals(eventCount, 1, "Only one event must have been dispatched");
  
  obj.addEventListener('foo', eventReceiver, 'onEventReceived', 'foo_data');
  obj.triggerEvent('foo', "foo_context");
  
  equals(lastEvent.type, "foo", "Last event must have been foo");
  equals(lastEvent.context, "foo_context", "Last context must be 'foo_context'");
  equals(lastEvent.data, "foo_data", "Last event must be 'foo_data'");
  equals(eventCount, 2, "2 events must have been dispatched");
  
  obj.triggerEvent('bar', "bar_data");
  
  equals(lastEvent.type, "foo", "Last event must have been foo");
  equals(lastEvent.context, "foo_context", "Last context must be 'foo_context'");
  equals(lastEvent.data, "foo_data", "Last event must be 'foo_data'");
  equals(eventCount, 2, "2 events must have been dispatched");
  
  obj.destroy();
  
});

/**
 * Asserts that the removeEventListener method works.
 */
test("Test removeEventListener", function() {
  var obj = SC.Object.create(SC.EventSupport);
  resetEvent();
  
  obj.addEventListener('hello_world', eventReceiver, 'onEventReceived', 'new_data');
  obj.triggerEvent('hello_world', "new_context");
  
  equals(lastEvent.type, "hello_world", "Last event must have been hello_world");
  equals(lastEvent.context, "new_context", "Last context must be 'new_context'");
  equals(lastEvent.data, "new_data", "Last event must be 'new_data'");
  equals(eventCount, 1, "Only one event must have been dispatched");
  
  obj.removeEventListener('hello_world', eventReceiver, 'onEventReceived');
  obj.triggerEvent('hello_world', "new_data");
  
  equals(lastEvent.type, "hello_world", "Last event must have been hello_world");
  equals(lastEvent.context, "new_context", "Last context must be 'new_context'");
  equals(lastEvent.data, "new_data", "Last event must be 'new_data'");
  equals(eventCount, 1, "Only one event must have been dispatched");
  
  // Try remove several
  obj.addEventListener('foo', eventReceiver, 'onEventReceived', 'foo_data');
  obj.addEventListener('foo', eventReceiver, 'onEventReceived2', 'foo_data');
  obj.triggerEvent('foo', "foo_context");
  equals(lastEvent.type, "foo", "Last event must have been foo");
  equals(lastEvent.context, "foo_context", "Last context must be 'foo_context'");
  equals(lastEvent.data, "foo_data", "Last event must be 'foo_data'");
  equals(eventCount, 3, "Three events expected");
  
  obj.removeEventListener('foo', eventReceiver, 'onEventReceived');
  obj.triggerEvent('foo', "foo_context");
  equals(eventCount, 4, "Four events expected");
  
  obj.addEventListener('foo', eventReceiver, 'onEventReceived', 'foo_data');
  obj.triggerEvent('foo', "foo_context");
  equals(eventCount, 6, "Six events expected");
  
  obj.removeEventListener('foo');
  obj.triggerEvent('foo', "foo_context");
  equals(eventCount, 6, "Six events expected");
  
  obj.destroy();
});

/**
 * Asserts that destroying an instance removes all event listeners.
 */
test("Test destroy", function() {
  var obj = SC.Object.create(SC.EventSupport);
  resetEvent();
  
  obj.addEventListener('hello_world', eventReceiver, 'onEventReceived', 'new_data');
  obj.addEventListener('foo', eventReceiver, 'onEventReceived', 'foo_data');
  obj.addEventListener('foo', eventReceiver, 'onEventReceived2', 'foo_data');
  obj.triggerEvent('hello_world', "new_context");
  
  equals(lastEvent.type, "hello_world", "Last event must have been hello_world");
  equals(lastEvent.context, "new_context", "Last context must be 'new_context'");
  equals(lastEvent.data, "new_data", "Last event must be 'new_data'");
  equals(eventCount, 1, "Only one event must have been dispatched");
  
  obj.destroy();
  obj.triggerEvent('hello_world', "new_context");
  obj.triggerEvent('foo', "foo_context");
  
  equals(lastEvent.type, "hello_world", "Last event must have been hello_world");
  equals(lastEvent.context, "new_context", "Last context must be 'new_context'");
  equals(lastEvent.data, "new_data", "Last event must be 'new_data'");
  equals(eventCount, 1, "Only one event must have been dispatched");
});
