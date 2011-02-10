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

test("calling sc_super inside a reopened class", function() {
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

  SubKlass = Klass.extend({});

  SubKlass.reopen({
    loudly: function(string) {
      return "ZOMG " + sc_super() // Klass.prototype.loudly.call(this, string); // sc_super();
    }
  });

  SubKlass.reopen({
    loudly: function(original, string) {
      return "OHAI: " + original(string);
    }.enhance()
  });

  var obj = SubKlass.create();
  equals(obj.loudly("foo"), "OHAI: ZOMG FOO!");
});
