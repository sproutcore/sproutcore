
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

  menu: SC.MenuSeachPane.extend(SC.SelectViewMenu, {
    searchView: function() {
      return this.get('selectView');
    }.property('selectView').cacheable(),
  })

});

