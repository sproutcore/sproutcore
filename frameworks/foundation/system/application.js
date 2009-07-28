// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple Inc. All rights reserved.
// License:   Licened under MIT license (see license.js)
// ==========================================================================

sc_require('system/responder_context');

/** @class

  The root object for a SproutCore application.  Usually you will create a 
  single SC.Application instance as your root namespace.  SC.Application is
  required if you intend to use SC.Responder to route events.
  
  h2. Example
  
  {{{
    Contacts = SC.Application.create({
      store: SC.Store.create(SC.Record.fixtures),
      
      // add other useful properties here
    });
  }}}

  h2. Sending Events
  
  You can send actions and events down an application-level responder chain
  by 
  
  @extends SC.ResponderContext
  @since SproutCore 1.0
*/
SC.Application = SC.ResponderContext.extend(/** SC.Application.prototype */ {

});
