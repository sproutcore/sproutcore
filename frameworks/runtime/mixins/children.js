// ==========================================================================
// Project:   SproutCore
// Copyright: @2013 Seapine Software, Inc. and contributors
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

SC.Children = {

  /**
    Adds a property as being owned by this object.
    The lifecycle of owned properties is completely managed by this object.
    When this object is destroyed, whatever object is set on the owned property will
    be destroyed, and the property will be set to null.
    If the owned property is set to a new value, the object previously set on that
    property will be automatically destroyed.

    @param {String} key property key to add
  */
  addChildProperty: function (key) {
    if (!this._childProperties) {
      this._childProperties = [];
    }

    // Make sure we don't duplicate the key.
    if (this._childProperties.indexOf(key) < 0) {
      this._childProperties.push(key);
    }
    // @if (debug)
    else {
      SC.warn('Developer Warning: Attempted to add a duplicate key %@ as a child property.', key);
    }
    // @endif
  },

  /**
    Removes a property as being owned by this object.
    The lifecycle of the property will no longer by managed by this object.

    @param {String} key property key to remove
  */
  removeChildProperty: function (key) {
    var idx;
    if (this._childProperties) {
      idx = this._childProperties.indexOf(key);
      if (idx >= 0) {
        this._childProperties.removeAt(idx);
      }
    }
  },

  /**
    Adds an object as being owned by this object.
    Owned objects will be automatically destroyed when this object is destroyed.

    @param {SC.Object} obj child object
  */
  addChildObject: function (obj) {
    if (!this._childObjects) {
      this._childObjects = [];
    }

    // Make sure we don't duplicate the object.
    if (this._childObjects.indexOf(obj) < 0) {
      this._childObjects.push(obj);
    }
    // @if (debug)
    else {
      SC.warn('Developer Warning: Attempted to add a duplicate object %@ as a child object.', obj);
    }
    // @endif
  },

  /**
    Removes an object as being owned by this object.
    The object will no longer be destroyed when this object is destroyed.

    @param {SC.Object} obj child object
  */
  removeChildObject: function (obj) {
    var idx;
    if (this._childObjects) {
      idx = this._childObjects.indexOf(obj);
      if (idx >= 0) {
        this._childObjects.removeAt(idx);
      }
    }
  },

  /**
    Initializes children.
    Each key listed in childProperties will be retrieved, instantiated
    (if it is a class), and set back to that key.

    @private
  */
  initChildren: function () {
    var childProperties,
        len,
        i,
        childProperty,
        child;

    if (this.childProperties) {
      childProperties = this._childProperties = this.childProperties.slice();
      len = childProperties.length;
      for (i = 0; i < len; ++i) {
        childProperty = childProperties[i];
        if (childProperty) {
          child = this.get(childProperty);
          if (child && child.isClass) {
            this.set(childProperty, child.create());
          }
        }
      }
    }
    this.childProperties = null;
  },

  /**
    Destroys children.
    Each key in childProperties will be retrieved, destroyed,
    and the key will be set to null.
    Additionally, each object in _childObjects will be destroyed.

    @private
  */
  destroyChildren: function () {
    var childProperties = this._childProperties,
        childObjects = this._childObjects,
        len,
        i,
        childKey,
        child;

    if (childProperties) {
      len = childProperties.length;
      for (i = 0; i < len; ++i) {
        childKey = childProperties[i];
        if (childKey) {
          child = this.get(childKey);
          if (child && child.isObject) {
            child.destroy();
          }
          this.set(childKey, null);
        }
      }
    }
    this._childProperties = null;

    if (childObjects) {
      len = childObjects.length;
      for (i = 0; i < len; ++i) {
        child = childObjects[i];
        if (child && child.isObject) {
          child.destroy();
        }
      }
    }
    this._childObjects = null;
  },

  /**
    If the given key is a child property, the current value at that key will be destroyed.
    If the key is not a child property, does nothing.

    @param {String} key possible child key
  */
  destroyChild: function (key) {
    var child = this[key];
    if (child && child.isObject) {
      if (this._childProperties && this._childProperties.indexOf(key) >= 0) {
        child.destroy();
      }
    }
  }
};
