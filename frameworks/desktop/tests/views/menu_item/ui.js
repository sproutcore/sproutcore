htmlbody('<style> .sc-static-layout { border: 1px red dotted; } </style>');
(function() {
	var method = function() { console.log("done"); };
var pane = SC.ControlTestPane.design({ width:200,height: 32 })
  .add("full", SC.MenuItemView.design({ 
    content: SC.Object.create({ 
      icon: "sc-icon-folder-16",
      title1: "List Item 1",
	  	checkbox:YES,
			shortcut:"Text",
 			keyEquivalent:"alt_shift_z"
   }),
	isAnOption: YES,
  contentValueKey: "title1",
  contentIconKey:  "icon",
  shortCutKey: "shortcut",
	contentCheckboxKey:"checkbox",
	keyEquivalent:"shift_>",
	action: method,
	isEnabled:NO
    // contentIsBranchKey: 'branch'
  }))
  
  .add("disabled menu item with no content", SC.MenuItemView.design({ 
    content: SC.Object.create(),
    isSeperator: YES,
    isEnabled: NO
  }));
 
pane.show();

module("Menu Item View");
test("Changing the properties", function() {
	pane.view('full').set('isEnabledKey', YES);
});
})();