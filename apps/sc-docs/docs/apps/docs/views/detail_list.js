Docs.DetailListView = SC.ListView.extend({

  masterPropertyPath: 'mainPage.mainPane.classList.contentView',

  keyDown: function(evt){

    if(evt.keyCode === 37) {
      var propPath = this.get('masterPropertyPath');
      var masterView = Docs.getPath(propPath);

      masterView.becomeFirstResponder();

      //return YES;
    }

    return sc_super();
  }
});
