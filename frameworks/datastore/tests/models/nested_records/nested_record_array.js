/*global same, equals, test, module, ok */
/**
 * Nested Record Array of SC.Records Unit Test
 *
 * @author Evin Grano
 */

// ..........................................................
// Basic Set up needs to move to the setup and teardown
//
var NestedRecord, store, testParent, testParent2;

var initModels = function () {

  NestedRecord.ChildRecordTest1 = SC.Record.extend({
    name: SC.Record.attr(String),
    value: SC.Record.attr(String)
  });

  NestedRecord.ChildRecordTest2 = SC.Record.extend({
     name: SC.Record.attr(String),
     info: SC.Record.attr(String),
     value: SC.Record.attr(String)
   });

  NestedRecord.ParentRecordTest = SC.Record.extend({
    /** Child Record Namespace */
    nestedRecordNamespace: NestedRecord,

    name: SC.Record.attr(String),
    elements: SC.Record.toMany('SC.Record', { nested: true }),

    defaultElements: SC.Record.toMany(NestedRecord.ChildRecordTest1, {
      isNested: true,
      defaultValue: function(record, key) {
        var array = [];
        array.pushObject({});
        return array;
      }
    }),

    defaultPolymorphicElements: SC.Record.toMany('SC.Record', {
      isNested: true,
      defaultValue: function(record, key) {
        var array = [];
        array.pushObject({
          type: 'ChildRecordTest1',
          name: 'Default Child 1',
          value: 'burninate'
        });
        return array;
      }
    })
  });
};


// ..........................................................
// Basic SC.Record with an Array of Children
//
module("Basic SC.Record w/ a Parent > Array of Children", {

  setup: function() {
    NestedRecord = SC.Object.create({
      store: SC.Store.create()
    });
    store = NestedRecord.store;
    initModels();
    SC.RunLoop.begin();
    testParent = store.createRecord(NestedRecord.ParentRecordTest, {
      name: 'Parent Name',
      elements: [
        {
          type: 'ChildRecordTest1',
          name: 'Child 1',
          value: 'eeney'
        },
        {
          type: 'ChildRecordTest2',
          name: 'Child 2',
          info: 'This is the other type',
          value: 'meeney'
        },
        {
          type: 'ChildRecordTest1',
          name: 'Child 3',
          value: 'miney'
        },
        {
          type: 'ChildRecordTest1',
          name: 'Child 4',
          value: 'moe'
        }
      ]
    });

    // FIXME: [EG] this configuration should work
    testParent2 = store.createRecord(NestedRecord.ParentRecordTest, {
      name: 'Parent 2',
      elements: []
    });
    SC.RunLoop.end();
  },

  teardown: function() {
    SC.run(function () {
      delete NestedRecord.ParentRecordTest;
      delete NestedRecord.ChildRecordTest1;
      delete NestedRecord.ChildRecordTest2;
      testParent.destroy();
      testParent2.destroy();
      store.destroy();
    });

    testParent = testParent2 = store = NestedRecord = null;
  }
});

test("Function: readAttribute()", function() {
  var elemsAry = testParent.readAttribute('elements');
  ok(elemsAry, "check to see that the child records array exists");
  equals(elemsAry.get('length'), 4, "checking to see that the length of the elements array is 4");
  same(elemsAry[0],
    {
      type: 'ChildRecordTest1',
      name: 'Child 1',
      value: 'eeney'
    },
    "check to see if the first child is as expected");
  same(elemsAry[3],
    {
      type: 'ChildRecordTest1',
      name: 'Child 4',
      value: 'moe'
    },
    "check to see if the last child is as expected");
});

test("Function: writeAttribute()", function() {

  SC.run(function () {
    testParent.writeAttribute('elements',
      [
        {
          type: 'ChildRecordTest1',
          name: 'Tom',
          value: 'Jones'
        },
        {
          type: 'ChildRecordTest1',
          name: 'Dick',
          value: 'Smothers'
        },
        {
          type: 'ChildRecordTest1',
          name: 'Harry',
          value: 'Balls'
        }
      ]
    );
  });

  var elemsAry = testParent.readAttribute('elements');
  ok(elemsAry, "after writeAttribute(), check to see that the child records array exists");
  equals(elemsAry.length, 3, "after writeAttribute(), checking to see that the length of the elements array is 3");
  same(elemsAry[0],
    {
      type: 'ChildRecordTest1',
      name: 'Tom',
      value: 'Jones'
    },
    "check to see if the first child is as expected");
  same(elemsAry[2],
    {
      type: 'ChildRecordTest1',
      name: 'Harry',
      value: 'Balls'
    },
    "check to see if the last child is as expected");
});

