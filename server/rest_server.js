// ========================================================================
// SproutCore
// copyright 2006-2008 Sprout Systems, Inc.
// ========================================================================

require('server/server') ;

/** 
  @class
  
  Usually you wouldn't need to call any of the methods on this class or it's 
  superclass, except for calling the +listFor+ method. The other methods are 
  called for you when you work with your model objects. For example, calling 
  myObject.commit(); will call the commitRecords method on this server if you 
  had defined this server to be to the +dataSource+ of myObject.

  To have an SC model reflect data on a backend server attach an instance of 
  this class to your application. For example:

  {{{
    Contacts = SC.Object.create({
      server: SC.RestServer.create({ prefix: ['Contacts'] })
    }) ;
  }}}

  Then attach that server as the +dataSource+ to each model class that you 
  want to have reflected. Also define a +resourceURL+ which defines the URL 
  where the collection of your model can be queried. For example:

  {{{
    Contacts.Contact = SC.Record.extend(
      dataSource: Contacts.server,
      resourceURL: 'sc/contacts',
      properties: ['guid','firstName','lastName'],
      primaryKey: 'guid'
    }) ;
  }}}

  When you work with your models, behind the scenes SC will use 5 main methods 
  on this server. Each is listed below, together with the HTTP method used in 
  the call to the backend server and the URL that is being called. The URL is 
  based on the example given above.

      listFor             GET    /sc/contacts

      createRecords       POST   /sc/contacts

      refreshRecords
      for one record      GET    /sc/contacts/12345

      refreshRecords
      for many records    GET    /sc/contacts?ids=1,2,3,4,5,6

      commitRecords
      for one record      PUT    /sc/contacts/12345

      commitRecords
      for many records    PUT    /sc/contacts?ids=1,2,3,4,5

      destroyRecords
      for one record      DELETE /sc/contacts/12345

      destroyRecords
      for many records    DELETE /sc/contacts?ids=1,2,3,4,5

  The above is the default behaviour of this server. If you want different 
  URLs to be generated then extend this class and override the +urlFor+ 
  method.

  Another way to override the above is to tell SC where member resources can
  be refreshed, committed and destroyed. For example, when SC calls
  
  {{{
    GET /sc/contacts
  }}}
  
  you could reply as follows:

  {{{
    records: [
      {  guid: '123',
        type: "Contact",
        refreshURL: "/contacts?refresh=123",
        updateURL: "/contacts/123?update=Y",
        destroyURL: "/contacts/123",
        firstName: "Charles",
        ...
      }],
      ...
    }
  }}}

  Then when contact 123 needs to be refreshed later on by SC, it will call:

  {{{
    GET /contacts?refresh=123
  }}}

  instead of GET /contacts/123. Note that this only works for members on your
  resource. If a collection of contacts needed to be refreshed it would still
  call for example GET /contacts?id=123,456,789 instead of making 3 separate
  calls.

  Because some browsers cannot actually perform an HTTP PUT or HTTP DELETE it
  will actually perform an HTTP POST but will put an additional key,value pair
  in the post data packet. For HTTP PUT it will add _method='put' and for
  HTTP DELETE it will add _method='delete' in the post data.

  Via the SC.Server#request method you can also call collection and member
  functions on your resource. Use the +action+ parameter for this. For
  example, server.request('contacts', 'archive', null, params, 'delete')
  would call:

  {{{
    DELETE /contacts/archive
  }}}

  And server.request('contacts', 'give', [12345], {'amount': 1000}, 'put')
  would call:

  {{{
   PUT /contacts/12345/give
  }}}
  
  with post data amount=1000.

  Alternatively explicitely define the URL to use by setting the +url+
  property in the +params+ argument that is passed to the server.request 
  method. For example:

  {{{
    Contacts.server.request(null,null,null, {url: '/sc/archive'}, 'delete')
  }}}

  would call:

  {{{
    DELETE /sc/archive
  }}}


  @extends SC.Server
  @author Lawrence Pit
  @copyright 2006-2008, Sprout Systems, Inc. and contributors.
  @since SproutCore 1.0
*/
SC.RestServer = SC.Server.extend({

  /**
    @see SC.Server.urlFor
  **/
  urlFor: function(resource, action, ids, params, method) {
    url = resource;
    if (ids && ids.length == 1) url = url + '/' + ids[0];
    if (action && action != '') url = url + '/' + action;
    return url;
  },


  /* privates, overrides the values in SC.Server */

  _listForAction: '',
  _listForMethod: 'get',

  _createAction: '',
  _createMethod: 'post',

  _refreshAction: '',
  _refreshMethod: 'get',

  _commitAction: '',
  _commitMethod: 'put',

  _destroyAction: '',
  _destroyMethod: 'delete'

}) ;
