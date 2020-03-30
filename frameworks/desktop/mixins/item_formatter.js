// ==========================================================================
// Project:   Sproutcore
// Copyright: ©2013 GestiXi and contributors.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

SC.ItemFormatter = {

  formatItems: function (items, emptyName) {
    var len,
      titleKey = this.get('itemTitleKey'),
      valueKey = this.get('itemValueKey'),
      isEnabledKey = this.get('itemIsEnabledKey'),
      itemSeparatorKey = this.get('itemSeparatorKey'),
      ret = [], idx, item, itemName, itemType, isLocal;

    if (!items) return [];

    this.destroyFormattedItems();

    if (emptyName) {
      if (len) {
        var item = SC.Object.create();
        item[itemSeparatorKey] = true;
        ret.unshift(item);
      }

      var item = SC.Object.create({ isEmptyName: true });
      item[titleKey] = emptyName;
      ret.unshift(item);
    }

    len = items.get('length');

    // Loop through the items property and transmute as needed, then
    // copy the new objects into the ret array.
    for (idx = 0; idx < len; idx++) {
      item = items.objectAt(idx);
      if (!item) continue;

      isLocal = false;
      itemType = SC.typeOf(item);
      if (itemType === SC.T_STRING) {
        if (!valueKey) {
          this.set('itemValueKey', valueKey = 'value');
        }

        itemName = item;
        item = SC.Object.create();
        item[titleKey] = itemName;
        item[valueKey] = itemName;
        isLocal = true;
      } else if (itemType === SC.T_HASH) {
        // Do not display the first separator only if it don't have a title
        if (!ret.length && SC.get(item, itemSeparatorKey) && !SC.get(item, titleKey)) continue;

        item = SC.Object.create(item);
        isLocal = true;
      }

      if (isLocal) item._isLocal = isLocal;
      if (item[itemSeparatorKey]) item[isEnabledKey] = false;

      ret.push(item);
    }

    this._lastDisplayItems = ret;

    return ret;
  },

  destroyFormattedItems: function () {
    var items = this._lastDisplayItems;

    if (items) items.forEach(function(item) {
      if (item._isLocal) item.destroy();
    }, this);

    this._lastDisplayItems = null;
  },

};
