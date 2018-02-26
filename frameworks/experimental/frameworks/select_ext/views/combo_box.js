
sc_require("mixins/item_filter");


SC.ComboBoxView = SC.View.extend(SC.ItemFilter, {

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

      this._menu = menu;
    }

    this.invokeLast(function() {
      menu.popup(layer);
    });
  }

});
