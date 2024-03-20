/**
 * Complex Nested Records (SC.Record) Unit Test
 *
 * @author Evin Grano
 */
 /* globals module, test, equals, same, ok */

// ..........................................................
// Basic Set up needs to move to the setup and teardown
//
var NestedRecord, store, testParent;

var initModels = function(){
  NestedRecord.Address = SC.Record.extend({
    street: SC.Record.attr(String),
    city: SC.Record.attr(String),
    state: SC.Record.attr(String, {defaultValue: 'VA'})
  });

  NestedRecord.Person = SC.Record.extend({
    /** Child Record Namespace */
    nestedRecordNamespace: NestedRecord,

    name: SC.Record.attr(String),
    address: SC.Record.toOne('NestedRecord.Address', { nested: true }),
    children: SC.Record.toMany('NestedRecord.GrandchildRecordTest', { nested: true })
  });

  NestedRecord.ParentRecordTest = SC.Record.extend({
    /** Child Record Namespace */
    nestedRecordNamespace: NestedRecord,

    name: SC.Record.attr(String),
    person: SC.Record.toOne('NestedRecord.Person', { nested: true })
  });

  NestedRecord.GrandchildRecordTest = SC.Record.extend({
    name: SC.Record.attr(String)
  });
};

// ..........................................................
// Basic SC.Record Stuff
//
module("Basic SC.Record Functions w/ a Parent > Child > Child", {

  setup: function() {
    NestedRecord = SC.Object.create({
      store: SC.Store.create()
    });
    window.NestedRecord = NestedRecord;
    store = NestedRecord.store;
    initModels();
    SC.RunLoop.begin();
    testParent = store.createRecord(NestedRecord.ParentRecordTest, {
      name: 'Parent Name',
      person: {
        type: 'Person',
        name: 'Albert',
        address: {
          type: 'Address',
          street: '123 Sesame St',
          city: 'New York',
          state: 'NY'
        },
        children: [{
          name: 'Grandchild Name 1'
        },{
          name: 'Grandchild Name 2'
        }]
      }
    });
    SC.RunLoop.end();
  },

  teardown: function() {
    delete NestedRecord.ParentRecordTest;
    delete NestedRecord.Person;
    delete NestedRecord.Address;
    //delete window.NestedRecord;
    NestedRecord = null;
    testParent = null;
    store = null;
  }
});

test("Function: readAttribute() in the Parent Record", function() {

  equals(testParent.readAttribute('name'), 'Parent Name', "readAttribute should be correct for name attribute");
  equals(testParent.readAttribute('nothing'), null, "readAttribute should be correct for invalid key");
  // TODO: same gets hung up by Array.prototype.isEqual which rejects Array & Object items (b/c SC.isEqual does)
  // same(testParent.readAttribute('person'),
  //   {
  //     type: 'Person',
  //     name: 'Albert',
  //     address: {
  //       type: 'Address',
  //       street: '123 Sesame St',
  //       city: 'New York',
  //       state: 'NY'
  //     },
  //     children: [{
  //       name: 'Grandchild Name 1'
  //     },{
  //       name: 'Grandchild Name 2'
  //     }]
  //   },
  //   "readAttribute should be correct for 'person' child attribute");
});

test("Function: readAttribute() in the Parent > Child", function() {
  var person = testParent.get('person');
  ok(person, "check to see if the first child in the chain exists");
  equals(person.readAttribute('name'), 'Albert', "child readAttribute should be correct for name attribute");
  equals(person.readAttribute('nothing'), null, "child readAttribute should be correct for invalid key");
  same(person.readAttribute('address'),
    {
      type: 'Address',
      street: '123 Sesame St',
      city: 'New York',
      state: 'NY'
    },
    "readAttribute should be correct for address on the child");
});

test("Function: readAttribute() in the Parent > Child > Child", function() {
  var address = testParent.getPath('person.address');
  ok(address, "check to see if the child of the child in the chain exists with a getPath()");
  equals(address.readAttribute('street'), '123 Sesame St', "child readAttribute should be correct for street attribute w/ getPath()");
  equals(address.readAttribute('nothing'), null, "child readAttribute should be correct for invalid key w/ getPath()");

  // Test the individual gets
  var person = testParent.get('person');
  var address2 = person.get('address');
  ok(address2, "check to see if the child of the child in the chain exists with a get");
  equals(address2.readAttribute('street'), '123 Sesame St', "child readAttribute should be correct for street attribute w/ get()");
  equals(address2.readAttribute('nothing'), null, "child readAttribute should be correct for invalid key w/ get()");
});

