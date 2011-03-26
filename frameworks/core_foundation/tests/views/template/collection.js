module("SC.TemplateCollectionView");

TemplateTests = {};

test("creating a collection view works", function() {
  var CollectionChildView = SC.TemplateView.extend({
    template: SC.Handlebars.compile('<b>{{content.title}}</b>')
  });

  var ListItemChildView = CollectionChildView.extend({ tagName: "li" });
  var DefinitionTermChildView = CollectionChildView.extend({ tagName: "dt" });

  var CollectionView = SC.TemplateCollectionView.extend({
    content: [{title: 'Hello'}]
  });
  
  var defaultCollectionView = CollectionView.create();
  var ulCollectionView  = CollectionView.create({ tagName: "ul" });
  var olCollectionView  = CollectionView.create({ tagName: "ol" });
  var dlCollectionView  = CollectionView.create({ tagName: "dl", itemView: DefinitionTermChildView });
  var customTagCollectionView = CollectionView.create({ tagName: "p" })
  
  defaultCollectionView.createLayer();
  ulCollectionView.createLayer();
  olCollectionView.createLayer();
  dlCollectionView.createLayer();
  customTagCollectionView.createLayer();
  
  ok(defaultCollectionView.$().is("ul"), "Unordered list collection view was rendered (Default)");
  equals(defaultCollectionView.$('li').length, 1, "List item view was rendered (Default)");

  ok(ulCollectionView.$().is("ul"), "Unordered list collection view was rendered");
  equals(ulCollectionView.$('li').length, 1, "List item view was rendered");

  ok(olCollectionView.$().is("ol"), "Ordered collection collection view was rendered");
  equals(olCollectionView.$('li').length, 1, "List item view was rendered");

  ok(dlCollectionView.$().is("dl"), "Definition List collection view was rendered");
  equals(dlCollectionView.$('dt').length, 1, "Definition term view was rendered");
  
  ok(customTagCollectionView.$().is("p"), "Paragraph collection view was rendered");
  equals(customTagCollectionView.$('div').length, 1, "Child view was rendered");
});

test("passing a block to the collection helper sets it as the template for example views", function() {
  TemplateTests.CollectionTestView = SC.TemplateCollectionView.create({
    content: ['foo', 'bar', 'baz']
  });

  var view = SC.TemplateView.create({
    template: SC.Handlebars.compile('{{#collection "TemplateTests.CollectionTestView"}} <aside></aside> {{/collection}}')
  });

  view.createLayer();
  equals(view.$('aside').length, 3, 'one aside element is created for each content item');
});

test("a block passed to a collection helper defaults to the content property of the context", function() {
  TemplateTests.CollectionTestView = SC.TemplateCollectionView.create({
    content: ['foo', 'bar', 'baz']
  });

  var view = SC.TemplateView.create({
    template: SC.Handlebars.compile('{{#collection "TemplateTests.CollectionTestView"}} <aside>{{content}}</aside> {{/collection}}')
  });

  view.createLayer();

  equals(view.$('li:has(aside:contains("foo")) + li:has(aside:contains("bar")) + li:has(aside:contains("baz"))').length, 1, 'one aside element is created for each content item');
});

test("a block passed to a collection helper defaults to the view", function() {
  TemplateTests.CollectionTestView = SC.TemplateCollectionView.create({
    content: ['foo', 'bar', 'baz']
  });

  var view = SC.TemplateView.create({
    template: SC.Handlebars.compile('{{#collection "TemplateTests.CollectionTestView"}} <aside>{{content}}</aside> {{/collection}}')
  });

  view.createLayer();
  equals(view.$('li:has(aside:contains("foo")) + li:has(aside:contains("bar")) + li:has(aside:contains("baz"))').length, 1, 'precond - one aside element is created for each content item');

  SC.run(function() {
    TemplateTests.CollectionTestView.set('content', []);
  });
  equals(view.$('aside').length, 0, "all list item views should be removed from DOM");
});

test("should include an id attribute if id is set in the options hash", function() {
  var view = SC.TemplateView.create({
    template: SC.Handlebars.compile('{{#collection "TemplateTests.CollectionTestView" id="baz"}}foo{{/collection}}')
  });

  view.createLayer();
  equals(view.$('ul#baz').length, 1, "adds an id attribute");
});

test("should give its item views the class specified by itemClass", function() {
  TemplateTests.itemClassTestCollectionView = SC.TemplateCollectionView.create({
    content: ['foo', 'bar', 'baz']
  });
  var view = SC.TemplateView.create({
    template: SC.Handlebars.compile('{{#collection "TemplateTests.itemClassTestCollectionView" itemClass="baz"}}foo{{/collection}}')
  });

  view.createLayer();
  equals(view.$('ul li.baz').length, 3, "adds class attribute");
});

test("should give its item views the classBinding specified by itemClassBinding", function() {
  TemplateTests.itemClassBindingTestCollectionView = SC.TemplateCollectionView.create({
    content: [SC.Object.create({ isBaz: false }), SC.Object.create({ isBaz: true }), SC.Object.create({ isBaz: true })]
  });
  var view = SC.TemplateView.create({
    template: SC.Handlebars.compile('{{#collection "TemplateTests.itemClassBindingTestCollectionView" itemClassBinding="content.isBaz"}}foo{{/collection}}')
  });

  view.createLayer();
  equals(view.$('ul li.is-baz').length, 2, "adds class on initial rendering");

  SC.run(function() {
    TemplateTests.itemClassBindingTestCollectionView.setPath('content.0.isBaz', true);
  });

  equals(view.$('ul li.is-baz').length, 3, "adds class when property changes");

  SC.run(function() {
    TemplateTests.itemClassBindingTestCollectionView.setPath('content.0.isBaz', false);
  });

  equals(view.$('ul li.is-baz').length, 2, "removes class when property changes");
});

