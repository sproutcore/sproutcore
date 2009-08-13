// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple Inc. All rights reserved.
// License:   Licened under MIT license (see license.js)
// ==========================================================================

sc_require('core') ;
sc_require('models/record');

/**
  @class

  A fetch object describes a particular fetch request you might make to a 
  server to retrieve data.  For example, you might construct a fetch object to
  get all "contacts" or "messages" for a mail application.
  
  You will usually only create a Fetch object when you need to retrieve 
  ordered data from a server or local storage through your data source.  If 
  the data you need to retrieve is stored entirely in memory, then you can
  use SC.Query instead, which is a subclass of SC.Fetch.
  
  h2. Examples
  
  Most of the time you create a Fetch object to pass to SC.Store#findAll(). 
  For example, you might construct the following fetch object to retrieve a 
  list of groups for an AddressBook application:
  
  {{{
    var f = SC.Fetch.build('contacts');
    var contacts = AddressBook.store.find(f);
  }}}
  
  Fetch objects really can't do anything on their own.  They are really just 
  intended to carry search conditions to your DataSource.  For the above code
  to work, you would need to implement your DataSource#fetch() method to 
  deal with this request.  Here is how you might implement it:
  
  {{{
    in data_source.js:
    
    fetch: function(store, fetch) {

      // if fetch is remote, it means we need to provide the store keys.  
      if (fetch.get('isRemote')) {
        var url = fetch.get('conditions');
        fetch.dataSourceDidBegin();
        SC.Request.getUrl(url).set('isJSON', YES)
          .notify(this, 'fetchDidComplete', { store: store, fetch: fetch });
        
      // if fetch is local, it means it will be handled by the store.  we just
      // need to load data if needed.
      } else  {
        // handle queries here.
      }
    },

    // called when the server returns.  populate your fetch results here.
    fetchDidComplete: function(request, p) {
      var storeKeys = p.store.loadRecords(request.get('response'));
      p.fetch.set('results', storeKeys).dataSourceDidComplete();
    }
  }}}
  

  @extends SC.Object
  @since SproutCore 1.0
*/

SC.Fetch = SC.Object.extend(SC.Copyable, {
  
  // ..........................................................
  // PROPERTIES
  // 
  
  /**
    Unparsed query conditions.  Usually you will set this property to some 
    value that your data source looks at to decide what to load.
    
    @type {String}
  */
  conditions:  null,
  
  
  /**
    The current load status for the query.  This status is changed by the 
    data source to indicate when it is busy loading the query contents.  The
    value will be one of SC.Record.READY, SC.Record.BUSY_LOADING, 
    SC.Record.BUSY_REFRESH, or SC.Record.ERROR
    
    Normally you do not need to change this property yourself.  Instead you
    just called one of the dataSource methods on the fetch.
    
    @type {Number}
  */
  status: SC.Record.READY_NEW,
  
  /**
    If set to YES, then the RecordArray will permit modifying the underlying
    storeKeys array.  You should only set this property to YES if you also
    set a delegate on the query.  Otherwise when the query refreshes the 
    storeKeys it will destroy any modification.
    
    @property
    @type {Boolean}
  */
  isEditable: NO,
  
  /**
    If YES, then the fetch will automatically configure itself with a 
    SparseArray; notifying the delegate whenever a RecordArray needs changes.
    
    @property
    @type {Boolean}
  */
  useIncrementalLoading: NO,
  
  /**
    The delegate used when incremental loading is enabled.  Otherwise this
    property is ignored.  This property must implement the SparseArrayDelegate
    protocol.
    
    @property
    @type {Object}
  */
  delegate: null,
  
  /**
    If set, these storeKeys will be used as the basis for a RecordArray 
    instead of generating content from the in memory store.
  */
  storeKeys: null,

  // ..........................................................
  // DATA SOURCE CALLBACKS
  // 
  
  _loadCount: 0,
  
  /**
    Call this method from your fetch when you are about to begin loading the
    data for the fetch.  This will put the fetch object into a BUSY_LOADING or
    BUSY_REFRESH state.
  */
  dataSourceWillRetrieve: function(dataSource) {
    var status = this.get('status');
    switch(status) {
      case SC.Record.READY_NEW:
      case SC.Record.ERROR:
        status = SC.Record.BUSY_LOADING;
        break;

      case SC.Record.READY_CLEAN:
        status = SC.Record.BUSY_REFRESH;
        break;
        
      // if we're already busy loading, no state change
      case SC.Record.BUSY_LOADING:
      case SC.Record.BUSY_REFRESH:
        break ;
        
      default:
        throw SC.Record.BAD_STATE_ERROR;
    }
    
    this.setIfChanged('status', status);
    this._loadCount++; // keep track of how many fetches are actively working
    return this ;
  },
  
  /**
    Call this method from your data source when it has finished loading data
    for this fetch request.  This will put the fetch object back into a 
    READY_CLEAN state once an equal number of load counts have decreased.
  */
  dataSourceDidComplete: function(dataSource) {
    if (--this._loadCount <= 0) {
      this._loadCount = 0 ;

      var status = this.get('status');
      
      // if busy - set to ready clean
      if (status & SC.Record.BUSY) this.set('status', SC.Record.READY_CLEAN);
      
      // errors state errors until you refresh again
      else if (status !== SC.Record.ERROR) throw SC.Record.BAD_STATE_ERROR;
    }
    return this;
  },
  
  /**
    Call this method from your data source when it encounters an error while
    attempting to load data for the fetch.  This will put the fetch into an
    error state until you successfully retrieve data again or until you 
    reset the fetch.
  */
  dataSourceDidError: function(dataSource, error) {
    
  }
  
});
