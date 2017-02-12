
SC.SelectSearchView = SC.SelectView.extend({

  menuPreferMatrix: [0, -24, SC.POSITION_BOTTOM],

  searchValue: null,

  searchValueDidChange: function () {
    this.invokeLater('_sscsv_searchValueDidChange', 50);
  }.observes('searchValue'),

  _sscsv_searchValueDidChange: function () {
    this.notifyPropertyChange('displayItems');
  },

  _scsv_itemsDidChange: function () {
    this.notifyPropertyChange('displayItems');
    this._searchCache = null;
  }.observes('*items.[]'),

  _sscsv_invalidateSearchCache: function () {
    this._searchCache = null;
  }.observes('itemTitleKey', 'itemSearchKey'),

  searchItems: function(items, value, key) {
    // we cache the searchValues by index
    var searchCache = this._searchCache;
    if (!searchCache && key) {
      searchCache = this._searchCache = items.getEach(key);
    }
    var ret;
    SC.Benchmark.start('searchItems');
    if (value) {
      var reg = new RegExp(value, "i");
      ret = items.filter(function(item, itemIndex) {
        // var itemValue = key ? SC.get(item, key) : item;
        var itemValue = key? searchCache[itemIndex]: item;
        return SC.typeOf(itemValue) === SC.T_STRING ? itemValue.search(reg) !== -1 : false;
      });
    }
    SC.Benchmark.end('searchItems');
    return ret;
  },

  displayItems: function () {
    var ret = sc_super();
    var searchValue = this.get('searchValue');
    var itemTitleKey = this.get('itemSearchKey') || this.get('itemTitleKey') || 'title';
    return searchValue? this.searchItems(ret, searchValue, itemTitleKey): ret;
  }.property().cacheable(),


  menu: SC.AutoResizingMenuPane.extend(SC.SelectViewMenu, {
    // Prevent the text field from loosing the focus
    // UPDATE: Not working and still buggy
    //exampleView: SC.AutoResizingMenuItemView.extend({
    //  acceptsKeyPane: false,
    //}),

    isKeyPane: true,

    didAppendToDocument: function () {
      sc_super();
      this._textFieldView.beginEditing();
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

      textField.bind('value', this.get('selectView'), 'searchValue');

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

  }),

});