test("Function: writeAttribute() in the Parent Record", function() {

  SC.run(function () { testParent.writeAttribute('name', 'New Parent Name'); });
  equals(testParent.get('name'), 'New Parent Name', "writeAttribute should be the new name attribute");

  SC.run(function () { testParent.writeAttribute('nothing', 'nothing'); });
  equals(testParent.get('nothing'), 'nothing', "writeAttribute should be correct for new key");

  SC.run(function () {
    testParent.writeAttribute('person',
      {
        type: 'Person',
        name: 'Al Gore',
        address: {
          type: 'Address',
          street: '123 Crazy St',
          city: 'Khacki Pants',
          state: 'Insanity'
        }
      });
  });
  same(testParent.readAttribute('person'),
    {
      type: 'Person',
      name: 'Al Gore',
      address: {
        type: 'Address',
        street: '123 Crazy St',
        city: 'Khacki Pants',
        state: 'Insanity'
      }
    },
    "writeAttribute with readAttribute should be correct for person child attribute");
});

test("Function: writeAttribute() in the Parent > Child", function() {
  var person = testParent.get('person');
  SC.run(function () { person.writeAttribute('name', 'Luke Skywalker'); });
  equals(person.readAttribute('name'), 'Luke Skywalker', "writeAttribute should be the new name attribute on the child");
  var p = testParent.readAttribute('person');
  equals(p.name, 'Luke Skywalker', "check to see if a writeAttribute single change on the child will reflect on the parent");

  // check for a change on the child of the child
  var newAddress = {
    type: 'Address',
    street: '1 Way Street',
    city: 'Springfield',
    state: 'IL'
  };
  SC.run(function () { person.writeAttribute('address', newAddress); });
  same(person.readAttribute('address'), {
    type: 'Address',
    street: '1 Way Street',
    city: 'Springfield',
    state: 'IL'
  }, "writeAttribute should be the new address attribute on the child");
  p = testParent.readAttribute('person');
  same(p.address, {
    type: 'Address',
    street: '1 Way Street',
    city: 'Springfield',
    state: 'IL'
  }, "check to see if a writeAttribute address change on the child will reflect on the parent");
});

test("Function: writeAttribute() in the Parent > Child > Child", function() {
  var address = testParent.getPath('person.address');
  SC.run(function () { address.writeAttribute('street', '1 Death Star Lane'); });
  equals(address.readAttribute('street'), '1 Death Star Lane', "writeAttribute should be the new name attribute on the child.street");
  // Now, test the person
  var p = testParent.readAttribute('person');
  equals(p.address.street, '1 Death Star Lane', "check to see if a writeAttribute change on the child will reflect on the child > child.address.street");
  // now test the Parent record
  var parentAttrs = testParent.get('attributes');
  equals(parentAttrs.person.address.street, '1 Death Star Lane', "check to see if a writeAttribute change on the child will reflect on the child > child > parent.attributes.person.address.street");
});

test("Basic Read", function() {

  // Test general gets
  equals(testParent.get('name'), 'Parent Name', "Parent.get() should be correct for name attribute");
  equals(testParent.get('nothing'), null, "Parent.get() should be correct for invalid key");

  // Test Child Record creation
  var p = testParent.get('person');
  // Check Model Class information
  ok(SC.kindOf(p, SC.Record), "(parent > child).get() creates an actual instance that is a kind of a SC.Record Object");
  ok(SC.instanceOf(p, NestedRecord.Person), "(parent > child).get() creates an actual instance of a Person Object");

  var a = testParent.getPath('person.address');
  // Check Model Class information
  ok(SC.kindOf(a, SC.Record), "(parent > child > child) w/ getPath() creates an actual instance that is a kind of a SC.Record Object");
  ok(SC.instanceOf(a, NestedRecord.Address), "(parent > child > child) w/ getPath() creates an actual instance of an Address Object");

});

