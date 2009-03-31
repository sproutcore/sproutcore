// ==========================================================================
// Project: SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
// portions copyright @2009 Apple, Inc.
// License: Licened under MIT license (see license.js)
// ==========================================================================
/*global module test htmlbody ok equals same stop start */
module("SC.MENUPANE UI");
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


  test('menu item added ', function() {
    var menu = SC.MenuPane.create({

        items: [ { title: "Item1", isEnabled:YES, icon: iconURL, 
          separator: NO, action: method ,
          checkbox:YES, shortCut: "alt_n", keyEquivalent:"alt_n" },
          { title: "", isEnabled:YES, icon: null, separator: YES},
          { title: "Item2", isEnabled:NO, icon: iconURL, separator: NO },
          { title: "Item3", isEnabled:YES, icon: iconURL, separator: NO , branchItem:YES,
          subMenu:SC.MenuPane.create({
            items:["title1","title2"],
            contentView:SC.View.extend({
              layout: { width: 150, height: 200 }
              })
            })
        }],

      isEnabled: YES,
      itemIsEnabledKey:"isEnabled",
      itemTitleKey:"title",
      itemIconKey:"icon",
      itemSeparator:'separator',
      itemAction: 'action',
      itemCheckboxKey:'checkbox',
      itemBranchKey:'branchItem',  
      preferType:SC.PICKER_MENU,
      subMenuKey:'subMenu',
      itemShortCutKey:'shortCut',
      itemKeyEquivalent:'keyEquivalent',
      contentView:SC.View.extend({
        layout: { width: 150, height: 200 }})
    });
    anchor.view('anchor').menu = menu;
  });
  
  
