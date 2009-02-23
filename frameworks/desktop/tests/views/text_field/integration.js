// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            portions copyright @2009 Apple, Inc.
// License:   Licened under MIT license (see license.js)
// ==========================================================================

/*global module test equals context ok same htmlbody */

module("TextField Integration");

var pane, view ;
test("create a text field on screen", function() {
  SC.RunLoop.begin();
  pane = SC.MainPane.create().append();
  view = SC.TextFieldView.create({
    layout: { left: 20, top: 20, width: 100, height: 23 },
    hint: "First Name" 
  });
  
  pane.appendChild(view) ;
  SC.RunLoop.end();  
}) ;

