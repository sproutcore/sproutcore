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

  console.log(Klass.prototype);
  var obj = Klass.create();

  console.log(obj);
  equals("FOO!", obj.loudly("foo"));
});
