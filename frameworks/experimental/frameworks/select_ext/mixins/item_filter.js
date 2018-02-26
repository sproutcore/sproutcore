
SC.ItemFilter = {

  filterItems: function(value) {
    this._searchValue = value;
    this.invokeOnceLater('doFilterItems', 250);
  },

  doFilterItems: function() {
    if (!this._initialItems) this._initialItems = this.get('items');

    var value = this._searchValue,
      itemTitleKey = this.get('itemSearchKey') || this.get('itemTitleKey'),
      items = this.searchItems(this._initialItems, value, itemTitleKey);

    this.set('items', items);
  },

  searchItems: function(items, value, key) {
    // we cache the searchValues by index
    var searchCache = this._searchCache,
      ret;

    if (!searchCache && key) {
      searchCache = this._searchCache = items.getEach(key);
    }

    if (value) {
      var reg = new RegExp(value, "i");
      ret = items.filter(function(item, itemIndex) {
        // var itemValue = key ? SC.get(item, key) : item;
        var itemValue = key? searchCache[itemIndex]: item;
        return SC.typeOf(itemValue) === SC.T_STRING ? itemValue.search(reg) !== -1 : false;
      });
    }

    return ret;
  },

};
