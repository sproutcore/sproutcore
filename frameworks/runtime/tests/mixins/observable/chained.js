// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================
/*global module, test, equals */

var family, grandma, momma, child1, child2, child3, child4, child5, observerFiredCount, observer2FiredCount;
module("SC.Observable - Observing with @each", {
  setup: function () {
    momma = SC.Object.create({ children: [] });
    grandma = SC.Object.create({ momma: momma });
    family = SC.Object.create({
      grandma: grandma,
      eachCallback: function () {
        observerFiredCount++;
      },
      childrenCallback: function () {
        observer2FiredCount++;
      }
    });

    child1 = SC.Object.create({ name: "Bartholomew" });
    child2 = SC.Object.create({ name: "Agnes" });
    child3 = SC.Object.create({ name: "Dan" });
    child4 = SC.Object.create({ name: "Nancy" });
    child5 = SC.Object.create({ name: "Constance" });

    momma.set('children', [child1, child2, child3]);

    observerFiredCount = 0;
    observer2FiredCount = 0;
  },

  teardown: function () {
    family.destroy();
    grandma.destroy();
    momma.destroy();
    child1.destroy();
    child2.destroy();
    child3.destroy();
    child4.destroy();
    child5.destroy();

    family = grandma = momma = child1 = child2 = child3 = child4 = child5 = null;
  }
});

test("chained observers on enumerable properties are triggered when the observed property of any item changes", function () {
  family.addObserver('grandma.momma.children.@each.name', family, family.eachCallback);
  family.addObserver('grandma.momma.children', family, family.childrenCallback);

  // Add a direct observer on the children Array.
  momma.children.addObserver('@each.name', family, family.eachCallback);

  observerFiredCount = 0;
  SC.run(function () { momma.get('children').setEach('name', 'Juan'); });
  equals(observerFiredCount, 6, "observer fired after changing child names");

  observerFiredCount = 0;
  SC.run(function () { momma.children.pushObject(child4); });
  equals(observerFiredCount, 2, "observer fired after adding a new item");

  observerFiredCount = 0;
  SC.run(function () { child4.set('name', "Herbert"); });
  equals(observerFiredCount, 2, "observer fired after changing property on new object");

  var oldChildren = momma.get('children');
  momma.set('children', []);
  observerFiredCount = 0;
  SC.run(function () {
    oldChildren.pushObject(child5);
    oldChildren.objectAt(0).set('name', "Hanna");
  });
  equals(observerFiredCount, 1, "observer did not fire after changing removed array and property on an object in removed array");
  equals(observer2FiredCount, 1, "children observer did fire only once by replacing children with empty array");

  observerFiredCount = 0;
  observer2FiredCount = 0;
  SC.run(function () { child1.set('name', "Hanna"); });
  equals(observerFiredCount, 0, "observer did not fire after changing property on a removed object");

  observerFiredCount = 0;
  SC.run(function () { momma.set('children', [child1, child2, child3, child4]); });
  equals(observerFiredCount, 0, "@each observer did not fire after replacing children with 4 objects");
  equals(observer2FiredCount, 1, "children observer did fire only once after replacing children with 4 objects");

  observerFiredCount = 0;
  observer2FiredCount = 0;
  SC.run(function () { momma.set('children', []); });
  equals(observerFiredCount, 0, "@each observer did not fire after replacing children with empty array");
  equals(observer2FiredCount, 1, "children observer did fire only once after replacing children with empty array");

  observerFiredCount = 0;
  SC.run(function () { momma.get('children').pushObjects([child1, child2, child3, child4]); });
  equals(observerFiredCount, 1, "observer did fire only once after adding 4 objects");

  observerFiredCount = 0;
  SC.run(function () { momma.get('children').removeObjects([child1, child2]); });
  equals(observerFiredCount, 1, "observer did fire once after removing 2 of 4 objects");

  observerFiredCount = 0;
  SC.run(function () { momma.get('children').removeObjects([child3, child4]); });
  equals(observerFiredCount, 1, "observer did fire once after removing all objects");

  // New grandma.
  observerFiredCount = 0;
  grandma.destroy();
  grandma = SC.Object.create({ momma: momma });
  family.set('grandma', grandma);
  equals(observerFiredCount, 0, "observer did not fire after replacing dear old grandma");

  oldChildren = momma.get('children');
  momma.destroy();
  momma = SC.Object.create({ children: oldChildren });
  grandma.set('momma', momma);
  equals(observerFiredCount, 0, "observer did not fire after replacing dear old momma");

  // Clean up.
  family.removeObserver('grandma.momma.children.@each.name', family, family.eachCallback);
});

