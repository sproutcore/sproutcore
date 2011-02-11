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
      return "ZOMG " + sc_super();
    }
  });

  SubKlass.reopen({
    loudly: function(original, string) {
      return "OHAI: " + original(string);
    }.enhance()
  });

  Klass.reopen({
    loudly: function(original, string) {
      return "HAHA " + original(string);
    }.enhance()
  });

  var obj = SubKlass.create();
  equals(obj.loudly("foo"), "OHAI: ZOMG HAHA FOO!");
});

test("calling sc_super inside a reopened class", function() {
  var Klass = SC.Object.extend();

  var object = Klass.create({
    loudly: function(string) {
      return sc_super() + "!";
    }
  });

  Klass.reopen({
    loudly: function(string) {
      return string.toUpperCase();
    }
  });

  equals(object.loudly("foo"), "FOO!");
});

test("sc_super to a non-method", function() {
  var Klass = SC.Object.extend({
    wot: function() {
      return sc_super();
    }
  });

  var object = Klass.create(), error;

  try {
    object.wot();
  } catch(e) {
    error = e;
  }

  ok(error, "sc_super throws an error if there is no superclass method");
});

test("__sc_proto__ semantics", function() {
  var Klass = SC.Object.extend({});
  ok(Klass.__sc_super__ === SC.Object.prototype, "SproutCore remembers the original begetted prototype for subclasses");

  var object = Klass.create({});
  ok(object.__sc_super__ === Klass.prototype, "SproutCore remembers the original prototype for new instances");

  var SubKlass = Klass.extend({});
  ok(SubKlass.__sc_super__ === Klass.prototype, "SproutCore remembers the original begetted prototype for custom subclasses");

  SubKlass.reopen({});
  ok(SubKlass.__sc_super__ === Klass.prototype, "Reopen doesn't break prototype recordkeeping");
});
