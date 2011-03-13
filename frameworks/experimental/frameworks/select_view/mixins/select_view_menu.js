// Copyright: ©2006-2010 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2010 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/**
 * Binds a menu view to an owning SC.SelectView.
 *
 * @mixin
 *
 */
SC.SelectViewMenu = {
  selectView: null,

  _svm_bindToProperties: [
    'items',
    'itemTitleKey', 'itemIsEnabledKey', 'itemValueKey', 'itemIconKey', 
    'itemHeightKey', 'itemSubMenuKey', 'itemSeparatorKey', 'itemTargetKey',
    'itemActionKey', 'itemCheckboxKey', 'itemShortCutKey',
    'itemKeyEquivalentKey', 'itemDisableMenuFlashKey', 
    
    'preferType', 'preferMatrix'
  ],

  _svm_setupBindings: function() {
    var bindTo = this.get('selectView');
    if (!bindTo) {
      return;
    }

    var props = this._svm_bindToProperties, idx, len = props.length, key;

    for (idx = 0; idx < len; idx++) {
      key = props[idx];
      this[key + 'Binding'] = this.bind(key, bindTo, key);
    }

    this._svm_isBoundTo = bindTo;
  },

  _svm_clearBindings: function() {
    var boundTo = this._svm_isBoundTo;
    if (!boundTo) {
      return;
    }

    var props = this._svm_bindToProperties, idx, len = props.length, key;

    for (idx = 0; idx < len; idx++) {
      key = props[idx];
      this[key + 'Binding'].disconnect();
    }
  },

  _svm_selectViewDidChange: function() {
    this._svm_clearBindings();
    this._svm_setupBindings();
  }.observes('selectView'),

  initMixin: function() {
    this._svm_setupBindings();
  },

  destroyMixin: function() {
    this._svm_clearBindings();
  }
};


