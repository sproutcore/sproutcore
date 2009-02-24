// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            portions copyright @2009 Apple, Inc.
// License:   Licened under MIT license (see license.js)
// ==========================================================================


module("SC.CheckboxView UI");


test("various UI states of SC.CheckboxView", function() {

  var pane = SC.ControlTestPane.design()
    .add("basic", SC.CheckboxView, { 
      value: NO, isEnabled: YES, title: "Hello World" 
    })
    
    .add("selected", SC.CheckboxView, { 
      value: YES, title: "Hello World" 
    })
    
    .add("disabled", SC.CheckboxView, { 
      isEnabled: NO, title: "Hello World" 
    })
    
    .add("disabled - selected", SC.CheckboxView, { 
      isEnabled: NO, value: YES, title: "Hello World" 

    });

  pane.create(); // show on screen    
});