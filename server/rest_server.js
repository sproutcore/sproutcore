// ========================================================================
// SproutCore
// copyright 2006-2008 Sprout Systems, Inc.
// ========================================================================

require('core') ;
require('server') ;

/** 
  @class
  
  Implements a REST client communicating in a RESTful manner with a backend 
  server.  This follows the classic API supported by the class Server object.

  @extends SC.Server
  @since SproutCore 1.0
  
*/
SC.RestServer = SC.Server.extend({

  urlFor: function(resource, action, ids, params, method) {
    url = resource;
    if (ids && ids.length == 1) url = url + '/' + ids[0];
    if (action && action != '') url = url + '/' + action;
    return url;
  },

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
