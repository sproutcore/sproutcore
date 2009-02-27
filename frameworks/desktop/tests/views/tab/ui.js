// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            portions copyright @2009 Apple, Inc.
// License:   Licened under MIT license (see license.js)
// ==========================================================================

/*global module test htmlbody ok equals same stop start */


htmlbody('<style> .sc-static-layout { border: 1px red dotted; } </style>');

(function() {
  var iconURL= "http://www.freeiconsweb.com/Icons/16x16_people_icons/People_046.gif";
  
  var pane = SC.ControlTestPane.design()
    
    .add("tabView", SC.TabView, { 
      nowShowing: 'tab2',

      items: [
        { title: "tab1", value: "tab1" , icon: iconURL},
        { title: "tab2", value: "tab2" , icon: iconURL},
        { title: "tab3", value: "tab3" , icon: iconURL}
      ],
      
      itemTitleKey: 'title',
      itemValueKey: 'value',
      itemIconKey: 'icon',
      layout: { left:12, height: 200, right:12, top:12, bottom:12 }
      
  //    userDefaultKey: "mainPane"
  });
    
  pane.show(); // add a test to show the test pane

  // ..........................................................
  // TEST VIEWS
  // 
  module('SC.TabView ui', pane.standardSetup());
  
  test("basic", function() {
    ok(true, 'hello');
  });

})();
