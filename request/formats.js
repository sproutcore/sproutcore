// ========================================================================
// SproutCore
// copyright 2006-2008 Sprout Systems, Inc.
// ========================================================================

require('request/request') ;

/** Standard format for JSON requests */
SC.JSON_FORMAT = 'application/json' ;
SC.Request.registerFormat({
  accepts: ['application/json', 'text/json', 'text/javascript'],
  
  encode: function(request, body) {
    
  },
  
  decode: function(request, body, xhr) {
    
  }
}, 'application/json', 'text/json') ;

/** Standard format for sending fragments of javascript.  Mostly used for jsonp */
SC.SCRIPT_FORMAT = 'text/javascript' ;
SC.Request.registerFormat({
  accepts: ['text/javascript', 'application/javascript'],
  
  encode: function(request, body) {
    
  },
  
  decode: function(request, body, xhr) {
    
  }
}) ;


/** Standard format for plain text requests */
SC.TEXT_FORMAT = 'text/plain' ;
SC.Request.registerFormat({
  accepts: 'text/plain',
  
  encode: function(request, body) {
    
  },
  
  decode: function(request, body) {
    
  }
}) ;

/** Standard format for xml requests */
SC.XML_FORMAT = 'application/xml' ;
SC.Request.registerFormat({
  accepts: ['application/xml', 'text/xml'],
  
  encode: function(request, body) {
    
  },
  
  decode: function(request, body) {
    
  }
}) ;

/** Standard format for html requests */
SC.HTML_FORMAT = 'text/html' ;
SC.Request.registerFormat({
  accepts: 'text/html',
  
  encode: function(request, body) {
    
  },
  
  decode: function(request, body) {
    
  }
}) ;
