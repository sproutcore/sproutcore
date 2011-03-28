module("chained observers");

test("chained observers on enumerable properties are triggered when the observed property of any item changes", function() {
  var family = SC.Object.create({ momma: null });
  var momma = SC.Object.create({ children: [] });

  var child1 = SC.Object.create({ name: "Bartholomew" });
  var child2 = SC.Object.create({ name: "Agnes" });
  var child3 = SC.Object.create({ name: "Dan" });
  var child4 = SC.Object.create({ name: "Nancy" });

  family.set('momma', momma);
  momma.set('children', [child1, child2, child3]);

  var observerFiredCount = 0;
  family.addObserver('momma.children.@each.name', this, function() {
    observerFiredCount++;
  });

  observerFiredCount = 0;
  SC.run(function() { child1.set('name', 'Teddy'); });
  equals(observerFiredCount, 1, "observer fired after changing a child item's name");

  observerFiredCount = 0;
  SC.run(function() { momma.children.pushObject(child4); });
  equals(observerFiredCount, 1, "observer fired after adding a new item");

  observerFiredCount = 0;
  SC.run(function() { child4.set('name', "Herbert"); });
  equals(observerFiredCount, 1, "observer fired after changing property on new object");

  momma.set('children', []);

  observerFiredCount = 0;
  SC.run(function() { child1.set('name', "Hanna"); });
  equals(observerFiredCount, 0, "observer did not fire after removing changing property on a removed object");

  momma.set('children', []);
  observerFiredCount = 0;
  SC.run(function() { momma.set('children', [child1, child2, child3, child4]); });
  equals(observerFiredCount, 1, "observer did fire only once after setting 4 objects");

  momma.set('children', [child1, child2, child3, child4]);
  observerFiredCount = 0;
  SC.run(function() { momma.set('children', []); });
  equals(observerFiredCount, 1, "observer did fire once after setting 0 objects");

  momma.set('children', []);
  observerFiredCount = 0;
  SC.run(function() { momma.get('children').pushObjects([child1, child2, child3, child4]); });
  equals(observerFiredCount, 1, "observer did fire only once after adding 4 objects");

  momma.set('children', [child1, child2, child3, child4]);
  observerFiredCount = 0;
  SC.run(function() { momma.get('children').removeObjects([child1, child2]); });
  equals(observerFiredCount, 1, "observer did fire once after removing 2 of 4 objects");

  momma.set('children', [child1, child2, child3, child4]);
  observerFiredCount = 0;
  SC.run(function() { momma.get('children').removeObjects([child1, child2, child3, child4]); });
  equals(observerFiredCount, 1, "observer did fire once after removing all objects");
});
