module("SC.TemplateView", {
  setup: function() {
    // var view = SC.TemplateView.create();
  },

  teardown: function() {

  }
});

test("template view should call the function of the associated template", function() {
  var view;

  view = SC.TemplateView.create({
    templateName: 'test_template',

    templates: SC.Object.create({
      test_template: function(dataSource) {
        dataSource._renderContext.push("<h1 id='twas-called'>template was called</h1>");
      }
    })
  });

  view.createLayer();

  ok(view.$('#twas-called').length, "the named template was called");
});

test("template view should call the function of the associated template with itself as the context", function() {
  var view;

  view = SC.TemplateView.create({
    templateName: 'test_template',

    personName: "Tom DAAAALE",

    templates: SC.Object.create({
      test_template: function(dataSource) {
        dataSource._renderContext.push("<h1 id='twas-called'>template was called for " + dataSource.get('personName') + "</h1>");
      }
    })
  });

  view.createLayer();

  equals("template was called for Tom DAAAALE", view.$('#twas-called').text(), "the named template was called with the view as the data source");
});

