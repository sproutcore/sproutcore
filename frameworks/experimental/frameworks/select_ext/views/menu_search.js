
SC.MenuSeachPane = SC.AutoResizingMenuPane.extend({

  // Prevent the text field from loosing the focus
  // UPDATE: Not working and still buggy
  //exampleView: SC.AutoResizingMenuItemView.extend({
  //  acceptsKeyPane: false,
  //}),

  searchView: null,

  isKeyPane: true,

  didAppendToDocument: function () {
    sc_super();
    this._textFieldView.becomeFirstResponder();
    this.get('searchView').notifyPropertyChange('searchValue'); // this causes the view to open the last selected list
  },

  createChildViews: function () {
    var textField, scroll, menuView;

    menuView = this._menuView = SC.View.create({
      layout: { height: 0 }
    });

    textField = this._textFieldView = this.createChildView(SC.TextFieldView, {
      layout: { top: 1, right: 1, left: 1, height: 24 },
      controlSize: this.get('controlSize'),

      leftAccessoryView: SC.View.extend({
        layout: { top: 3, left: 4, height: 20, width: 20 },
        classNames: ['fa fa-search'],
      })
    });

    textField.bind('value', this.get('searchView'), 'searchValue');

    scroll = this._menuScrollView = this.createChildView(SC.MenuScrollView, {
      layout: { top: 25 },
      controlSize: this.get('controlSize'),
      contentView: menuView
    });

    this.childViews = [textField, scroll];

    return this;
  },


  _updateMenuWidth: function() {
    var menuItemViews = this.get('menuItemViews');
    if (!menuItemViews) return;

    var len = menuItemViews.length, idx, view,
        width = this.get('minimumMenuWidth');

    for (idx = 0; idx < len; idx++) {
      view = menuItemViews[idx];
      width = Math.max(width, view.get('measuredSize').width + this.get('menuWidthPadding'));
    }

    this.adjust({ 'width': width, height: this.get('menuHeight')+25 });
    this.positionPane();
  },

});
