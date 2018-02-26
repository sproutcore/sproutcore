
SC.ItemFilter = {

  filterItems: function(value) {
    this._searchValue = value;
    this.invokeOnceLater('doFilterItems', 250);
  },

  doFilterItems: function() {
    if (!this._initialItems) this._initialItems = this.get('items');

    var value = this._searchValue,
      itemTitleKey = this.get('itemSearchKey') || this.get('itemTitleKey') || 'title',
      items = this.searchItems(this._initialItems, value, itemTitleKey);

    this.set('items', items);
  },

  searchItems: function(items, value, key) {
    var regexp, ret;

    if (value) {
      regexp = new RegExp(value, "i");
      ret = items.filter(function(item) {
        var itemValue = key ? SC.get(item, key) : item;
        return SC.typeOf(itemValue) === SC.T_STRING ? itemValue.search(regexp) !== -1 : false;
      });
    }

    return ret;
  },

};
