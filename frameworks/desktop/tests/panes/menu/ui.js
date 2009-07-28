// ==========================================================================
// Project: SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
// portions copyright @2009 Apple Inc.
// License: Licened under MIT license (see license.js)
// ==========================================================================
/*global module test htmlbody ok equals same stop start */

htmlbody('<style> .sc-static-layout { border: 1px red dotted; } </style>');

var iconURL= "http://www.freeiconsweb.com/Icons/16x16_people_icons/People_046.gif";
var method = function() { console.log("done"); };

var anchor = SC.ControlTestPane.design()
  .add("anchor", SC.PopupButtonView, { 
     title: "Menu",
     keyEquivalent:"ctrl_z",
     layout:{width:100,height:20}  
  });
anchor.show();

module("SC.MENUPANE UI");
test('menu item added ', function() {
  var menu = SC.MenuPane.create({
              layout: { width: 150, height: 'auto' },
              items: [ { title: "Item1", isEnabled:YES, icon: iconURL, 
                separator: NO, action: method ,height:30,
                checkbox:YES, shortCut: "alt_n", keyEquivalent:"alt_n" },
                { title: "", isEnabled:YES, icon: null, separator: YES},
                { title: "Item2", isEnabled:NO, icon: iconURL, separator: NO },
                { title: "Item3", isEnabled:YES, icon: iconURL, separator: NO , branchItem:YES,
                subMenu:SC.MenuPane.create({
                  layout: { width: 150, height: 'auto' },
                  items:["title1","title2"],
                  contentView:SC.View.extend({
                    layout: { top: 0, left: 0, bottom: 0, right: 0 }
                  })
                })
              }],
              isEnabled: YES,
              itemIsEnabledKey:"isEnabled",
              itemTitleKey:"title",
              itemIconKey:"icon",
              itemSeparatorKey:'separator',
              itemActionKey: 'action',
              itemCheckboxKey:'checkbox',
              itemBranchKey:'branchItem',  
              preferType:SC.PICKER_MENU,
              subMenuKey:'subMenu',
              itemShortCutKey:'shortCut',
              itemKeyEquivalentKey:'keyEquivalent',
              itemHeightKey:'height',
              contentView:SC.View.extend({
                layout: { top: 0, left: 0, bottom: 0, right: 0 }})
              });
  anchor.view('anchor').menu = menu;
});
  
  
