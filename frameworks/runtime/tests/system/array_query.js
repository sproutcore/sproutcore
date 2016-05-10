/*globals module, test, equals */

var recOne, recTwo, recThree, recFour, recFive, recSix, recSeven, sourceArray;

module("SC.ArrayQuery", {
  setup: function () {
    recOne = { guid: 1, firstName: "John", lastName: "Doe", year: 1974, end: 1980 };
    recTwo = { guid: 2, firstName: "Jane", lastName: "Doe", year: 1975, end: 1981 };
    recThree = { guid: 3, firstName: "Emily", lastName: "Parker", year: 1975, active: null, end: 1982 };
    recFour = { guid: 4, firstName: "Johnny", lastName: "Cash", year: 1976, active: false, end: 1983 };
    recFive = { guid: 5, firstName: "Bert", lastName: "Berthold", year: 1977, active: true, end: 1984 };
    recSix = { guid: 6, firstName: "Bert", lastName: "Ernie", active: true };
    recSeven = { guid: 7, firstName: "Bert", lastName: "BigBird", active: true };

    sourceArray = [recOne, recTwo, recThree, recFour, recFive, recSix, recSeven];
  }
});

test("findProperties on two properties (and)", function () {
  equals(sourceArray.findProperties({ lastName: "Parker", year: 1975}), recThree, "a simple hash should give a single record");
  equals(sourceArray.findProperties({ and: { lastName: "Parker", year: 1975 }}), recThree, "a simple hash should be equivalent to and: {}");
});

test("findProperties on two properties (and) which could apply to more than one record", function () {
  equals(sourceArray.findProperties({ firstName: 'Bert', active: true}), recFive, "should only return the first match");
});

test("filterProperties on two properties (and)", function () {
  var filtered = sourceArray.filterProperties({ firstName: 'Bert', active: true });
  equals(filtered.indexOf(recFive) > -1, true);
  equals(filtered.indexOf(recSix) > -1, true);
  equals(filtered.indexOf(recSeven) > -1, true);
});

test("findProperties on two properties (or)", function () {
  equals(sourceArray.findProperties({ or: { lastName: "Parker", year: 1975} }), recTwo, "a simple hash should give a single record");
});

test("filterProperties on two properties (or)", function () {
  var filtered = sourceArray.filterProperties({ or: { firstName: 'Bert', active: true }});
  equals(filtered.indexOf(recFive) > -1, true);
  equals(filtered.indexOf(recSix) > -1, true);
  equals(filtered.indexOf(recSeven) > -1, true);
});

test("filterProperties on one property range with lt", function () {
  var filtered = sourceArray.filterProperties({ range: { year: { lt: 1975 }}});
  equals(filtered.indexOf(recOne) > -1, true);
});

test("filterProperties on one property range with lt", function () {
  var filtered = sourceArray.filterProperties({ range: { year: { lte: 1975 }}});
  equals(filtered.indexOf(recOne) > -1, true);
  equals(filtered.indexOf(recTwo) > -1, true);
  equals(filtered.indexOf(recThree) > -1, true);
});

test("filterProperties on one property range with gt", function () {
  var filtered = sourceArray.filterProperties({ range: { year: { gt: 1974 }}});
  equals(filtered.indexOf(recTwo) > -1, true);
  equals(filtered.indexOf(recThree) > -1, true);
  equals(filtered.indexOf(recFour) > -1, true);
  equals(filtered.indexOf(recFive) > -1, true);
  equals(filtered.length, 4);
});

test("filterProperties on one property range with gte", function () {
  var filtered = sourceArray.filterProperties({ range: { year: { gte: 1974 }}});
  equals(filtered.indexOf(recOne) > -1, true);
  equals(filtered.indexOf(recTwo) > -1, true);
  equals(filtered.indexOf(recThree) > -1, true);
  equals(filtered.indexOf(recFour) > -1, true);
  equals(filtered.indexOf(recFive) > -1, true);
  equals(filtered.length, 5);
});