test("Basic Read", function() {

  // Test general gets
  equals(testParent.get('name'), 'Parent Name', "get should be correct for name attribute");
  equals(testParent.get('nothing'), null, "get should be correct for invalid key");

  // Test Child Record creation
  var arrayOfCRs = testParent.get('elements');
  // Check Model Class information

  var cr, dr, dpr;
  ok(SC.instanceOf(arrayOfCRs, SC.ChildArray), "check that get() creates an actual instance of a SC.ChildArray");
  equals(arrayOfCRs.get('length'), 4, "check that the length of the array of child records is 4");
  SC.run(function () {
    cr = arrayOfCRs.objectAt(0);
  });

  ok(SC.kindOf(cr, SC.Record), "check that first ChildRecord from the get() creates an actual instance that is a kind of a SC.Record Object");
  ok(SC.instanceOf(cr, NestedRecord.ChildRecordTest1), "check that first ChildRecord from the get() creates an actual instance of a ChildRecordTest1 Object");

  // Test Default Child Record creation
  var arrayOfDRs = testParent.get('defaultElements');
  ok(SC.instanceOf(arrayOfDRs, SC.ChildArray), "check that get() creates an actual instance of a SC.ChildArray");
  equals(arrayOfDRs.get('length'), 1, "check that the length of the array of default records is 1");
  SC.run(function () {
    dr = arrayOfDRs.objectAt(0);
  });
  ok(SC.kindOf(dr, SC.Record), "check that first default ChildRecord from the get() creates an actual instance that is a kind of a SC.Record Object");
  ok(SC.instanceOf(dr, NestedRecord.ChildRecordTest1), "check that first default ChildRecord from the get() creates an actual instance of a ChildRecordTest1 Object");

  // Test Default Polymorphic Child Record creation
  var arrayOfDPRs = testParent.get('defaultPolymorphicElements');
  ok(SC.instanceOf(arrayOfDPRs, SC.ChildArray), "check that get() creates an actual instance of a SC.ChildArray");
  equals(arrayOfDPRs.get('length'), 1, "check that the length of the array of default records is 1");
  SC.run(function () {
    dpr = arrayOfDPRs.objectAt(0);
  });
  ok(SC.kindOf(dpr, SC.Record), "check that first default polymorphic ChildRecord from the get() creates an actual instance that is a kind of a SC.Record Object");
  ok(SC.instanceOf(dpr, NestedRecord.ChildRecordTest1), "check that first default polymorphic ChildRecord from the get() creates an actual instance of a ChildRecordTest1 Object");

  // Check reference information
  var key = cr.get('id');

  // Check to see if the attributes of a Child Record match the reference of the parent
  var parentArray = testParent.readAttribute('elements');
  ok(!SC.instanceOf(parentArray, SC.ChildArray), "check that get() creates an actual instance of a SC.ChildArray");

  // // Duplication check
  var sameArray = testParent.get('elements');
  ok(sameArray, 'check to see that we get an array on the second call to the parent for the child records');
  equals(sameArray.get('length'), 4, "check that the length of the array of child records is still 4");
  var sameCR = sameArray.objectAt(0);
  ok(sameCR, "check to see if we have an instance of a child record again");
  var oldKey = cr.get('id'), newKey = sameCR.get('id');
  equals(oldKey, newKey, "check to see if the primary key are the same");
  equals(SC.guidFor(cr), SC.guidFor(sameCR), "check to see if the guid are the same");
  same(sameCR, cr, "check to see that it is the same child record as before");
});

