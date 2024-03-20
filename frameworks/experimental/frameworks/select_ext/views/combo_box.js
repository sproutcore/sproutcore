
sc_require("mixins/item_filter");


SC.ComboBoxView = SC.View.extend(SC.ItemFilter, {

  /**
    The value of the selected item

    @property
    @default null
  */
  value: null,

  /**
    The array of items to populate the menu. This can be a simple array of strings,
    objects or hashes. If you pass objects or hashes, you can also set the
    various itemKey properties to tell the menu how to extract the information
    it needs.

    @type Array
    @default []
  */
  items: null,

  /**
    Binding default for an array of items

    @property
    @default SC.Binding.multiple()
  */
  itemsBindingDefault: SC.Binding.multiple(),

  /**
    They key in the items which maps to the title.
    This only applies for items that are hashes or SC.Objects.

    @property
    @type {String}
    @default "title"
  */
  itemTitleKey: "title",

  /**
    They key in the items which maps to the value.
    This only applies for items that are hashes or SC.Objects.

     @property
     @type {String}
     @default null
  */
  itemValueKey: null,

  /**
     Key used to extract icons from the items array.

     @property
     @type {String}
     @default null
  */
  itemIconKey: null,

  /**
    Key to use to identify separators.

    Items that have this property set to YES will be drawn as separators.

    @property
    @type {String}
    @default "isSeparator"
  */
  itemSeparatorKey: "isSeparator",

  /**
    Key used to indicate if the item is to be enabled.

    @property
    @type {String}
    @default "isEnabled"
  */
  itemIsEnabledKey: "isEnabled",

  /**
    If true, titles will be escaped to avoid scripting attacks.

    @type Boolean
    @default YES
  */
  escapeHTML: YES,

  /**
   The text field view to use.

   @property
   @type {SC.TextFieldView}
   @default SC.TextFieldView
  */
  textFieldView: SC.TextFieldView,

  /**
    * @private
  */
  selectedMenuItem: null,

  /**
    * @private
  */
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

      /** @private */
      moveDown: function(sender, evt) {
        var menu = that._menu;
        if (menu) return menu._listView.moveDown(sender, evt);
        return true;
      },

      /** @private */
      moveUp: function(sender, evt) {
        var menu = that._menu;
        if (menu) return menu._listView.moveUp(sender, evt);
        return true;
      },

      /** @private */
      insertNewline: function(evt) {
        var menu = that._menu;
        if (menu) return menu._listView.performAction(evt);
        return true;
      },

    });

    this.set('textFieldView', view);
    this.set('childViews', [view]);
  },

  /**
    * @private
  */
  didSelectItemDelegate: function() {
    var item = this.get('selectedMenuItem'),
      value = SC.get(item, this.get('itemValueKey'));

    this._lastValue = value;
    this.set('value', value);
  }.observes('selectedMenuItem'),

  /**
    * @private
  */
  popupMenu: function() {
    var layer = this.get('layer'),
      menu = this._menu;

    if (!menu) {
      var menu = SC.AutoResizingMenuPane.create({
        preferMatrix: [1, 1, SC.POSITION_BOTTOM],
        selectView: this,
        acceptsMenuPane: false,
        escapeHTML: this.get('escapeHTML'),
        itemsBinding: SC.Binding.from('items', this).oneWay(),

        action: function(rootMenu) {
          var selectedItem = rootMenu.get('selectedItem');
          rootMenu.selectView.set('selectedMenuItem', selectedItem);
        }
      });

      this._menu = menu;
    }

    this.invokeLast(function() {
      menu.popup(layer);
    });
  }

});
