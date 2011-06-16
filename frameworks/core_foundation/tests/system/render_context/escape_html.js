// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/*global module test equals context */
module("Render Context--Escaping HTML");
test("Escaping HTML", function() {
  var input = "<p>HTML!</p><script>alert('hi');<" + "/script> & Hello, World!";
  var output = SC.RenderContext.escapeHTML(input);
  
  equals(output, '&lt;p&gt;HTML!&lt;/p&gt;&lt;script&gt;alert(\'hi\');&lt;/script&gt; &amp; Hello, World!', "Properly escapes HTML");
});