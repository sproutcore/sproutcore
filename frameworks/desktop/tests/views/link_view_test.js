// ==========================================================================
// Project:   SproutCore
// Copyright: ©2014 7x7 Software, Inc.
// License:   Licensed under MIT license
// ==========================================================================
/*global module, test, equals, ok, start, stop */

var linkView,
  pane;


module("SC.LinkView", {

  setup: function () {
    linkView = SC.LinkView.create();
    pane = SC.Pane.create({
      childViews: [linkView],
      layout: { width: 400, height: 400 }
    });
  },

  teardown: function () {
    pane.destroy();
    linkView = pane = null;
  }

});

test("The view renders as expected: Default values", function () {
  pane.append();

  var layer = linkView.get('layer');

  // body: ""
  // fileName: null
  // escapeHTML: true
  // href: '#'
  // language: null
  // ping: null
  // rel: null
  // target: '_blank'
  // type: null
  equals(layer.innerText, "", "The innerText of the layer is");
  if (SC.platform.a.download) { equals(layer.download, "", "The download attribute of the layer is"); }
  equals(layer.href, document.URL + "#", "The href attribute of the layer is");
  equals(layer.hreflang, SC.Locale.currentLocale.language, "The hreflang attribute of the layer is");
  equals(layer.ping, "", "The ping attribute of the layer is");
  equals(layer.rel, "", "The rel attribute of the layer is");
  equals(layer.target, "_blank", "The target attribute of the layer is");
  equals(layer.type, "", "The type attribute of the layer is");
});

test("The view renders as expected: Custom values", function () {
  // Customize the link view.
  linkView.set('body', '<div>ABC</div>');
  linkView.set('fileName', 'ABC.txt');
  linkView.set('href', 'http://bogus-site.com/files/abc.txt');
  linkView.set('language', 'fr');
  linkView.set('ping', ['http://logback.com/?clicked=file']);
  linkView.set('rel', ['author']);
  linkView.set('target', '_self');
  linkView.set('type', 'text/plain');

  pane.append();

  var layer = linkView.get('layer');

  equals(layer.innerText, "<div>ABC</div>", "The innerText of the layer is");
  if (SC.platform.a.download) { equals(layer.download, "ABC.txt", "The download attribute of the layer is"); }
  equals(layer.href, "http://bogus-site.com/files/abc.txt", "The href attribute of the layer is");
  equals(layer.hreflang, 'fr', "The hreflang attribute of the layer is");
  if (SC.platform.a.ping) { equals(layer.ping, "http://logback.com/?clicked=file", "The ping attribute of the layer is"); }
  equals(layer.rel, "author", "The rel attribute of the layer is");
  equals(layer.target, "_self", "The target attribute of the layer is");
  equals(layer.type, "text/plain", "The type attribute of the layer is");
});

test("The view renders as expected: Unescaped body", function () {
  // Customize the link view.
  linkView.set('escapeHTML', false);
  linkView.set('body', '<div>ABC</div>');

  pane.append();

  var layer = linkView.get('layer');

  equals(layer.innerHTML, "<div>ABC</div>", "The innerHTML of the layer is");
  equals(layer.innerText.trimRight(), "ABC", "The innerText of the layer is");
});

test("The view updates as expected: Custom values", function () {
  // Customize the link view.
  linkView.set('body', '<div>ABC</div>');
  linkView.set('fileName', 'ABC.txt');
  linkView.set('href', 'http://bogus-site.com/files/abc.txt');
  linkView.set('language', 'fr');
  linkView.set('ping', ['http://logback.com/?clicked=file']);
  linkView.set('rel', ['author']);
  linkView.set('target', '_self');
  linkView.set('type', 'text/plain');

  pane.append();

  var layer = linkView.get('layer');

  equals(layer.innerText, "<div>ABC</div>", "The innerText of the layer is");
  if (SC.platform.a.download) { equals(layer.download, "ABC.txt", "The download attribute of the layer is"); }
  equals(layer.href, "http://bogus-site.com/files/abc.txt", "The href attribute of the layer is");
  equals(layer.hreflang, 'fr', "The hreflang attribute of the layer is");
  if (SC.platform.a.ping) { equals(layer.ping, "http://logback.com/?clicked=file", "The ping attribute of the layer is"); }
  equals(layer.rel, "author", "The rel attribute of the layer is");
  equals(layer.target, "_self", "The target attribute of the layer is");
  equals(layer.type, "text/plain", "The type attribute of the layer is");

  SC.run(function () {
    linkView.set('body', '<div>DEF</div>');
    linkView.set('fileName', 'DEF.js');
    linkView.set('href', 'http://bogus-site.com/files/def.js');
    linkView.set('language', 'es');
    linkView.set('ping', ['https://logback.com/?clicked=file']);
    linkView.set('rel', ['sidebar']);
    linkView.set('target', '_blank');
    linkView.set('type', 'text/javascript');
  });

  equals(layer.innerText, "<div>DEF</div>", "The innerText of the layer is now");
  if (SC.platform.a.download) { equals(layer.download, "DEF.js", "The download attribute of the layer is now"); }
  equals(layer.href, "http://bogus-site.com/files/def.js", "The href attribute of the layer is now");
  equals(layer.hreflang, 'es', "The hreflang attribute of the layer is now");

  // Some properties don't result in re-rendering and aren't updated for performance reasons.
  if (SC.platform.a.ping) { equals(layer.ping, "http://logback.com/?clicked=file", "The ping attribute of the layer is still"); }
  equals(layer.rel, "author", "The rel attribute of the layer is still");
  equals(layer.target, "_self", "The target attribute of the layer is still");
  equals(layer.type, "text/plain", "The type attribute of the layer is still");
});
