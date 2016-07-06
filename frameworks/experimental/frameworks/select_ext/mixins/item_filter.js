
SC.ItemFilter = {
  
  
  filterItems: function(value) {
    this._searchedValue = value;
    this.invokeOnceLater('doFilterItems', 250);
  },

  doFilterItems: function() {
    if (!this._initialItems) this._initialItems = this.get('items');

    var value = this._searchedValue,
      itemTitleKey = this.get('itemSearchKey') || this.get('itemTitleKey'),
      items = this.searchItems(this._initialItems, value, itemTitleKey);

    this.set('items', items);
  },
  
  searchItems: function(items, value, key) {
    if (value) {
      items = items.filter(function(item) {
        var itemValue = key ? SC.get(item, key) : item;
        return SC.typeOf(itemValue) === SC.T_STRING ? itemValue.search(new RegExp(value, "i")) !== -1 : false;
      });
    }

    return items;
  },

};


