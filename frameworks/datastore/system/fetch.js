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
    
    fetch: function(fetch) {

      // if fetch is remote, it means we need to provide the store keys.  
      if (fetch.get('isRemote')) {
        var url = fetch.get('conditions');
        SC.Request.getUrl(url).notify(this, 'fetchDidComplete', fetch);
        
      // if fetch is local, it means it will be handled by the store.  we just
      // need to load data if needed.
      } else  {
        // handle queries here.
      }
    },
    
    fetchDidComplete: function(request, fetch) {
      //
    }
  }}}
  

  @extends SC.Object
  @since SproutCore 1.0
*/

SC.Fetch = SC.Object.extend(SC.Copyable, {
});
