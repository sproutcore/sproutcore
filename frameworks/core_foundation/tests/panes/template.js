// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================
module("Template Panes");

test("Template panes append a main pane to the document body", function() {
  var pane = SC.TemplatePane.append({
    layerId: 'template-panes-are-so-cool',

    template: SC.Handlebars.compile('<h1>foo bar baz</h1>')
  });

  ok(pane.get('layer'), "creates a layer for the pane");
  equals(pane.$('#template-panes-are-so-cool').length, 1, "creates a view with the passed id");

  pane.remove();
});
