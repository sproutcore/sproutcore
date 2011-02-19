module("chained observers");

test("chained observers on enumerable properties are triggered when any item changes", function() {
  var momma = SC.Object.create({
    children: [ SC.Object.create({ name: "Bartholomew" }), SC.Object.create({ name: "Agnes" }), SC.Object.create({ name: "Dan" }) ]
  });

  var family = SC.Object.create({
    momma: momma
  });

  var observerFiredCount = 0;
  family.addObserver('momma.children.[].name', this, function() {
    observerFiredCount++;
  });

  SC.run(function() { family.getPath('momma.children').objectAt(0).set('name', 'Teddy'); });

  equals(observerFiredCount, 1, "observer fired after changing a child item's name");

  //observerFiredCount = 0;
  //SC.run(function() { family.getPath('momma.children').pushObject(SC.Object.create({ name: "Nancy" })); });

  //equals(observerFiredCount, 1, "observer fired after adding a new item");

  //observerFiredCount = 0;
  //SC.run(function() { family.getPath('momma.children').objectAt(3).set('name', "Herbert"); });

  //equals(observerFiredCount, 1, "observer fired after changing property on new object");
});

