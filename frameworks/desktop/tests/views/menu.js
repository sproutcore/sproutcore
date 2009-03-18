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
  var iconURL= "http://www.freeiconsweb.com/Icons/16x16_people_icons/People_046.gif";
  var method = function() { console.log("done"); };
 //  var anchor = SC.ControlTestPane.design()
 //   .add("anchor", SC.ButtonView, { 
 //      title: "Anchor Button" 
 //   });
 // anchor.show();
 // var menuView = SC.MenuView.create({ 
 // 	    	items: "Item1 Item2 Item3 Item4 Item5".w(),
 // 	    	isEnabled: YES,
 // 			layout:{height: 150, width: 200}
 // 			}) ;
 //  var pane = SC.PickerPane.create({
 //      contentView: menuView
 //    });
 //  pane.popup(anchor.view('anchor'), SC.PICKER_MENU);
 //  pane.show(); // add a test to show the test pane
  var pane = SC.ControlTestPane.design()
    .add ("create a menu from strings",
       		SC.MenuView,{ 
       	    items: "Item1 Item2 Item3 Item4 Item5".w(),
       	    isEnabled: YES,
       	    layout: { height: 150, width: 200 }
       		})
		

	.add ("create a complete menu",
			SC.MenuView,{ 
		    items: [ { title: "Item1",isEnabled:YES, icon: iconURL, separator: NO, action: method ,checkbox:YES },
	          { title: "",isEnabled:NO,icon: null, separator: YES},
	          { title: "Item2",isEnabled:NO,icon: iconURL, separator: NO }],
		    isEnabled: YES,
		    layout: { height: 120, width:150 },
			itemIsEnabledKey:"isEnabled",
			itemTitleKey:"title",
			itemIconKey:"icon",
			itemSeparator:'separator',
			itemAction: 'action',
			itemCheckboxKey:'checkbox'
//			itemWidth:150
			}
			);

 pane.show();
 	
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