test("Basic Write", function() {

  // Test general gets
  SC.run(function () {
    testParent.set('name', 'New Parent Name');
  });
  equals(testParent.get('name'), 'New Parent Name', "set() should change name attribute");

  SC.run(function () {
    testParent.set('nothing', 'nothing');
  });
  equals(testParent.get('nothing'), 'nothing', "set should change non-existent property to a new property");

  // Test Child Record creation
  var oldCR = testParent.get('elements');
  var newChildren = [
   { type: 'ChildRecordTest1', name: 'Tom', value: 'Jones'},
   { type: 'ChildRecordTest1', name: 'Dick', value: 'Smothers'},
   { type: 'ChildRecordTest1', name: 'Harry', value: 'Balls'}
  ];

  SC.run(function () {
    testParent.set('elements', newChildren);
  });
  var newArray = testParent.get('elements');
  ok(SC.instanceOf(newArray, SC.ChildArray), "check that get() creates an actual instance of a SC.ChildArray");
  equals(newArray.get('length'), 3, "after set() on parent, check that the length of the array of child records is 3");

  var cr;
  SC.run(function () {
    cr = newArray.objectAt(0);
  });

  ok(SC.kindOf(cr, SC.Record), "check that first ChildRecord from the get() creates an actual instance that is a kind of a SC.Record Object");
  ok(SC.instanceOf(cr, NestedRecord.ChildRecordTest1), "check that first ChildRecord from the get() creates an actual instance of a ChildRecordTest1 Object");
});

test("Basic Array Functionality: pushObject w/ HASH", function() {
  var elements, elementsAttrs, cr, crFirst, crLast;
  // Add something to the array
  elements = testParent.get('elements');
  // PushObject Tests
  SC.run(function () {
    elements.pushObject({ type: 'ChildRecordTest1', name: 'Testikles', value: 'God Of Fertility'});
  });

  elements = testParent.get('elements');
  equals(elements.get('length'), 5, "after pushObject() on parent, check that the length of the array of child records is 5");
  SC.run(function () {
    cr = elements.objectAt(4);
  });
  ok(SC.kindOf(cr, SC.Record), "check that newly added ChildRecord creates an actual instance that is a kind of a SC.Record Object");
  ok(SC.instanceOf(cr, NestedRecord.ChildRecordTest1), "check that newly added ChildRecord creates an actual instance of a ChildRecordTest1 Object");
  equals(cr.get('name'), 'Testikles', "after a pushObject on parent, check to see if it has all the right values for the attributes");
  ok(cr.get('status') & SC.Record.DIRTY, 'check that the child record is dirty');
  ok(testParent.get('status') & SC.Record.DIRTY, 'check that the parent record is dirty');

  // Verify the Attrs
  elementsAttrs = testParent.readAttribute('elements');
  equals(elementsAttrs.length, 5, "after pushObject() on parent, check that the length of the attribute array of child records is 5");

  SC.run(function () {
    crFirst = elements.objectAt(0).get('attributes');
    crLast = elements.objectAt(4).get('attributes');
  });
  same(elementsAttrs[0], crFirst, "verify that parent attributes are the same as the first individual child attributes");
  same(elementsAttrs[4], crLast, "verify that parent attributes are the same as the last individual child attributes");
});

test("Basic Array Functionality: pushObject w/ ChildRecord", function() {
  var elements, elementsAttrs, cr, crFirst, crLast;
  // Add something to the array
  elements = testParent.get('elements');
  // PushObject Tests
  SC.run(function () {
    cr = store.createRecord(NestedRecord.ChildRecordTest1, { type: 'ChildRecordTest1', name: 'Testikles', value: 'God Of Fertility'});
    elements.pushObject(cr);
  });

  elements = testParent.get('elements');
  equals(elements.get('length'), 5, "after pushObject() on parent, check that the length of the array of child records is 5");

  SC.run(function () {
    cr = elements.objectAt(4);
  });
  ok(SC.kindOf(cr, SC.Record), "check that newly added ChildRecord creates an actual instance that is a kind of a SC.Record Object");
  ok(SC.instanceOf(cr, NestedRecord.ChildRecordTest1), "check that newly added ChildRecord creates an actual instance of a ChildRecordTest1 Object");
  equals(cr.get('name'), 'Testikles', "after a pushObject on parent, check to see if it has all the right values for the attributes");
  ok(cr.get('status') & SC.Record.DIRTY, 'check that the child record is dirty');
  ok(testParent.get('status') & SC.Record.DIRTY, 'check that the parent record is dirty');

  // Verify the Attrs
  elementsAttrs = testParent.readAttribute('elements');
  equals(elementsAttrs.length, 5, "after pushObject() on parent, check that the length of the attribute array of child records is 5");
  SC.run(function () {
    crFirst = elements.objectAt(0).get('attributes');
    crLast = elements.objectAt(4).get('attributes');
  });
  same(elementsAttrs[0], crFirst, "verify that parent attributes are the same as the first individual child attributes");
  same(elementsAttrs[4], crLast, "verify that parent attributes are the same as the last individual child attributes");
});


