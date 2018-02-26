
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
    this.notifyPropertyChange('displayItems');
    this._searchCache = null;
  }.observes('*items.[]'),

  _sscsv_invalidateSearchCache: function () {
    this._searchCache = null;
  }.observes('itemTitleKey', 'itemSearchKey'),

  displayItems: function () {
    var ret = sc_super();
    var searchValue = this.get('searchValue');
    var itemTitleKey = this.get('itemSearchKey') || this.get('itemTitleKey') || 'title';
    return searchValue? this.searchItems(ret, searchValue, itemTitleKey): ret;
  }.property().cacheable(),

  menu: SC.MenuSeachPane.extend(SC.SelectViewMenu, {
    searchView: function() {
      return this.get('selectView');
    }.property('selectView').cacheable(),
  })

});
