module("SC.View - Static Layout functionality");

test("Static layout", function() {
  var view = SC.View.create({
    useStaticLayout: YES
  });

  view.createLayer();

  ok(view.$().is('.sc-static-layout'), "views with useStaticLayout get the sc-static-layout class");
});

test("Background color", function() {
  var view = SC.View.create({
    backgroundColor: "red"
  });

  view.createLayer();

  ok(view.$().css('background-color') == "red", "backgroundColor sets the CSS background-color class");
});