test("Basic Write", function() {
  var oldP, p, key, oldKey, storeRef;
  var a, parentAttrs;
  // Test general gets
  SC.run(function () { testParent.set('name', 'New Parent Name'); });
  equals(testParent.get('name'), 'New Parent Name', "set() should change name attribute");
  SC.run(function () { testParent.set('nothing', 'nothing'); });
  equals(testParent.get('nothing'), 'nothing', "set should change non-existent property to a new property");

  // Test Child Record creation
  oldP = testParent.get('person');
  oldKey = oldP.get('id');
  SC.run(function () {
    testParent.set('person', {
      type: 'Person',
      name: 'Al Gore',
      address: {
        type: 'Address',
        street: '123 Crazy St',
        city: 'Khacki Pants',
        state: 'Insanity'
      }
    });
  });
  p = testParent.get('person');
  // Check Model Class information
  ok(SC.kindOf(p, SC.Record), "set() with an object creates an actual instance that is a kind of a SC.Record Object");
  ok(SC.instanceOf(p, NestedRecord.Person), "set() with an object creates an actual instance of a ChildRecordTest Object");

  // Check for changes on the child bubble to the parent.
  SC.run(function () { p.set('name', 'Child Name Change'); });
  equals(p.get('name'), 'Child Name Change', "after a set('name', <new>) on child, checking that the value is updated");
  ok(p.get('status') & SC.Record.DIRTY, 'check that the child record is dirty');
  ok(testParent.get('status') & SC.Record.DIRTY, 'check that the parent record is dirty');
  oldP = p;
  p = testParent.get('person');
  same(p, oldP, "after a set('name', <new>) on child, checking to see that the parent has received the changes from the child record");
  same(testParent.readAttribute('person'), p.get('attributes'), "after a set('name', <new>) on child, readAttribute on the parent should be correct for person child attributes");

  // Check changes on the address
  a = testParent.getPath('person.address');
  SC.run(function () { a.set('street', '321 Nutty Professor Lane'); });
  parentAttrs = testParent.readAttribute('person');
  same(a.get('attributes'), parentAttrs.address, "after a set('street', <new>) on address child, checking to see that the parent has received the changes from the child record");
});

test("Basic normalize()", function() {
  var pAttrs;

  SC.run(function () {
    testParent.set('person', {
      type: 'Person',
      name: 'Al Gore',
      address: {
        type: 'Address',
        street: '123 Crazy St',
        city: 'Khacki Pants'
      }
    });
  });
  testParent.normalize();
  pAttrs = testParent.get('attributes');
  equals(pAttrs.person.address.state, 'VA', "test normalization is the default value of VA");
});


test("Modifying Grandchild Nested Record Dirties the Main Record", function () {
  var childRecord,
      grandChildren,
      grandChild0;

  SC.run(function () {
    childRecord = testParent.get('person');
    grandChildren = childRecord.get('children');
    grandChild0 = grandChildren.objectAt(0);
  });

  // Check Model Class information
  ok(SC.kindOf(grandChild0, SC.Record), "get() creates an actual instance that is a kind of a SC.Record Object");
  ok(SC.instanceOf(grandChild0, NestedRecord.GrandchildRecordTest), "get() creates an actual instance of a GrandchildRecordTest Object");

  // Check for changes on the child bubble to the parent.
  SC.run(function () {
    grandChild0.set('name', 'Grandchild Name Change');
  });

  equals(grandChild0.get('name'), 'Grandchild Name Change', "after a set('name', <new>) on grandchild, checking that the value is updated");
  ok(grandChild0.get('status') & SC.Record.DIRTY, 'check that the grandchild record is dirty');
  ok(childRecord.get('status') & SC.Record.DIRTY, 'check that the child record is dirty');
  ok(testParent.get('status') & SC.Record.DIRTY, 'check that the parent record is dirty');
});

test("Adding Grandchild Nested Record Dirties the Main Record", function () {
  var childRecord,
      grandChildren,
      newGrandchildRecord;

  SC.run(function () {
    childRecord = testParent.get('person');
    grandChildren = childRecord.get('children');
  });

  SC.run(function () {
    newGrandchildRecord = store.createRecord(NestedRecord.GrandchildRecordTest, { name: 'New Grandchild Name' });
    grandChildren.pushObject(newGrandchildRecord);
  });

  ok(newGrandchildRecord.get('status') & SC.Record.DIRTY, 'check that the grandchild record is dirty');
  ok(childRecord.get('status') & SC.Record.DIRTY, 'check that the child record is dirty');
  ok(testParent.get('status') & SC.Record.DIRTY, 'check that the parent record is dirty');
});

test("Reloading Main Record Updates Existing Nested Records", function () {
  var childRecord,
      grandChildren,
      grandChild0;

  SC.run(function () {
    childRecord = testParent.get('person');
    grandChildren = childRecord.get('children');
    grandChild0 = grandChildren.objectAt(0);
  });

  SC.run(function () {
    store.writeDataHash(testParent.get('storeKey'), {
      guid: 'p3',
      name: 'Parent Name Updated',
      person: {
        type: 'Person',
        name: 'Child Name Updated',
        address: {
          type: 'Address',
          street: '123 Sesame St',
          city: 'New York',
          state: 'NY'
        },
        children: [{
          name: 'Grandchild Name 1 Updated',
          value: 'Punk Goo'
        },{
          name: 'Grandchild Name 2 Updated',
          value: 'Ponk Goo'
        }]
      }
    }, SC.Record.READY_CLEAN);
  });

  equals(childRecord.get('name'), 'Child Name Updated', "after writeDataHash, checking that the value is updated on child");
  equals(grandChild0.get('name'), 'Grandchild Name 1 Updated', "after writeDataHash, checking that the value is updated on grandchild");
});
