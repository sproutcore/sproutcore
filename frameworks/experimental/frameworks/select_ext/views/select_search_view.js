
sc_require("mixins/item_filter");


SC.SelectSearchView = SC.SelectView.extend(SC.ItemFilter, {

  menuPreferMatrix: [0, -24, SC.POSITION_BOTTOM],

  searchValue: null,

  searchValueDidChange: function () {
    this.invokeLater('_sscsv_searchValueDidChange', 50);
  }.observes('searchValue'),

  _sscsv_searchValueDidChange: function () {
    this.notifyPropertyChange('displayItems');
  },

  _scsv_itemsDidChange: function () {
    this.notifyPropertyChange('_displayItems');
    this.notifyPropertyChange('displayItems');
    this._searchCache = null;
  }.observes('*items.[]', 'emptyName'),

  _sscsv_invalidateSearchCache: function () {
    this._searchCache = null;
  }.observes('itemTitleKey', 'itemSearchKey'),

  _displayItems: function () {
    return this.formatDisplayItems();
  }.property().cacheable(),

  displayItems: function () {
    var ret = this.get('_displayItems');
    var searchValue = this.get('searchValue');
    var itemTitleKey = this.get('itemSearchKey') || this.get('itemTitleKey') || 'title';
    return searchValue? this.searchItems(ret, searchValue, itemTitleKey): ret;
  }.property().cacheable(),

  menu: SC.MenuSearchPane.extend(SC.SelectViewMenu, {
    searchView: function() {
      return this.get('selectView');
    }.property('selectView').cacheable(),
  })

});
