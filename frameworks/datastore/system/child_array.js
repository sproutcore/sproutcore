// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2010 Evin Grano
// License:   Licened under MIT license (see license.js)
// ==========================================================================

/**
  @class

  A ChildArray is used to map an array of ChildRecord
  
  @extends SC.Enumerable
  @extends SC.Array
  @since SproutCore 1.0
*/

SC.ChildArray = SC.Object.extend(SC.Enumerable, SC.Array,
  /** @scope SC.ManyArray.prototype */ {
    
  /**
    If set, it is the default record recordType
  
    @property {SC.Record}
  */
  defaultRecordType: null,
  
  /**
    If set, the parent record will be notified whenever the array changes so that 
    it can change its own state
    
    @property {SC.Record}
  */
  record: null,
  
  /**
    If set will be used by the many array to get an editable version of the
    storeIds from the owner.
    
    @property {String}
  */
  propertyName: null,
  
  /**
    Actual references to the hashes
  */
  children: null,
  
  /**
    The store that owns this record array.  All record arrays must have a 
    store to function properly.

    @property {SC.Store}
  */
  store: function() {
    return this.get('record').get('store');
  }.property('record').cacheable(),
  
  /**
    The storeKey for the parent record of this many array.  Editing this 
    array will place the parent record into a READY_DIRTY state.

    @property {Number}
  */
  storeKey: function() {
    return this.get('record').get('storeKey');
  }.property('record').cacheable(),
  
  /**
    Returns the storeIds in read only mode.  Avoids modifying the record 
    unnecessarily.
    
    @property {SC.Array}
  */
  readOnlyChildren: function() {
    return this.get('record').readAttribute(this.get('propertyName'));
  }.property(),
  
  /**
    Returns an editable array of child hashes.  Marks the owner records as 
    modified. 
    
    @property {SC.Array}
  */
  editableChildren: function() {
    var store    = this.get('store'),
        storeKey = this.get('storeKey'),
        pname    = this.get('propertyName'),
        ret, hash;
        
    ret = store.readEditableProperty(storeKey, pname);    
    if (!ret) {
      hash = store.readEditableDataHash(storeKey);
      ret = hash[pname] = [];      
    }
    
    if (ret !== this._prevChildren) this.recordPropertyDidChange();
    return ret ;
  }.property(),
    
  // ..........................................................
  // ARRAY PRIMITIVES
  // 

  /** @private
    Returned length is a pass-through to the storeIds array.
    
    @property {Number}
  */
  length: function() {
    var children = this.get('readOnlyChildren');
    return children ? children.length : 0;
  }.property('readOnlyChildren'),

  /** @private
    Looks up the store id in the store ids array and materializes a
    records.
  */
  objectAt: function(idx) {
    var recs      = this._records, 
        children = this.get('readOnlyChildren'),
        hash, ret;
    var len = children ? children.length : 0;
    
    if (!children) return undefined; // nothing to do
    if (recs && (ret=recs[idx])) return ret ; // cached
    if (!recs) this._records = recs = [] ; // create cache
    
    // If not a good index return undefined
    if (idx >= len) return undefined;
    hash = children.objectAt(idx);
    if (!hash) return undefined;
    
    // not in cache, materialize
    recs[idx] = ret = this._materializeChild(hash);
    
    return ret;
  },

  /** @private
    Pass through to the underlying array.  The passed in objects must be
    records, which can be converted to storeIds.
  */
  replace: function(idx, amt, recs) {
    var children = this.get('editableChildren'), 
        len      = recs ? (recs.get ? recs.get('length') : recs.length) : 0,
        record   = this.get('record'),
        
        pname    = this.get('propertyName'),
        cr, recordType;  
    children.replace(idx, amt, recs);
    for(var i = idx; i <= idx+amt; i+=1){
      this.objectAt(i);
    }
    // notify that the record did change...
    record.recordDidChange(pname);
    
    return this;
  },
  
  /*
  calls normalize on each object in the array
  */
  normalize: function(){
    this.forEach(function(child,id){
      if(child.normalize) child.normalize();
    });
  },
  
  // ..........................................................
  // INTERNAL SUPPORT
  //  
  
  /** @private
    Call to create an object from a hash
  */
  _materializeChild: function(hash){
    var store = this.get('store'),
        parentRecord = this.get('record'), 
        recordType = this.get('defaultRecordType'),
        id, ret, storeKey, pm;
        
    // Find the record type
    if (!parentRecord) return undefined;
    var nspace = parentRecord.get('childRecordNamespace');
    // Get the record type.
    if (hash.type && !SC.none(nspace)) {
      recordType = nspace[hash.type];
    }

    if (!recordType || SC.typeOf(recordType) !== SC.T_CLASS) {
      throw 'ChildrenArray: Error during transform: Invalid record type.';
    }
    
    pm = recordType.prototype.primaryKey || 'childRecordKey';
    id = hash[pm];
    storeKey = store.storeKeyExists(recordType, id);
    if (storeKey){
      ret = store.materializeRecord(storeKey);
    } 
    else {
      ret = parentRecord.registerChildRecord(recordType, hash);
    }
    return ret;
  },

  /** @private 
    Invoked whenever the children array changes.  Observes changes.
  */
  recordPropertyDidChange: function(keys) {
    
    if (keys && !keys.contains(this.get('propertyName'))) return this;
    
    var children = this.get('readOnlyChildren');
    var prev = this._prevChildren, f = this._childrenContentDidChange;
    
    if (children === prev) return this; // nothing to do
    
    if (prev) prev.removeObserver('[]', this, f);
    this._prevChildren = children;
    if (children) children.addObserver('[]', this, f);
    
    var rev = (children) ? children.propertyRevision : -1 ;
    this._childrenContentDidChange(children, '[]', children, rev);
  },

  /** @private
    Invoked whenever the content of the children array changes.  This will
    dump any cached record lookup and then notify that the enumerable content
    has changed.
  */
  _childrenContentDidChange: function(target, key, value, rev) {
    this._records = null ; // clear cache
    this.enumerableContentDidChange();
  },
  
  /** @private */
  init: function() {
    sc_super();
    this.recordPropertyDidChange();
  }
  
}) ;