module("Function#enhance");

test("reopening and enhancing", function() {
  var Klass = SC.Object.extend({
    loudly: function(string) {
      return string + this.get('exclaim');
    },
    exclaim: "!"
  });

  Klass.reopen({
    loudly: function(original, string) {
      return original(string.toUpperCase());
    }.enhance()
  });

  var obj = Klass.create();
  equals(obj.loudly("foo"), "FOO!");
});

test("subclassing and then enhancing the parent", function() {
  var Klass = SC.Object.extend({
    loudly: function(string) {
      return string + this.get('exclaim');
    },
    exclaim: "!"
  });

  Klass.reopen({
    loudly: function(original, string) {
      return original(string.toUpperCase());
    }.enhance()
  });

  SubKlass = Klass.extend({
    loudly: function(string) {
      return "ZOMG " + sc_super();
    }
  });

  Klass.reopen({
    loudly: function(original, string) {
      return "OHAI: " + original(string);
    }.enhance()
  });

  var obj = SubKlass.create();
  equals(obj.loudly("foo"), "ZOMG OHAI: FOO!");
});
