var pane = SC.ControlTestPane.design({ height: 32 })
  .add("basic", SC.MenuItemView.design({ 
    content: "List Item"
  }))

  .add("full", SC.MenuItemView.design({ 
    content: SC.Object.create({ 
      // icon: "sc-icon-folder-16",
      title: "List Item",
      branch: YES 
    }),
    

    hasChild: YES,

    contentValueKey: "title",

    contentIconKey:  "icon",

    contentIsBranchKey: 'branch'

  }));
pane.show();

window.pane = pane ;