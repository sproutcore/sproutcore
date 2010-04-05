/*globals TestControls Forms*/
TestControls.listPage = SC.View.design({
  childViews: "scroll".w(),
  scroll: SC.ScrollView.design({
    backgroundColor: "white",
    contentView: SC.ListView.design({
      classNames: ['big-list'],
      rowHeight: 44,
      content: function() {
        var idx = 0, ret = [];
        for (idx = 0; idx < 1000; idx++) {
          ret.push(SC.Object.create({"title": "Item " + idx}));
        }
        return ret;
      }.property().cacheable(),
      contentValueKey: "title"
    })
  })
});