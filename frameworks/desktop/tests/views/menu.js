// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            portions copyright @2009 Apple, Inc.
// License:   Licened under MIT license (see license.js)
// ==========================================================================

/*global module test htmlbody ok equals same stop start */

module("SC.MENUVIEW UI");

htmlbody('<style> .sc-static-layout { border: 1px red dotted; } </style>');
(function() {
  var anchor = SC.ControlTestPane.design()
	 .add("anchor", SC.ButtonView, { 
	 title: "Anchor Button" 
 });
  var pane = SC.PickerPane.create({contentView: 
			SC.MenuView.extend({ 
	    		items: "Item1 Item2 Item3 Item4 Item5".w(),
	    		isEnabled: YES,
	    		layout: { height: 120 }
				})
	  }).popup(anchor, SC.PICKER_MENU);
 	
  
  pane.show(); // add a test to show the test pane
 	
})() ;



// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            portions copyright @2009 Apple, Inc.
// License:   Licened under MIT license (see license.js)
// ==========================================================================

/*global module test htmlbody ok equals same stop start */

// module("SC.MENUVIEW UI");
// 
// htmlbody('<style> .sc-static-layout { border: 1px red dotted; } </style>');
// (function() {
//   var iconPath= "http://www.freeiconsweb.com/Icons/16x16_people_icons/People_046.gif";
//   var pane = SC.ControlTestPane.design()
//     
//   .add("3_items,1_sel,disabled", SC.MenuView, { 
//     //items: "Item1 Item2 Item3 Item4 Item5".w(),
//     childViews:[
//  	  SC.MenuItemView.design({
// 	        content: SC.Object.create({title:'File ',iconURL:iconPath, isEnabled:YES}),
// 	  		contentValueKey:'title',
// 			contentIconKey:'iconURL'
// 	      }),
// 	  SC.MenuItemView.design({
// 	        content: SC.Object.create({title:'Edit ',iconURL:'', isEnabled:YES}),
// 	  		contentValueKey:'title',
// 			contentIconKey:'iconURL'
// 	  })	
//     ],
//     isEnabled: YES,
//     layout: { height: 150 }
//   });
//   
//   pane.show(); // add a test to show the test pane
//  	
// })() ;