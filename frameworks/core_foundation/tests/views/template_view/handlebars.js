module("SC.TemplateView - handlebars integration");

test("template view should call the function of the associated template", function() {
  var view = SC.TemplateView.create({
    templateName: 'test_template',
    templates: SC.Object.create({
      test_template: SC.Handlebars.compile("<h1 id='twas-called'>template was called</h1>")
    })
  });

  view.createLayer();

  ok(view.$('#twas-called').length, "the named template was called");
});

test("template view should call the function of the associated template with itself as the context", function() {
  var view = SC.TemplateView.create({
    templateName: 'test_template',

    _personName: "Tom DAAAALE",
    _i: 0,

    personName: function() {
      this._i++;
      return this._personName + this._i;
    }.property().cacheable(),

    templates: SC.Object.create({
      test_template: SC.Handlebars.compile("<h1 id='twas-called'>template was called for {{personName}}. Yea {{personName}}</h1>")
    })
  });

  view.createLayer();

  equals("template was called for Tom DAAAALE1. Yea Tom DAAAALE1", view.$('#twas-called').text(), "the named template was called with the view as the data source");
});

TemplateTests = {};

test("child views can be inserted using the {{view}} Handlebars helper", function() {
  var templates = SC.Object.create({
    nester: SC.Handlebars.compile("<h1 id='hello-world'>Hello {{world}}</h1>{{view \"TemplateTests.LabelView\"}}"),
    nested: SC.Handlebars.compile("<div id='child-view'>Goodbye {{cruel}} {{world}}</div>")
  });

  TemplateTests.LabelView = SC.TemplateView.extend({
    tagName: "aside",
    cruel: "cruel",
    world: "world?",
    templateName: 'nested',
    templates: templates
  });

  var view = SC.TemplateView.create({
    world: "world!",
    templateName: 'nester',
    templates: templates
  });

  view.createLayer();

  ok(view.$("#hello-world:contains('Hello world!')").length, "The parent view renders its contents");
  ok(view.$("#child-view:contains('Goodbye cruel world?')").length === 1, "The child view renders its content once");
  ok(view.$().html().match(/Hello world!.*<aside.*Goodbye cruel world?/), "parent view should appear before the child view");

});

test("child views can be inserted inside a bindProperty block", function() {
  var templates = SC.Object.create({
    nester: SC.Handlebars.compile("<h1 id='hello-world'>Hello {{world}}</h1>{{view \"TemplateTests.LabelView\"}}"),
    nested: SC.Handlebars.compile("<div id='child-view'>Goodbye {{#bindProperty \"content\"}}{{blah}} {{view \"TemplateTests.OtherView\"}}{{/bindProperty}} {{world}}</div>"),
    other: SC.Handlebars.compile("cruel")
  });

  TemplateTests.LabelView = SC.TemplateView.extend({
    tagName: "aside",
    cruel: "cruel",
    world: "world?",
    content: SC.Object.create({ blah: "wot" }),
    templateName: 'nested',
    templates: templates
  });

  TemplateTests.OtherView = SC.TemplateView.extend({
    templates: templates,
    templateName: 'other'
  });

  var view = SC.TemplateView.create({
    world: "world!",
    templateName: 'nester',
    templates: templates
  });

  view.createLayer();

  ok(view.$("#hello-world:contains('Hello world!')").length, "The parent view renders its contents");
  ok(view.$("aside:contains('Goodbye wot cruel world?')").length === 1, "The child view renders its content once");
  ok(view.$().html().match(/Hello world!.*<aside.*Goodbye.*wot.*cruel.*world?/), "parent view should appear before the child view");

});

test("SC.TemplateView updates when a property changes", function() {
  var templates = SC.Object.create({
   foo: SC.Handlebars.compile('<h1 id="first">{{#with content}}{{bindProperty "wham"}}{{/with}}</h1>')
  });

  var view = SC.TemplateView.create({
    templateName: 'foo',
    templates: templates,

    content: SC.Object.create({
      wham: 'bam',
      thankYou: "ma'am"
    })
  });

  view.createLayer();

  equals(view.$('#first').text(), "bam", "precond - view renders Handlebars template");

  SC.run(function() { view.get('content').set('wham', 'bazam'); });

  equals(view.$('#first').text(), "bazam", "view updates when a bound property changes");
});


test("Handlebars templates update properties if a content object changes", function() {
  var templates;

  templates = SC.Object.create({
    menu: SC.Handlebars.compile('<h1>Today\'s Menu</h1>{{#bindProperty "coffee"}}<h2>{{color}} coffee</h2><span id="price">{{bindProperty "price"}}</span>{{/bindProperty}}')
  });

  var view = SC.TemplateView.create({
    templateName: 'menu',
    templates: templates,

    coffee: SC.Object.create({
      color: 'brown',
      price: '$4'
    })
  });

  view.createLayer();

  equals(view.$('h2').text(), "brown coffee", "precond - renders color correctly");
  equals(view.$('#price').text(), '$4', "precond - renders price correctly");

  view.set('coffee', SC.Object.create({
    color: "mauve",
    price: "$4.50"
  }));

  equals(view.$('h2').text(), "mauve coffee", "should update name field when content changes");
  equals(view.$('#price').text(), "$4.50", "should update price field when content changes");

  view.set('coffee', SC.Object.create({
    color: "mauve",
    price: "$5.50"
  }));

  equals(view.$('h2').text(), "mauve coffee", "should update name field when content changes");
  equals(view.$('#price').text(), "$5.50", "should update price field when content changes");

  view.setPath('coffee.price', "$5");

  equals(view.$('#price').text(), "$5", "should update price field when price property is changed");
});

test("Template views return a no-op function if their template cannot be found", function() {
  var view = SC.TemplateView.create({
    templateName: 'cantBeFound'
  });

  var template = view.get('template');

  ok(SC.typeOf(template) === 'function', 'template should be a function');
  equals(template(), '', 'should return an empty string');
});


