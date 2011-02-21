module("SC.TemplateCollectionView");

test("creating a collection view works", function() {
  var ExampleView = SC.TemplateView.extend({
    tagName: 'li',
    template: SC.Handlebars.compile('{{content/title}}')
  });

  var CollectionView = SC.TemplateCollectionView.extend({
    content: [{title: 'Hello'}],
    exampleView: ExampleView
  });

  var collectionView = CollectionView.create();
  collectionView.createLayer();

  ok(collectionView.$('li').length === 1, "The child example view was rendered");
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
    template: SC.Handlebars.compile('{{#collection "TemplateTests.CollectionTestView"}} <aside>{{this}}</aside> {{/collection}}')
  });

  view.createLayer();
  equals(view.$('li:has(aside:contains("foo")) + li:has(aside:contains("bar")) + li:has(aside:contains("baz"))').length, 1, 'one aside element is created for each content item');
});

test("a block passed to a collection helper defaults to the content property of the context", function() {
  TemplateTests.CollectionTestView = SC.TemplateCollectionView.create({
    content: ['foo', 'bar', 'baz']
  });

  var view = SC.TemplateView.create({
    template: SC.Handlebars.compile('{{#collection "TemplateTests.CollectionTestView"}} <aside>{{this}}</aside> {{/collection}}')
  });

  view.createLayer();
  equals(view.$('li:has(aside:contains("foo")) + li:has(aside:contains("bar")) + li:has(aside:contains("baz"))').length, 1, 'precond - one aside element is created for each content item');

  window.billy = true;

  SC.run(function() {
    TemplateTests.CollectionTestView.set('content', []);
  });
  equals(view.$('aside').length, 0, "all list item views should be removed from DOM");
});

