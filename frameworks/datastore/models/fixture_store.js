// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple, Inc. All rights reserved.
// License:   Licened under MIT license (see license.js)
// ==========================================================================

sc_require('models/persistent_store') ;

/**
  @class

  A persistent store than can automatically load fixture data you define in 
  your fixtures directory.  When you setup your fixture server just set the
  "fixtures" property to a array of namespace names that you want the store
  to search for fixture data.

  @extends SC.PersistentStore
  @since SproutCore 1.0
*/

SC.FixtureStore = SC.PersistentStore.extend(
  /** @scope SC.FixtureStore.prototype */ {
   
  /** 
    Array of namespaces to search for fixtures when the store is first
    created.
  */
  namespaces: null,

  /**
    The fixture data.  This data will be culled from the namespaces defined 
    in the fixtures property.  The returns structure is a hash with 
    record class guids as keys and an array of data hashes as the values.
  */
  data: function() {
    var ret = {}, namespaces = this.get('namespaces'), nloc;
    var namespace, cur, idx, len, data, recordType; 
    
    nloc = namespaces ? namespaces.length : 0 ;
    while(--nloc >= 0) {
      namespace = SC.objectForPropertyPath(namespaces[nloc]);
      cur = namespace ? namespace.FIXTURES : null ;
      if (!cur) continue; // Nothing to do
      
      // if cur is an array, then we need to loop through the array mapping 
      // the type attribute to a record class name.
      if (SC.typeOf(cur) === SC.T_ARRAY) {
        len = cur.length ;
        for(idx=0;idx<len;idx++) {
          data = cur[idx] ;
          if (recordType = this.recordTypeForType(data.type, namespaces)) {
            var guid = SC.guidFor(recordType), recs = ret[guid] ;
            if (!recs) recs = (ret[guid] = []);
            recs.push(data);
            
          } else {
            console.warn("Fixture record could not be mapped to type: %@".fmt(SC.inspect(data))) ;
          }
        }
      }
    }
    
    return ret ;
  }.property('fixtures').cacheable(),
  
  /** 
    Helper method detects the record type for a data type by looking it up
    in the passed namespaces.
  */
  recordTypeForType: function(type, namespaces) {
    if (!type) return null ;
    var len = namespaces.length, idx, ret ;
    for(idx=0;idx<len;idx++) {
      ret = SC.objectForPropertyPath("%@.%@".fmt(namespaces[idx], type));
      if (ret) return ret ;      
    }
    return null ;
  },
  
  /** @private 
    canFetch if fetchKey is an SC.Record that we have data for
  */
  canFetch: function(recordType) {
    return !!this.get('data')[SC.guidFor(recordType)] ;
  },

  /**
    Helper method retrieves the data array for the passed fetchArray.  If 
    the fetchArray does not map to data stored in the fixtures, returns null.
  */
  fixtureDataFor: function(fetchArray) {
    var recordType = fetchArray.get('fetchKey') ;
    return this.get('data')[SC.guidFor(recordType)];
  },
  
  /** @private - record array support.  
    The computed length is the size of the matching data.
  */
  sparseArrayDidRequestLength: function(fetchArray) {
    var data = this.fixtureDataFor(fetchArray);
    var len = data ? data.length : 0 ;
    fetchArray.provideLength(len) ;
  },
  
  /** @private - record array support.
    Populate the range by loading the data from the fixtures.
  */
  sparseArrayDidRequestRange: function(fetchArray) {
    var recordType = fetchArray.fetchKey ;
    var data = this.fixtureDataFor(fetchArray);
    if (data) {
      var range = { start: 0, length: data };
      fetchArray.loadRecordsInRange(range, data, recordType);
    }
  }
   
});
