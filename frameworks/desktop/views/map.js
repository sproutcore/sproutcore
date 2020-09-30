
SC.MapView = SC.CollectionView.extend({

  reloadIfNeeded: function () {
    var content = this.get('content'),
      invalid = this._invalidIndexes;

    if (!content || !invalid || !this.get('isVisibleInWindow')) return this; // delay
    this._invalidIndexes = NO;

    var itemViews = SC.A(this._sc_itemViews) || [],
      object, itemView,
      ret = [], exist;

    this._sc_lastItemViews = itemViews;
    this._sc_itemViews = ret;

    for (var idx = 0, len = content.get('length');  idx < len; idx++) {
      object = content.objectAt(idx);
      itemView = itemViews[idx];

      if (!itemView || itemView.get('content') !== object) {
        itemView = itemViews.find(function(i) {
          return i && i.get('content') === object;
        });

        if (!itemView) {
          itemView = this.createItemViewForContentIndex(idx);
        }
        // update index
        else {
          this._reconfigureItemView(itemView, idx);
        }
      }

      // @if (debug)
      if (!itemView) throw new Error('itemView must be defined');
      // @endif

      ret[idx] = itemView;
    }

    // We delete the which does not exist anymore
    for (var idx = 0, len = itemViews.length;  idx < len; idx++) {
      itemView = itemViews[idx];
      if (itemView) {
        object = itemView.get('content');

        exist = ret.find(function(i) {
          return i.get('content') === object;
        });

        if (!exist) {
          itemView.destroy();
        }
        else if (itemView.get('layerId').indexOf('tmp') === 0) {
          this._reconfigureItemView(itemView, itemView.get('contentIndex'));
        }
      }
    }

    this.updateItemsViews(ret);

    return this;
  },

  updateItemsViews: function (itemViews) {
    itemViews.forEach(function(itemView) {
      itemView.displayDidChange();
    });
  },

  createItemViewForContentIndex: function (idx) {
    var lastItemViews = this._sc_lastItemViews,
      attrs = this._attrsForContentIndex(idx),
      exampleView = this.get('exampleView');

    if (lastItemViews) {
      var existingItemView = lastItemViews[idx];
      if (existingItemView) existingItemView.set('layerId', 'tmp'+Math.random());
    }

    var ret = this.createItemView(exampleView, idx, attrs);
    this.insertBefore(ret, null);

    return ret;
  },

  _reconfigureItemView: function (itemView, idx) {
    itemView.beginPropertyChanges();
    itemView.set('contentIndex', idx);
    itemView.set('layerId', this.layerIdFor(idx));
    itemView.endPropertyChanges();
  },

});