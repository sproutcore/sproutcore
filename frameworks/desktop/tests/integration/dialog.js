// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Apple, Inc. and contributors.
// License:   Licened under MIT license (see license.js)
// ==========================================================================

/*global module test equals context ok same htmlbody */

htmlbody('<style> .sc-pane { z-index: 1000; background-color: #ccc; border: 1px #888 solid; position: absolute; } </style>');

module("A dialog with some basic controls and buttons");

test("adding dialog to screen", function() {

  var pane = SC.Pane.design()
    .layout({ top: 20, left: 20, width: 480, height: 320 })
    .childView(SC.LabelView.design()
      .prop('value', 'First Name:')
      .prop("textAlign", SC.ALIGN_RIGHT)
      .prop("fontWeight", SC.BOLD_WEIGHT)
      .layout({ top: 20, left: 20, height: 23, width: 80 }))

    .childView(SC.TextFieldView.design()
      .prop('hint', 'John')
      .layout({ top: 20, left: 120, height: 23, width: 120 })) ;

  SC.RunLoop.begin();
  pane.create().append();
  SC.RunLoop.end();  
}) ;