test("observer cleanup", function () {
  family.addObserver('grandma.momma.children.@each.name', family, family.eachCallback);
  family.removeObserver('grandma.momma.children.@each.name', family, family.eachCallback);

  // Clean up.
  equals(family._kvo_observed_keys.length, 0, "family has no observed keys");
  equals(grandma._kvo_observed_keys.length, 0, "grandma has no observed keys");
  equals(momma._kvo_observed_keys.length, 0, "momma has no observed keys: %@".fmt(momma._kvo_observed_keys.toArray()));
  equals(momma.children._kvo_observed_keys.length, 0, "momma.children has no observed keys: %@".fmt(momma.children._kvo_observed_keys.toArray()));
  equals(child1._kvo_observed_keys.length, 0, "child1 has no observed keys");
});

test("content observers are removed correctly", function () {
  var child1 = SC.Object.create({ name: "Bartholomew", age: 15 });
  var child2 = SC.Object.create({ name: "Agnes", age: 12 });
  var children = [child1, child2];

  var observerFiredCount = 0;
  var observerFunc = function () { observerFiredCount++; };

  children.addObserver('@each.name', this, observerFunc);
  children.removeObserver('@each.name', this, observerFunc);
  observerFiredCount = 0;
  SC.run(function () { children.setEach('name', "Hanna"); });
  equals(observerFiredCount, 0, "name observer did not fire after it was removed");

  children.addObserver('@each.age', this, observerFunc);
  children.removeObserver('@each.age', this, observerFunc);
  observerFiredCount = 0;
  SC.run(function () { children.setEach('age', 14); });
  equals(observerFiredCount, 0, "age observer did not fire after it was removed");
});

var DummyArray;

module("SC.Observable - Convenience observing with @each", {
  setup: function () {

    child1 = SC.Object.create({ name: "Bartholomew", toString: function () { return this.name; } });
    child2 = SC.Object.create({ name: "Agnes", toString: function () { return this.name; } });
    child3 = SC.Object.create({ name: "Dan", toString: function () { return this.name; } });
    child4 = SC.Object.create({ name: "Nancy", toString: function () { return this.name; } });
    child5 = SC.Object.create({ name: "Constance", toString: function () { return this.name; } });

    DummyArray = SC.Object.extend(SC.Array, {

      // The SC.Array mixin sends all mutations through replace.
      // As a result, we can implement KVO notification in
      // replace.
      replace: function(idx, amt, objects) {
        if (!this.content) { this.content = [] ; }

        var len = objects ? objects.get('length') : 0;

        // SC.Array implementations must call arrayContentWillChange
        // before making mutations. This allows observers to perform
        // operations based on the state of the Array before the
        // change, such as reflecting removals.
        this.arrayContentWillChange(idx, amt, len);
        this.beginPropertyChanges() ;

        // Mutate the underlying Array
        this.content.replace(idx,amt,objects) ;

        // Update the length property
        this.set('length', this.content.length) ;
        this.endPropertyChanges();

        // SC.Array implementations must call arrayContentDidChange
        // after making mutations. This allows observers to perform
        // operations based on the mutation. For instance, a listener
        // might want to reflect additions onto itself.
        this.arrayContentDidChange(idx, amt, len);
      },

      // SC.Arrays must implement objectAt, which returns an object
      // for a given index.
      objectAt: function(idx) {
        if (!this.content) { this.content = [] ; }
        return this.content[idx] ;
      }

    });
    momma = SC.Object.create({ children: DummyArray.create({
      content: [child1, child2, child3],
      length: 3,
      eachCallback: function () {
        observerFiredCount++;
      }.observes('@each.name')
    }),
      toString: function () {
        return 'momma';
      } });
    grandma = SC.Object.create({ momma: momma,
      toString: function () {
        return 'grandma';
      }
    });

    family = SC.Object.create({
      toString: function () {
        return 'family';
      },
      grandma: grandma,
      eachCallback: function () {
        observerFiredCount++;
      }.observes('grandma.momma.children.@each.name'),
      childrenCallback: function () {
        observer2FiredCount++;
      }.observes('grandma.momma.children')
    });

    observerFiredCount = 0;
    observer2FiredCount = 0;
  },

  teardown: function () {
    family.destroy();
    grandma.destroy();
    momma.destroy();
    child1.destroy();
    child2.destroy();
    child3.destroy();
    child4.destroy();
    child5.destroy();

    family = grandma = momma = child1 = child2 = child3 = child4 = child5 = DummyArray = null;
  }
});

