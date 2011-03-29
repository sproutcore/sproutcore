module("SC.Observable - Observing with @each");

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
  SC.run(function() { momma.get('children').setEach('name', 'Juan'); });
  equals(observerFiredCount, 3, "observer fired after changing child names");

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
});

module("SC.Observable - dependent keys with @each");

test("should invalidate property when property on any enumerable changes", function() {
  var inventory = [];

  for (var idx = 0; idx < 20; idx++) {
    inventory.pushObject(SC.Object.create({
      price: 5
    }));
  }
  var restaurant = SC.Object.create({
    totalCost: function() {
      return inventory.reduce(function(prev, item) {
        return prev+item.get('price');
      }, 0);
    }.property('@each.price')
  });

  equals(restaurant.get('totalCost'), 100, "precond - computes cost of all items");

});
