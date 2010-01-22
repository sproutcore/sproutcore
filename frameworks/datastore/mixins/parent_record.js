// ==========================================================================
// SC.ParentRecord
// ==========================================================================

/** @class

  provides individual binding points for css style attributes
  on a view
  @author Evin Grano
  @version Sproutcore 1.0
  @since Sproutcore 1.0
*/

SC.ParentRecord = { /* Parent Record Mixin */
    
  /* is a Parent Record */  
  isParentRecord: YES,
  
  /**
   * The child record cache.
   */
  childRecords: null,
  
  /**
   * The namespace which to retrieve the childRecord Types from
   */
  childRecordNamespace: null,
  
  /**
   * The next child key to allocate.  A nextChildKey must always be greater than 0.
   */
  _nextChildKey: 0,
    
  /**
   * Registers a child record with this parent record.
   *
   * If the parent already knows about the child record, return the cached instance.  If not,
   * create the child record instance and add it to the child record cache.
   *
   * @param {CoreOrion.ChildRecord} recordType The type of the child record to register.
   * @param {Hash} hash The hash of attributes to apply to the child record.
   */
  registerChildRecord: function(recordType, hash) {
    var childKey = hash.childRecordKey;
    var childRecord = null;
    var crManager = this.get('childRecords');
    if (childKey && crManager) {
      childRecord = crManager[childKey];
    }

    if (SC.none(childRecord)) childRecord = this.createChildRecord(recordType, hash);
 
    return childRecord;
  },

  /**
   * Creates a new child record instance.
   *
   * @param {CoreOrion.ChildRecord} recordType The type of the child record to create.
   * @param {Hash} hash The hash of attributes to apply to the child record. (may be null)
   */
  createChildRecord: function(childRecordType, hash) {
    //console.log('SC.Parent: Calling createChildRecord()...');
    SC.RunLoop.begin();
    // Generate the key used by the parent's child record manager.
    var key = this._generateChildKey();
    hash = hash || {}; // init if needed
    hash.childRecordKey = key;
    
    var store = this.get('store');
    if (SC.none(store)) throw 'Error: during the creation of a child record: NO STORE ON PARENT!';
    
    var cr = store.createRecord(childRecordType, hash);
    cr._parentRecord = this;
    
    // ID processing if necessary
    if(this.generateIdForChild) this.generateIdForChild(cr);
    
    // Add the child record to the hash.
    var crManager = this.get('childRecords');
    if (SC.none(crManager)) {
      //console.log('Creating Child Record Manager for (%@)'.fmt(SC.guidFor(this)));
      crManager = SC.Object.create();
      this.set('childRecords', crManager);
    }
    
    crManager[key] = cr;
    SC.RunLoop.end();
    
    return cr;
  },
  
  /**
   * Override this function if you want to have a special way of creating 
   * ids for your child records
   */
  generateIdForChild: function(childRecord){},
    
  // ..........................................................
  // Redone Record Attributes
  // 
  normalize: function(includeNull) {
    
    var primaryKey = this.primaryKey, 
        recordId   = this.get('id'), 
        store      = this.get('store'), 
        storeKey   = this.get('storeKey'), 
        recHash, attrValue, normChild,  isRecord, isChild, defaultVal;
      
    var dataHash = store.readEditableDataHash(storeKey) || {};
    dataHash[primaryKey] = recordId;
    
    for(var key in this) {
      // make sure property is a record attribute.
      if(this[key] && this[key].typeClass) {
        
        isRecord = SC.typeOf(this[key].typeClass())==='class';
        isChild = this[key].isChildRecordTransform;
        if (!isRecord && !isChild) {
          // FIXME: [EG] Looks crappy and shouldn't be this look at fixing 
          attrValue = this.get(key);
          this.set(key, attrValue);
          attrValue = this.readAttribute(key);
          // END
                    
          if(attrValue!==undefined || (attrValue===null && includeNull)) {
            dataHash[key] = attrValue;
          }
        }
        else if (isChild){
          attrValue = this.get(key);
          normChild = attrValue.normalize();
          //dataHash[key] = normChild.get('attributes');
        }
        else if(isRecord) {
          recHash = store.readDataHash(storeKey);

          if(recHash[key]!==undefined) {
            // write value already there
            dataHash[key] = recHash[key];

          // or write default
          } else {
            defaultVal = this[key].get('defaultValue');

            // computed default value
            if (SC.typeOf(defaultVal)===SC.T_FUNCTION) {
              dataHash[key] = defaultVal();
            
            // plain value
            } else {
              dataHash[key] = defaultVal;
            }
          }
        }
      }
    }
  
    return store.materializeRecord(storeKey);
  },
  
  // ..........................................................
  // PRIVATE METHODS
  // 
  
  _generateChildKey: function() {
    var newIdx = SC.ParentRecord._nextChildKey + 1;
    SC.ParentRecord._nextChildKey = newIdx;
    return newIdx; 
  }
};
