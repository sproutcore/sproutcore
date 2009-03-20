htmlbody('<style> .sc-static-layout { border: 1px red dotted; } </style>');
(function() {
	var method = function() { alert("done"); };
var pane = SC.ControlTestPane.design({ height: 32 })
  .add("full", SC.MenuItemView.design({ 
    content: SC.Object.create({ 
      icon: "sc-icon-folder-16",
      title1: "List Item 1",
	  checkbox:YES,
	  
    }),
     //isSeperator: YES,
    // hasChild: YES,
	isAnOption: YES,
    contentValueKey: "title1",
    contentIconKey:  "icon",
    shortCutKey: "icon",
	contentCheckboxKey:"checkbox",
	keyEquivalent:"shift_>",
	action: method
    // contentIsBranchKey: 'branch'
  }))

  .add("full", SC.MenuItemView.design({ 
    content: SC.Object.create({ 
//      icon: "sc-icon-folder-16",
//      title: "List Item 1",
//      branch: YES ,
//      met: method
    }),
     isSeperator: YES
     // hasChild: YES,
     // 	 isAnOption: YES,
     //      contentValueKey: "title",
     //      contentIconKey:  "icon",
     //      shortCutKey: "icon",
     //      action: method
    // contentIsBranchKey: 'branch'
  }))

  .add("full", SC.MenuItemView.design({ 
    content: SC.Object.create({ 
      // icon: "",
      title: "List Item 2",
      branch: YES
      // met: method
    }),
     //isSeperator: YES,
    // hasChild: YES,
	// isAnOption: YES,
    contentValueKey: "title",
    // contentIconKey:  "icon",
    // shortCutKey: "icon",
    // action: method,
    contentIsBranchKey: 'branch'
  }));
pane.show();
})();