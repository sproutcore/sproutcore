// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================
/*globals TemplateTests */

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
  var customTagCollectionView = CollectionView.create({ tagName: "p" });
  
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

test("not passing a block to the collection helper creates a collection", function() {
  TemplateTests.CollectionTestView = SC.TemplateCollectionView.create({
    content: ['foo', 'bar', 'baz'],
    itemView: SC.TemplateView.design({
      template: SC.Handlebars.compile('<aside></aside>')
    })
  });

  var view = SC.TemplateView.create({
    template: SC.Handlebars.compile('{{collection "TemplateTests.CollectionTestView"}}')
  });

  view.createLayer();
  equals(view.$('aside').length, 3, 'one aside element is created for each content item');
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

test("should pass item* property when created with a block", function() {
  TemplateTests.CollectionTestView = SC.TemplateCollectionView.create({
    content: ['foo', 'bar', 'baz']
  });
  var view = SC.TemplateView.create({
    template: SC.Handlebars.compile('{{#collection TemplateTests.CollectionTestView itemFoo="bar"}}baz{{/collection}}')
  });
  view.createLayer();

  var childViews = view.getPath('childViews.firstObject.childViews');
  childViews.forEach(function(childView, index) {
    equals(childView.get('foo'), 'bar', "Child view #%@ has correct value for property set in template".fmt(index));
  });
});

test("should pass item* property when created without a block", function() {
  TemplateTests.CollectionTestView = SC.TemplateCollectionView.create({
    content: ['foo', 'bar', 'baz']
  });
  var view = SC.TemplateView.create({
    template: SC.Handlebars.compile('{{collection TemplateTests.CollectionTestView itemFoo="bar"}}')
  });
  view.createLayer();

  var childViews = view.getPath('childViews.firstObject.childViews');
  childViews.forEach(function(childView, index) {
    equals(childView.get('foo'), 'bar', "Child view #%@ has correct value for property set in template".fmt(index));
  });
});

test("should work inside a bound {{#if}}", function() {
  var testData = [SC.Object.create({ isBaz: false }), SC.Object.create({ isBaz: true }), SC.Object.create({ isBaz: true })];
  TemplateTests.ifTestCollectionView = SC.TemplateCollectionView.extend({
    content: testData
  });

  var view = SC.TemplateView.create({
    template: SC.Handlebars.compile('{{#if shouldDisplay}}{{#collection "TemplateTests.ifTestCollectionView"}}{{content.isBaz}}{{/collection}}{{/if}}'),
    shouldDisplay: true
  });

  view.createLayer();
  equals(view.$('ul li').length, 3, "renders collection when conditional is true");

  SC.run(function() { view.set('shouldDisplay', NO); });
  equals(view.$('ul li').length, 0, "removes collection when conditional changes to false");

  SC.run(function() { view.set('shouldDisplay', YES); });
  equals(view.$('ul li').length, 3, "collection renders when conditional changes to true");
});

test("should pass content as context when using {{#each}} helper", function() {
  var view = SC.TemplateView.create({
    template: SC.Handlebars.compile('{{#each releases}}Mac OS X {{version}}: {{name}} {{/each}}'),

    releases: [ { version: '10.7',
                  name: 'Lion' },
                { version: '10.6',
                  name: 'Snow Leopard' },
                { version: '10.5',
                  name: 'Leopard' } ]
  });

  SC.run(function() { view.createLayer(); });

  equals(view.$().text(), "Mac OS X 10.7: Lion Mac OS X 10.6: Snow Leopard Mac OS X 10.5: Leopard ", "prints each item in sequence");
});

test("should re-render when the content object changes", function() {
  TemplateTests.RerenderTest = SC.TemplateCollectionView.extend({
    content: []
  });

  var view = SC.TemplateView.create({
    template: SC.Handlebars.compile('{{#collection TemplateTests.RerenderTest}}{{content}}{{/collection}}')
  });

  view.createLayer();

  SC.run(function() {
    view.childViews[0].set('content', ['bing', 'bat', 'bang']);
  });

  SC.run(function() {
    view.childViews[0].set('content', ['ramalamadingdong']);
  });

  equals(view.$('li').length, 1, "rerenders with correct number of items");
  equals(view.$('li:eq(0)').text(), "ramalamadingdong");

});

test("collection view within a collection view with default content should render content once", function() {
  TemplateTests.InnerCollectionView = SC.TemplateCollectionView.extend();

  TemplateTests.OuterItemView = SC.TemplateView.extend({
    template: SC.Handlebars.compile('{{#collection "TemplateTests.InnerCollectionView" content=content.things}} {{content}} {{/collection}}')
  });

  TemplateTests.OuterCollectionView = SC.TemplateCollectionView.extend({
    content: [
      SC.Object.create({things: ['1', '2', '3']}),
      SC.Object.create({things: ['4', '5']}),
      SC.Object.create({things: ['6']})
    ],
    itemView: TemplateTests.OuterItemView
  });

  var view = SC.TemplateView.create({
    template: SC.Handlebars.compile('{{collection "TemplateTests.OuterCollectionView"}}')
  });

  view.createLayer();

  equals(view.$('ul ul:eq(0) li').length, 3, 'first nested collection view should have 3 list items');
  equals(view.$('ul ul:eq(1) li').length, 2, 'second nested collection view should have 2 list items');
  equals(view.$('ul ul:eq(2) li').length, 1, 'third nested collection view should have 1 list items');
  console.log(view.get('layer'));
});