test("chained observers on enumerable properties are triggered when the observed property of any item changes", function () {
  observerFiredCount = 0;
  SC.run(function () { momma.get('children').setEach('name', 'Juan'); });
  equals(observerFiredCount, 6, "observer fired after changing child names");

  observerFiredCount = 0;
  SC.run(function () { momma.children.pushObject(child4); });
  equals(observerFiredCount, 2, "observer fired after adding a new item");

  observerFiredCount = 0;
  SC.run(function () { child4.set('name', "Herbert"); });
  equals(observerFiredCount, 2, "observer fired after changing property on new object");

  var oldChildren = momma.get('children');
  momma.set('children', []);
  observerFiredCount = 0;
  SC.run(function () {
    oldChildren.pushObject(child5);
    oldChildren.objectAt(0).set('name', "Hanna");
  });
  equals(observerFiredCount, 2, "observer did not fire after changing removed array and property on an object in removed array");
  equals(observer2FiredCount, 1, "children observer did fire only once by replacing children with empty array");

  observerFiredCount = 0;
  observer2FiredCount = 0;
  SC.run(function () { child1.set('name', "Hanna"); });
  equals(observerFiredCount, 0, "observer did not fire after changing property on a removed object");

  observerFiredCount = 0;
  SC.run(function () { momma.set('children', [child1, child2, child3, child4]); });
  equals(observerFiredCount, 0, "@each observer did not fire after replacing children with 4 objects");
  equals(observer2FiredCount, 1, "children observer did fire only once after replacing children with 4 objects");

  observerFiredCount = 0;
  observer2FiredCount = 0;
  SC.run(function () { momma.set('children', []); });
  equals(observerFiredCount, 0, "@each observer did not fire after replacing children with empty array");
  equals(observer2FiredCount, 1, "children observer did fire only once after replacing children with empty array");

  observerFiredCount = 0;
  SC.run(function () { momma.get('children').pushObjects([child1, child2, child3, child4]); });
  equals(observerFiredCount, 1, "observer did fire only once after adding 4 objects");

  observerFiredCount = 0;
  SC.run(function () { momma.get('children').removeObjects([child1, child2]); });
  equals(observerFiredCount, 1, "observer did fire once after removing 2 of 4 objects");

  observerFiredCount = 0;
  SC.run(function () { momma.get('children').removeObjects([child3, child4]); });
  equals(observerFiredCount, 1, "observer did fire once after removing all objects");

  // New grandma.
  observerFiredCount = 0;
  grandma.destroy();
  grandma = SC.Object.create({ momma: momma });
  family.set('grandma', grandma);
  equals(observerFiredCount, 0, "observer did not fire after replacing dear old grandma");

  oldChildren = momma.get('children');
  momma.destroy();
  momma = SC.Object.create({ children: oldChildren });
  grandma.set('momma', momma);
  equals(observerFiredCount, 0, "observer did not fire after replacing dear old momma");

  // Clean up.
  // family.removeObserver('grandma.momma.children.@each.name', family, family.eachCallback);
});

test("observer cleanup", function () {
  family.destroy();
  momma.children.destroy();

  // Clean up.
  equals(family._kvo_observed_keys, undefined, "family has no observed keys");
  equals(grandma._kvo_observed_keys, undefined, "grandma has no observed keys");
  equals(momma._kvo_observed_keys.length, 0, "momma has no observed keys: %@".fmt(momma._kvo_observed_keys.toArray()));
  equals(momma.children._kvo_observed_keys.length, 0, "momma.children has no observed keys: %@".fmt(momma.children._kvo_observed_keys.toArray()));
  equals(child1._kvo_observed_keys.length, 0, "child1 has no observed keys");
});
