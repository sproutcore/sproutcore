// an attempt to 'replicate' http://harvesthq.github.io/chosen/ in SC
//
// The current approach is to try to marry collection view and the new select view / popupbutton view
// What is displayed is the selected pieces, and giving the view focus (by clicking for example) will
// open the popup.
//


sc_require('views/collection');

SC.MultiSelectView = SC.CollectionView.extend({

  classNames: ['sc-multi-select-view'],

  selectOnMouseDown: NO,

  /**
   * What to to display when empty
   * @type {String}
   */
  emptyName: null,

  init: function () {
    sc_super();

    this._currentPopup = null;
    this.invokeOnce('schedulePopupSetupIfNeeded');
    this._showOrHideEmptyName();
  },

  _showOrHideEmptyName: function () {
    // this should show the message from emptyName
  }.observes('emptyName', 'selection'),

  // renderDelegateName: 'multiSelectViewRenderDelegate',
  //
  exampleView: SC.View.extend({
    useStaticLayout: true,
    classNames: ['sc-multi-select-item-view'],
    displayProperties: ['isSelected'],
    contentIndex: null,
    escapeHTML: true,

    /** @private
      Determines if the event occurred inside an element with the specified
      classname or not.
    */
    _isInsideElementWithClassName: function (className, evt) {
      var layer = this.get('layer');
      if (!layer) return NO; // no layer yet -- nothing to do

      var el = SC.$(evt.target);
      var ret = NO;
      while (!ret && el.length > 0 && (el[0] !== layer)) {
        if (el.hasClass(className)) ret = YES;
        el = el.parent();
      }
      el = layer = null; //avoid memory leaks
      return ret;
    },

    mouseDown: function (evt) {
      // Fast path, reject secondary clicks.
      if (evt.which && evt.which !== 1) return false;

      // if content is not editable, then always let collection view handle the
      // event.
      if (this._isInsideElementWithClassName('fa-remove', evt)) {
        this._isMouseDownOnRemove = YES;
        return YES;
      }

      return NO; // let the collection view handle this event
    },

    mouseUp: function (evt) {
      if (this._isMouseDownOnRemove) {
        if (this._isInsideElementWithClassName('fa-remove', evt)) {
          // remove the item from selection
          var del = this.displayDelegate;
          del.deselect(this.get('contentIndex'));
          return YES;
        }
        this._isMouseDownOnRemove = NO;
      }
      return NO;
    },

    render: function (context, firstTime) {
      // only render something when selected
      var ckv = this.get('contentValueKey') || 'title';
      var del = this.displayDelegate;
      // console.log('render in exampleView: displayDelegate ', del);
      // window.DDEL = del;
      var labelKey = this.getDelegateProperty('contentValueKey', del);
      // console.log('labelKey: ', labelKey);
      var content = this.get('content');
      var value = (labelKey && content) ? (content.get ? content.get(labelKey) : content[labelKey]) : content;
      if (this.get('escapeHTML')) value = SC.RenderContext.escapeHTML(value);
      // also measure (somehow) the width
      if (this.get('isSelected') && value) {
        context.addClass('selected');
        context.push(value);
        context.push('<i class="fa fa-remove"></i>');
      }
      else {
        context.removeClass('selected');
        context.push("");
      }
    }
  }),

  _computedLayoutsForSelection: function () {
    console.log('recalculation _computedLayoutsForSelection');
    var sel = this.get('selection');
    var frame = this.get('frame');
    var content = this.get('content');
    var maxW = frame.width;
    var height = frame.height;
    if (!sel) return null;
    if (!content) return null;
    var ckv = this.get('contentValueKey');
    var left = 0;
    var top = 0;
    return sel.map(function (v) {
      var value = SC.get(content.objectAt(v), ckv);
      var width = SC.metricsForString(value, 'div', ['fa-remove', 'sc-multi-select-item-view']).width * 2;
      var ret = {
        left: left,
        top: top,
        width: width
      };
      left += width;
      if (left > maxW) {
        left = 0;
        top += frame.height; // mmm?
      }
    });
  }.property('selection').cacheable(),

  /** @private */

  // perhaps something completely different should be done here, ie
  // a precalculation of the selected items, which this layoutForContentIndex
  // just has to look up. Reason is that otherwise it should constantly look up the others
  layoutForContentIndex: function (contentIndex) {
    // var rowHeight = this.get('rowHeight') || 32,
    //     frameWidth = this.get('frame').width,
    //     itemsPerRow = this.get('itemsPerRow') || 4,
    //     columnWidth = Math.floor(frameWidth / itemsPerRow),
    //     row = Math.floor(contentIndex / itemsPerRow),
    //     col = contentIndex - (itemsPerRow * row);

    // var content = this.get('content');
    // var sel = this.get('selection');
    // var width = 0;
    // // do something with the index in the selection to get the positioning done...

    // if (content && content.objectAt) {
    //   var item = content.objectAt(contentIndex);
    //   var labelKey = this.get('contentValueKey');
    //   var value = SC.get(item, labelKey);
    //   width = SC.metricsForString(value, 'div', ['fa-remove', 'sc-multi-select-item-view']).width * 2;
    // }



    var selectedIndexes = this.get('selectedIndexes');
    if (!selectedIndexes) return {};

    console.log('selected Indexes: ', selectedIndexes, 'this index: ', contentIndex);

    var selectionIndex = selectedIndexes.indexOf(contentIndex);
    if (selectionIndex === -1) return {};

    // If the frame is not ready, then just return an empty layout.
    // Otherwise, NaN will be entered into layout values.
    // if (frameWidth === 0 || itemsPerRow === 0) {
      // return {};
    // }


    var layout = this.get('_computedLayoutsForSelection')[selectionIndex];
    return layout;
    // return {
    //   left: 'auto',
    //   top: 0,
    //   // height: rowHeight,
    //   width: width
    // };
  },

  computeLayout: function () {
    sc_super();
    // should calculate the layout of the view.
  },

  acceptsFirstResponder: true,

  popup: SC.AutoResizingMenuPane.extend({
    exampleView: SC.AutoResizingMenuItemView.extend({
      isEnabled: function () {
        if (window.isEnabledCount === undefined) window.isEnabledCount = 0;
        console.log('isEnabled is being looked up', window.isEnabledCount);
        // debugger;
        window.isEnabledCount += 1;
        // look up whether the current item is selected
        var sel = this.getPath('parentMenu.rootMenu.multiSelectView.selection');
        return !(sel && sel.contains(this.getPath('content.item')));
      }.property('parentMenu.rootMenu.multiSelectView.selection'),

      render: function (context, firstTime) {
        sc_super();
        if (this.get('isEnabled')) {
          context.removeClass('disabled');
        }
        else context.addClass('disabled');
      }
    })

  }),

  shouldLoadInBackground: YES,

  schedulePopupSetupIfNeeded: function () {
    var popup = this.get('popup');
    if (popup && popup.isClass && this.get('shouldLoadInBackground')) {
      SC.backgroundTaskQueue.push(SC.MultiSelectView.InstantiatePopupTask.create({ multiSelectView: this }));
    }
  },

  setupPopup: function () {
    var popup = this.get('popup');
    if (popup === this._currentPopup) return;
    if (this._currentPopup) {
      this.isActiveBinding.disconnect();
      this.allItemsBinding.disconnect();
      this._contentItemKeyBinding.disconnect();
      this._currentPopup.destroy();
      this._currentPopup = null;
    }

    if (popup && popup.isClass) {
      popup = this.createPopup(popup);
      window.POPUP = popup;
    }
    var me = this;
    this._currentPopup = popup;
    this.set('popup', popup);
    popup.set('minimumMenuWidth', this.get('frame').width);
    popup.set('width', this.get('frame').width);
    this.isActiveBinding = this.bind('isActive', popup, 'isVisibleInWindow');
    this.allItemsBinding = this.bind('allItems', popup, 'items');
    this._selectedValueBinding = this.bind('_selectedValue', popup, 'selectedItem');
  },

  _selectedValueDidChange: function () {
    var val = this.getPath('_selectedValue.value');
    if (val === undefined) return;

    this.select(val, true); // always extend selection

    if (this.popup) {
      this.popup.notifyPropertyChange('displayItems');
    }
  }.observes('_selectedValue'),

  allItems: function () {
    var titleKey = this.get('contentValueKey');
    var ret = this.get('content').map(function (item, index) {
      return SC.Object.create({
        title: SC.get(item, titleKey),
        value: index,
        item: item
      });
    });
    return ret;
  }.property('length').cacheable(),

  _updateAllItems: function () {
    this.setupPopup();
  }.observes('length'),

  createPopup: function (popup) {
    return popup.create({
      multiSelectView: this
    });
  },

  showPopup: function () {
    this.setupPopup();

    this.invokeLast('_showPopup');
  },

  hidePopup: function () {
    var popup = this.get('popup');
    if (popup && !popup.isClass) {
      popup.remove();
    }
  },

  popupLeftOffset: SC.propertyFromRenderDelegate('menuLeftOffset', 0),
  popupTopOffset: SC.propertyFromRenderDelegate('menuTopOffset', 0),

  /**
    The prefer matrix for menu positioning. It is calculated so that the selected
    menu item is positioned directly below the MultiSelectView.
    @property
    @type Array
    @private
  */
  popupPreferMatrix: function() {
    var popup = this.get('popup'),
        frame = this.get('frame'),
        height = frame.height,
        leftPosition = this.get('popupLeftOffset'),
        topPosition = this.get('popupTopOffset');

    if (!popup) {
      return [leftPosition, topPosition, 0];
    }

    var idx = this.get('_selectedItemIndex'), itemViews = popup.get('menuItemViews');
    if (idx > -1) {
      var layout = itemViews[idx].get('layout');
      return [leftPosition, topPosition - layout.top + (layout.height/2), 0];
    }

    return [leftPosition, topPosition + height, 2];

  }.property('value', 'menu').cacheable(),

  _showPopup: function () {
    var popup = this.get('popup');
    popup.popup(this, this.get('popupPreferMatrix'));
  },


  //when mouseDown is over an empty area in the view, ie not one of the already selected
  // options, it should show the popup.
  mouseDown: function (evt) {
    if (!this.get('isEnabled')) return false;
    // sc_super();
    // if (!this.get('isEnabled')) return YES;
    // this._mouseDown = true;
    // // decide whether it needs popups
    // debugger;
    this.showPopup();
    this.becomeFirstResponder();
    return YES;
  },

  mouseUp: function (evt) {
    return YES;
  },

  _popupIsLoaded: NO,

  isActive: NO,


});

SC.MultiSelectView.InstantiatePopupTask = SC.Task.extend({
  multiSelectView: null,

  run: function (queue) {
    this.multiSelectView.setupPopup();
  }
});


