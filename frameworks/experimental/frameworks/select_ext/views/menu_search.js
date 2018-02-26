
SC.MenuSeachPane = SC.AutoResizingMenuPane.extend({

  // Prevent the text field from loosing the focus
  // UPDATE: Not working and still buggy
  //exampleView: SC.AutoResizingMenuItemView.extend({
  //  acceptsKeyPane: false,
  //}),

  searchView: null,

  isKeyPane: true,

  menuHeightPadding: 28,

  didAppendToDocument: function () {
    sc_super();
    this._textFieldView.becomeFirstResponder();
    this.get('searchView').notifyPropertyChange('searchValue'); // this causes the view to open the last selected list
  },

  createChildViews: function () {
    var textField, scroll;

    textField = this._textFieldView = this.createChildView(SC.TextFieldView, {
      layout: { top: 1, right: 1, left: 1, height: 24 },
      controlSize: this.get('controlSize'),

      leftAccessoryView: SC.View.extend({
        layout: { top: 3, left: 4, height: 20, width: 20 },
        classNames: ['fa fa-search'],
      })
    });

    textField.bind('value', this.get('searchView'), 'searchValue');

    scroll = this.createScrollView({
      layout: { top: 25 },
      contentView: this.createListView()
    });

    this.childViews = [textField, scroll];

    return this;
  }

});
