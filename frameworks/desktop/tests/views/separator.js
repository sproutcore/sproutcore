// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            portions copyright @2009 Apple Inc.
// License:   Licened under MIT license (see license.js)
// ==========================================================================

/*global module test htmlbody ok equals same stop start */

htmlbody('<style> .sc-static-layout { border: 1px red dotted; } </style>');

(function() {
  var pane = SC.ControlTestPane.design()
  .add("horizontal", SC.SeparatorView, { 
    layoutDirection: SC.LAYOUT_HORIZONTAL
  })
  .add("vertical", SC.SeparatorView, { 
    layoutDirection: SC.LAYOUT_VERTICAL
  });   
  pane.show(); 

module("TODO: Test SC.Separator UI", pane.standardSetup());

  test("basic", function() {
    var view = pane.view('horizontal');
    ok(!view.$().hasClass('vertical'), 'should not be vertically divided');
    equals(view.get('layoutDirection'),SC.LAYOUT_HORIZONTAL,"the view is divided horizontally");
    view = pane.view('vertical');
    ok(!view.$().hasClass('horizontal'), 'should not be horizontally divided');
    equals(view.get('layoutDirection'),SC.LAYOUT_VERTICAL,"the view is divided vertically");	
  });
  
  test("renders a component with a span tag",function(){
	var view = pane.view('horizontal');
	equals(view.get('tagName'), 'span', 'creates a pan tag');
  });
})();
