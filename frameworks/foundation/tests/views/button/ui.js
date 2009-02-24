// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©3006-2009 Apple, Inc. and contributors.
// License:   Licened under MIT license (see license.js)
// ==========================================================================


module("SC.ButtonView#render");

htmlbody('<style>.sc-view { border: 1px red solid; z-index: -1; position: absolute; }</style>');

test("Render buttons in all states and with the regular and blank theme", function() {
  
  var iconURL= "http://www.freeiconsweb.com/Icons/16x16_people_icons/People_046.gif";
  // default button no properties
  var button = SC.ButtonView.design()
    .layout({ centerX:0, width: 130, top: 20, height: 18 })
    .prop('theme', 'blank');
    
  // default button with a title
  var button2 = SC.ButtonView.design()
    .layout({ centerX:0, width: 130, top: 48, height: 18 })
    .prop('title', 'title')
    .prop('theme', 'blank');
    
    // default button with a title
  var button3 = SC.ButtonView.design()
    .layout({ centerX:0, width: 130, top: 76, height: 18 })
    .prop('icon', iconURL)
    .prop('theme', 'blank');
  //default button with icon and title
  var button4 = SC.ButtonView.design()
    .layout({ centerX:0, width: 130, top: 104, height: 18 })
    .prop('title', 'title , icon')
    .prop('icon', 'http://www.freeiconsweb.com/Icons/16x16_people_icons/People_046.gif')
    .prop('theme', 'blank');
  //default button with icon and title disabled
  var button5 = SC.ButtonView.design()
    .layout({ centerX:0, width: 180, top: 132, height: 18 })
    .prop('title', 'title , icon , disabled')
    .prop('icon', iconURL)
    .prop('isEnabled', NO)
    .prop('theme', 'blank');
  //default button default
  var button6 = SC.ButtonView.design()
    .layout({ centerX:0, width: 130, top: 160, height: 18 })
    .prop('title', 'isDefault')
    .prop('icon', iconURL)
    .prop('isDefault', YES)
    .prop('theme', 'blank');
  //default button isSelected
  var button7 = SC.ButtonView.design()
    .layout({ centerX:0, width: 130, top: 188, height: 18 })
    .prop('title', 'isSelected')
    .prop('icon', iconURL)
    .prop('isSelected', YES)
    .prop('theme', 'blank');
  //toggle
  var button8 = SC.ButtonView.design()
    .layout({ centerX:0, width: 130, top: 216, height: 18 })
    .prop('title', 'toggle')
    .prop('icon', iconURL)
    .prop('buttonBehavior', SC.TOGGLE_BEHAVIOR)
    .prop('theme', 'blank');


  // create design
  var pane = SC.Pane.design()
    .layout({right: 20, top: 100 , height:250, width:400})
    .childView(button)
    .childView(button2)
    .childView(button3)
    .childView(button4)
    .childView(button5)
    .childView(button6)
    .childView(button7)
    .childView(button8);
    
  // instantiate pane...
  pane = pane.create();
  
  ok(!pane.get('isVisibleInWindow'), 'pane.isVisibleInWindow should be NO');
  for(var i=0; i<pane.childViews.length; i++){
    var v=pane.childViews[i];
    ok(!v.get('isVisibleInWindow'), 'view.isVisibleInWindow should be NO');  
  }
  
  //append
  SC.RunLoop.begin();
  pane.append();
  SC.RunLoop.end();
  
  for(var i=0; i<pane.childViews.length; i++){
    var v=pane.childViews[i];
    ok(v.get('isVisibleInWindow'), 'view.isVisibleInWindow should be YES');  
  }
  
  var v=pane.childViews[0];
  ok(!v.get('icon'), 'defaultBuuttonView. should not have an icon YES');  
  ok(!v.get('title'), 'defaultBuuttonView. should not have a title YES');


  rawS3HTML='<a href="javascript:;" role="button" id="@94" class="sc-view sc-button-view blank sc-regular-size" style="left: 50%; width: 130px; margin-left: -65px; top: 20px; height: 18px"><span class="inner" style="min-width: 80px"></span></a>';
  rawFFHTML='<a href="javascript:;" role="button" id="@94" class="sc-view sc-button-view blank sc-regular-size" style="left: 50%; width: 130px; margin-left: -65px; top: 20px; height: 18px;"><span class="inner" style="min-width: 80px;"></span></a>';
  
  l=v.get('layer');
  var isInParentlayer=false;

    if(l.parentNode.innerHTML.indexOf(rawS3HTML)>=0 || l.parentNode.innerHTML.indexOf(rawFFHTML)>=0)
      isInParentlayer=true;
    ok(isInParentlayer, 'rawHTML is contained in the innerHTML of the parentNode');  
  
});
