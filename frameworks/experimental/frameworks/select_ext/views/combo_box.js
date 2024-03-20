
sc_require("mixins/item_filter");


SC.ComboBoxView = SC.View.extend(SC.ItemFilter, {

  /**
   * Items to use as search items
   * @type {[type]}
   */
  items: null,

  /**
   * What property of the item should be used as title
   * @type {String}
   */
  itemTitleKey: 'title',

  /**
   * The value of the selected item
   */
  value: null,

  selectedMenuItem: null,

  textFieldView: SC.TextFieldView,

  createChildViews: function() {
    var that = this,
      view;

    view = that.createChildView(this.get('textFieldView'), {
      isEnabledBinding: SC.Binding.from('isEnabled', this).oneWay(),
      valueBinding: SC.Binding.from('value', this),
      hintBinding: SC.Binding.from('hint', this).oneWay(),
      isTextArea: this.get('isTextArea'),
      maxLength: 5096,

      valueDidChange: function() {
        if (that._menu) {
          that._menu.remove();
        }

        var value = this.get('value');

        if (value !== that._lastValue) {
          that._lastValue = value;
          that.filterItems(value);
        }
      }.observes('value'),
    });

    this.set('textFieldView', view);
    this.set('childViews', [view]);
  },


  didSelectItemDelegate: function() {
    var item = this.get('selectedMenuItem'),
      value = SC.get(item, this.get('itemValueKey'));

    this._lastValue = value;
    this.set('value', value);
  }.observes('selectedMenuItem'),




  popupMenu: function() {
    var that = this,
      layer = this.get('layer'),
      menu = this._menu;

    if (!menu) {
      var menu = SC.AutoResizingMenuPane.create({
        preferMatrix: [1, 1, SC.POSITION_BOTTOM],

        acceptsKeyPane: false,

        itemsBinding: SC.Binding.from('items', that).oneWay(),

        action: function(rootMenu) {
          var selectedItem = rootMenu.get('selectedItem');
          that.set('selectedMenuItem', selectedItem);
        },

      });

      menu.menuItemKeys.forEach(function(menuItemKey) {
        var itemKey = that.get(menuItemKey);
        if (itemKey) menu.set(menuItemKey, itemKey);
      });

      this._menu = menu;
    }

    this.invokeLast(function() {
      menu.popup(layer);
    });
  },


});

