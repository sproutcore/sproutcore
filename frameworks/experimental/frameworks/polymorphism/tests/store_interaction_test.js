// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2013 7x7 Software, Inc.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================
/*global module, test, equals, same */


var store, Employee, Engineer, colin;

/** Test the interaction of a polymorphic record with the store. */
module("SC.Record:Interaction with SC.Store", {

  setup: function() {
    SC.run(function () {
      store = SC.Store.create();

      Employee = SC.Record.extend({
        name: SC.Record.attr(String)
      });

      Employee.isPolymorphic = true;

      Engineer = Employee.extend({
        isEngineer: YES
      });

      colin = store.createRecord(Engineer, { guid: 1, name: 'Colin' });
    });
  },

  teardown: function() {
    SC.run(function () {
      store.destroy();

      store = Employee = Engineer = colin = null;
    });
  }

});

test("store.replaceIdFor() should update the storeKeysById() object on the record class", function() {
  var storeKey = colin.get('storeKey');

  equals(Engineer.storeKeysById()['1'], storeKey, "The storeKey should be the same.");
  equals(Engineer.storeKeysById()['1'], Employee.storeKeysById()['1'], "The storeKey should match at any requested polymorphic level.");
  same(Engineer.storeKeysById(), Employee.storeKeysById(), "The storeKey to id mapping is actually the same instance between each polymorphic level.");

  SC.Store.replaceIdFor(storeKey, 2);

  equals(Engineer.storeKeysById()['2'], storeKey, "The storeKey should still be the same after replacing the id.");
  equals(Engineer.storeKeysById()['2'], Employee.storeKeysById()['2'], "The storeKey should still match at any requested polymorphic level after replacing the id.");
  same(Engineer.storeKeysById(), Employee.storeKeysById(), "The storeKey to id mapping is actually the same instance between each polymorphic level.");
});
