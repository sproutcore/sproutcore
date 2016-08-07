// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Apple Inc. and contributors.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================
/*globals module test equals */

(function() {
  var store, Person, Place;

  module("SC.Store#destroyRecords", {
    setup: function() {
      Person = SC.Record.extend({
        name: SC.Record.attr(String)
      });

      Place = SC.Record.extend({
        name: SC.Record.attr(String)
      });

      SC.RunLoop.begin();

      store = SC.Store.create();

      store.loadRecords(Person, [
        { guid: 1, name: 'Soups' },
        { guid: 2, name: 'Palmdale' },
        { guid: 3, name: 'Dubs' }
      ]);

      store.loadRecords(Place, [
        { guid: 4, name: 'San Francisco' },
        { guid: 5, name: "St. John's" }
      ]);

      SC.RunLoop.end();
    },

    teardown: function() {
      store = Person = Place = null;
    }
  });

  test('Destroy all records of a record type', function() {
    var records = store.find(Person);
    equals(records.get('length'), 3, 'precond - store has 3 records loaded');
    store.destroyRecords(Person);
    records = store.find(Person);
    equals(records.get('length'), 0, 'Number of Person records left');
  });

  test('Destroy only certain records of a record type', function() {
    var records = store.find(Person);
    equals(records.get('length'), 3, 'precond - store has 3 records loaded');
    store.destroyRecords(Person, [1, 2]);
    records = store.find(Person);
    equals(records.get('length'), 1, 'Number of Person records left')
  });

  test('Destroy all records of passed record types', function() {
    var people = store.find(Person),
        places = store.find(Place);

    equals(people.get('length'), 3, 'precond - store has 3 Person records loaded');
    equals(places.get('length'), 2, 'precond - store has 2 Place records loaded');

    store.destroyRecords([Person, Place]);

    people = store.find(Person);
    places = store.find(Place);

    equals(people.get('length'), 0, 'Number of Person records left');
    equals(places.get('length'), 0, 'Number of Place records left');
  });

  test('Destroy certain records of passed record types', function() {
    var people = store.find(Person),
        places = store.find(Place);

    equals(people.get('length'), 3, 'precond - store has 3 Person records loaded');
    equals(places.get('length'), 2, 'precond - store has 2 Place records loaded');

    store.destroyRecords([Person, Person, Place], [1, 2, 4]);

    people = store.find(Person);
    places = store.find(Place);

    equals(people.get('length'), 1, 'Number of Person records left');
    equals(places.get('length'), 1, 'Number of Place records left');
  });

})();
