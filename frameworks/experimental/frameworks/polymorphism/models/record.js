// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2010 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

SC.mixin(SC.Record,
/** @scope SC.Record */{

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

    @property {Boolean}
    @default NO
  */
  isPolymorphic: NO,


  // ..........................................................
  // Propagation Support
  // 

  /**
    Like the original SC.Record.storeKeyFor,
    but when a storeKey is generated, it will
    propagate it to superclasses.
    
    @see SC.Record.storeKeyFor
  */
  storeKeyFor: function(id) {
    var storeKeys = this.storeKeysById(),
        ret = storeKeys[id];
    
    if (!ret) {
      ret = SC.Store.generateStoreKey();
      SC.Store.idsByStoreKey[ret] = id;
      SC.Store.recordTypesByStoreKey[ret] = this;
      storeKeys[id] = ret;
      this._propagateIdForStoreKey(id, ret);
    }
    
    return ret ;
  },


  // ..........................................................
  // Internal Support
  // 

  /** @private */
  _propagateIdForStoreKey: function(id, storeKey) {
    var superclass = this.superclass;
    if (this.isPolymorphic) {
      while (superclass.isPolymorphic && superclass !== SC.Record) {
        superclass._storeKeyForId(storeKey, id);
        superclass = superclass.superclass;
      }
    }
  },

  /** @private */
  _storeKeyForId: function(storeKey, id) {
    var storeKeys;
    if (!this.isPolymorphic) return;

    /*
      TODO [CC] SC.Store.recordTypesByStoreKey will be broken
    */

    storeKeys = this.storeKeysById();
    if (storeKeys[id]) {
      throw "A store key (%@) already existing for %@ on %@".fmt(storeKey, id, this);
    }

    storeKeys[id] = storeKey;
  }

});