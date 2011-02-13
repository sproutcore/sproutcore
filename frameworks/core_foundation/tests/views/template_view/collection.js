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
