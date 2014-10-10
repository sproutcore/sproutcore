// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2010 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

(function () {
  var oldExtend = SC.Record.extend;

  SC.mixin(SC.Record,
  /** @scope SC.Record */ {

    // ..........................................................
    // Properties
    //

    /**
      If YES, then searches for records of this type will return
      subclass instances. For example:

          Person = SC.Record.extend();
          Person.isPolymorphic = YES;

          Male = Person.extend();
          Female = Person.extend();

      Using SC.Store#find, or a toOne or toMany relationship on
      Person will then return records of type Male and Female.
      Polymorphic record types must have unique GUIDs for all
      subclasses.

      @type Boolean
      @default NO
    */
    isPolymorphic: NO,


    // ..........................................................
    // Propagation Support
    //

    /**
      Like the original SC.Record.storeKeysById, but all store keys are kept on the top-most polymorphic
      superclass. This ensures that store key by id requests at any level return only the one unique
      store key and uses less memory than having store key to id mappings on each polymorphic sub-class.

      @see SC.Record.storeKeysById
    */
    storeKeysById: function() {
      var superclass = this.superclass,
        key = SC.keyFor('storeKey', SC.guidFor(this)),
        ret = this[key];

      if (!ret) {
        if (this.isPolymorphic && superclass.isPolymorphic && superclass !== SC.Record) {
          ret = this[key] = superclass.storeKeysById();
        } else {
          ret = this[key] = {};
        }
      }

      return ret;
    },

    // ..........................................................
    // Internal Support
    //

    extend: function () {
      var ret = oldExtend.apply(this, arguments);

      if (ret.prototype.hasOwnProperty('isPolymorphic')) {
        ret.isPolymorphic = ret.prototype.isPolymorphic;
        delete ret.prototype.isPolymorphic;
      }

      return ret;
    },

    /** @private Updates the storeKey cache on the oldId with the newId. */
    _propagateNewId: function (oldId, newId) {
      var superclass = this.superclass;

      if (this.isPolymorphic && superclass.isPolymorphic && superclass !== SC.Record) {
        var storeKeys = superclass.storeKeysById(),
          storeKey = storeKeys[oldId];

        delete storeKeys[oldId];
        storeKeys[newId] = storeKey;

        superclass._propagateNewId(oldId, newId);
      }
    }

  });
})();


SC.Record.reopen({

  /**
    Because the storeKeys per id are stored on each class of the polymorphic
    record, whenever the id changes, we have to update the caches.
    */
  id: function (key, value) {
    if (value !== undefined) {
      var storeKey = this.get('storeKey'),
        oldId = SC.Store.idsByStoreKey[storeKey],
        recordType = this.get('store').recordTypeFor(storeKey);

      // Propagate the new id to all superclasses.
      recordType._propagateNewId(oldId, value);

      this.writeAttribute(this.get('primaryKey'), value);
      return value;
    } else {
      return SC.Store.idFor(this.storeKey);
    }
  }.property('storeKey').cacheable()

});