test("filterProperties on one property with range using from and to", function () {
  var filtered = sourceArray.filterProperties({ range: { year: { from: 1975, to: 1976 }}});
  equals(filtered.indexOf(recTwo) > -1, true);
  equals(filtered.indexOf(recThree) > -1, true);
  equals(filtered.indexOf(recFour) > -1, true);
  equals(filtered.length, 3);
});

test("filterProperties on one property with range using from and to, includeLower: false", function () {
  var filtered = sourceArray.filterProperties({ range: { year: { from: 1974, to: 1976, includeLower: false }}});
  equals(filtered.indexOf(recTwo) > -1, true);
  equals(filtered.indexOf(recThree) > -1, true);
  equals(filtered.indexOf(recFour) > -1, true);
  equals(filtered.length, 3);
});

test("filterProperties on one property with range using from and to, includeUpper: false", function () {
  var filtered = sourceArray.filterProperties({ range: { year: { from: 1974, to: 1976, includeUpper: false }}});
  equals(filtered.indexOf(recOne) > -1, true);
  equals(filtered.indexOf(recTwo) > -1, true);
  equals(filtered.indexOf(recThree) > -1, true);
  equals(filtered.length, 3);
});

test("filterProperties on two properties with multiple ranges (and)", function () {
  var filtered = sourceArray.filterProperties({
    range: {
      or: {
        year: {
          from: 1974,
          to: 1975
        },
        end: {
          from: 1984,
          to: 1985
        }
      }
    }
  });
  equals(filtered.indexOf(recOne) > -1, true);
  equals(filtered.indexOf(recTwo) > -1, true);
  equals(filtered.indexOf(recThree) > -1, true);
  equals(filtered.indexOf(recFive) > -1, true);
  equals(filtered.length, 4);
});

test("filterProperties on one property with multiple ranges (or)", function () {
  var filtered = sourceArray.filterProperties({
    range: {
      and: {
        year: {
          from: 1974,
          to: 1975
        },
        end: {
          from: 1983,
          to: 1984
        }
      }
    }
  });
  equals(filtered.length, 0, "should have no matches");
});

test("filterProperties on one property with regex", function () {
  var filtered = sourceArray.filterProperties({ firstName: /Jo.+/ });
  equals(filtered.indexOf(recOne) > -1, true);
  equals(filtered.indexOf(recFour) > -1, true);
  equals(filtered.length, 2);
});

test("filterProperties on one property with an array number of options", function () {
  var filtered = sourceArray.filterProperties({ year: [1974, 1976]});
  equals(filtered.indexOf(recOne) > -1, true);
  equals(filtered.indexOf(recFour) > -1, true);
  equals(filtered.length, 2);
});

test("filterProperties on one property with an array of regexp", function () {
  var filtered = sourceArray.filterProperties({ firstName: [/y$/, /^Jo/]});
  equals(filtered.indexOf(recOne) > -1, true);
  equals(filtered.indexOf(recThree) > -1, true);
  equals(filtered.indexOf(recFour) > -1, true);
  equals(filtered.length, 3);
});

test("filterProperties on one property with one negative comparison", function () {
  var filtered = sourceArray.filterProperties({
    not: {
    'firstName': 'John'
    }
  });
  equals(filtered.indexOf(recTwo) > -1, true);
  equals(filtered.indexOf(recThree) > -1, true);
  equals(filtered.indexOf(recFour) > -1, true);
  equals(filtered.indexOf(recFive) > -1, true);
  equals(filtered.indexOf(recSix) > -1, true);
  equals(filtered.indexOf(recSeven) > -1, true);
  equals(filtered.length, 6);
});

test("filterProperties on one property with two negative comparisons", function () {
  var filtered = sourceArray.filterProperties({
    not: {
    'firstName': ['John', 'Jane']
    }
  });
  equals(filtered.indexOf(recThree) > -1, true);
  equals(filtered.indexOf(recFour) > -1, true);
  equals(filtered.indexOf(recFive) > -1, true);
  equals(filtered.indexOf(recSix) > -1, true);
  equals(filtered.indexOf(recSeven) > -1, true);
  equals(filtered.length, 5);
});