test("Basic Array Functionality: popObject", function() {
  var elements, elementsAttrs, cr, crFirst, crLast;
  // Add something to the array
  elements = testParent.get('elements');
  // PushObject Tests
  SC.run(function () {
    elements.popObject();
  });
  elements = testParent.get('elements');
  equals(elements.get('length'), 3, "after popObject() on parent, check that the length of the array of child records is 3");
  ok(testParent.get('status') & SC.Record.DIRTY, 'check that the parent record is dirty');

  // Verify the Attrs
  elementsAttrs = testParent.readAttribute('elements');
  equals(elementsAttrs.length, 3, "after pushObject() on parent, check that the length of the attribute array of child records is 3");

  SC.run(function () {
    crFirst = elements.objectAt(0).get('attributes');
    crLast = elements.objectAt(2).get('attributes');
  });
  same(elementsAttrs[0], crFirst, "verify that parent attributes are the same as the first individual child attributes");
  same(elementsAttrs[2], crLast, "verify that parent attributes are the same as the last individual child attributes");
});

/*
Notice: shiftObject is something which essentially does not really work within this nested record implementation.
The issue is that a child record will look up its information on the parent.
Shifting a record from a child array removes the information from the parent, which leaves no way for the child record
to look up its underlying information.
A few options here:
- if the shifted record also happens to be in the store (recordType + guid), return that. Else return the removed hash.
- just return the hash which is shifted in either an SC.Object form or raw.

The ideal case would be to return an SC.Record instance, but as they are tied to a / the store, this would require to
create the record in the store, which could result in all kinds of unintended remote actions, or keep a separate store around to
hald these temporary records...

For the moment the tests will test for a plain hash.

 */

test("Basic Array Functionality: shiftObject", function() {
  var elements, cr, cr2;

  // Add something to the array
  elements = testParent.get('elements');
  // PushObject Tests
  SC.run(function () {
    cr = elements.shiftObject();
    cr2 = elements.objectAt(0);
  });
  equals(cr.name, 'Child 1', "The shifted record should have the name");
  equals(cr2.get('name'), 'Child 2', "The first record should have the name");
  elements = testParent.get('elements');
  equals(elements.get('length'), 3, "after shiftObject() on parent, check that the length of the array of child records is 3");
  ok(testParent.get('status') & SC.Record.DIRTY, 'check that the parent record is dirty');
});

test("Basic Array Functionality: replace", function() {
  var elements, cr1, cr2;
  // Add something to the array
  elements = testParent.get('elements');
  SC.run(function () {
    cr1 = elements.objectAt(1);
    cr2 = elements.objectAt(2);
  });
  equals(cr1.get('name'), 'Child 2', "The first record should have the name");
  equals(cr2.get('name'), 'Child 3', "The second record should have the name");

  SC.run(function () {
    elements.replace(1, 2, [cr2, cr1]);
    equals(elements.objectAt(2).get('name'), 'Child 2', "The new second record should have the name");
    equals(elements.objectAt(1).get('name'), 'Child 3', "The new first record should still have the name");
    equals(cr1.get('name'), 'Child 2', "The first record should still have the name");
    equals(cr2.get('name'), 'Child 3', "The second record should still have the name");
  });

  ok(testParent.get('status') & SC.Record.DIRTY, 'check that the parent record is dirty');
});

test("Basic Array Functionality: unshiftObject", function() {
  var elements, elementsAttrs, cr, crFirst, crLast;
  // Add something to the array
  elements = testParent.get('elements');
  // PushObject Tests
  SC.run(function () { elements.unshiftObject({ type: 'ChildRecordTest1', name: 'Testikles', value: 'God Of Fertility'}); });
  elements = testParent.get('elements');
  equals(elements.get('length'), 5, "after pushObject() on parent, check that the length of the array of child records is 5");
  SC.run(function () {
    cr = elements.objectAt(0);
  });
  ok(SC.kindOf(cr, SC.Record), "check that newly added ChildRecord creates an actual instance that is a kind of a SC.Record Object");
  ok(SC.instanceOf(cr, NestedRecord.ChildRecordTest1), "check that newly added ChildRecord creates an actual instance of a ChildRecordTest1 Object");
  equals(cr.get('name'), 'Testikles', "after a pushObject on parent, check to see if it has all the right values for the attributes");
  ok(cr.get('status') & SC.Record.DIRTY, 'check that the child record is dirty');
  ok(testParent.get('status') & SC.Record.DIRTY, 'check that the parent record is dirty');

  // Verify the Attrs
  elementsAttrs = testParent.readAttribute('elements');
  equals(elementsAttrs.length, 5, "after pushObject() on parent, check that the length of the attribute array of child records is 5");
  SC.run(function () {
    crFirst = elements.objectAt(0).get('attributes');
    crLast = elements.objectAt(4).get('attributes');
  });
  same(elementsAttrs[0], crFirst, "verify that parent attributes are the same as the first individual child attributes");
  same(elementsAttrs[4], crLast, "verify that parent attributes are the same as the last individual child attributes");
});

test("Create Parent with Broken Child Array", function(){
  var elements = testParent2.get('elements');
  ok (!SC.none(elements), "elements should be something");
  var isChildRecordArrays = elements.instanceOf(SC.ChildArray);
  ok(isChildRecordArrays, 'elements array is of right type');

  var length = elements.get('length');
  equals(length, 0, 'length should be zero');

  SC.run(function () {
    elements.pushObject({type: 'ChildRecordTest1',name: 'Child 1',value: 'eeney'});
  });
  length = elements.get('length');
  equals(length, 1, 'length should be one');

});

test("pushObject should trigger an arrayContentDidChange with only 1 added item", function() {
  var didChangeCalls = [], target;

  target = SC.Object.create({
    willChange: function () {},
    didChange: function () {
      didChangeCalls.push(arguments);
    }
  });

  testParent.get('elements').addArrayObservers({
    target: target,
    willChange: 'willChange',
    didChange: 'didChange'
  });

  SC.run(function () {
    testParent.get('elements').pushObject({
      type: 'ChildRecordTest1',
      name: 'Child 5',
      value: 'x'
    });
  });

  // not sure what this test is supposed to test, but because of the way the nested records work
  // didChange will be called twice, once directly and once because the store updates the nested record tree.
  // equals(didChangeCalls.length, 1, 'didChange should only be called once');

  equals(didChangeCalls[0][0], 4, 'didChange should be called with a start index of 4');
  equals(didChangeCalls[0][1], 0, 'didChange should be called with a removed count of 0');
  equals(didChangeCalls[0][2], 1, 'didChange should be called with an added count of 1');
});

test("replace should trigger an arrayContentDidChange with only 1 added item", function() {
  var didChangeCalls = [], target;

  target = SC.Object.create({
    willChange: function() {},
    didChange: function() {
      didChangeCalls.push(arguments);
    }
  });

  testParent.get('elements').addArrayObservers({
    target: target,
    willChange: 'willChange',
    didChange: 'didChange'
  });
  SC.run(function () {
    testParent.get('elements').replace(3, 1, [{
      type: 'ChildRecordTest1',
      name: 'Child 5',
      value: 'x'
    }]);
  });

  // equals(didChangeCalls.length, 1, 'didChange should only be called once');
  equals(didChangeCalls[0][0], 3, 'didChange should be called with a start index of 3');
  equals(didChangeCalls[0][1], 1, 'didChange should be called with a removed count of 1');
  equals(didChangeCalls[0][2], 1, 'didChange should be called with an added count of 1');
});
