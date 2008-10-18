// ========================================================================
// SproutCore
// copyright 2006-2008 Sprout Systems, Inc.
// ========================================================================

/** 
  You can implement some of all of the methods in this mixin on your object
  to respond to events that occur on a request.  Or you can simply observe
  the response property on the request, which is the more common approach.
*/
SC.RequestDelegate = {
  
  /**
    This method is invoked just before the XMLHTTPRequest is sent, giving you
    one last opportunity to tweak the XHR object as needed.  You will not 
    usually need to implement this method.
    
    @param request {SC.Request} the request object
    @param xhr {XMLHTTPRequest} the XMLHTTPRequest object.
    @returns {void}
  */
  requestWillSend: function(request, xhr) { },
  
  /**
    This method is invoked just after the request is sent to the server,
    usually before a response has been received.  You can use this method to
    activate a busy indicator or show other UI indicating that the request 
    is in progress.
    
    @param request {SC.Request} the request object
    @returns {void}
  */
  requestDidSend: function(request) { },
  
  /**
    This method is called just after a response is received from the server.
    You can inspect the response, responseStatus and responseStatusText 
    properties to find out what data was received.
    
    If the response was an error state, the value of the repsonse property 
    will be an error object.  This method will be called in addition to
    requestDidFail() or requestDidSucceed().
    
    @param request {SC.Request} the request object
    @returns {void}
  */
  requestDidComplete: function(request) { },
  
  /**
    This method is called just after the response is received and if the 
    response status indicated an error of some type.  You can inspect the
    response, responseStatus, and responseStatusText properties to learn 
    more.
    
    @param request {SC.Request} the request object
    @returns {void}
  */
  requestDidFail: function(request) { },
  
  /**
    This method is called just after the response is received and if the 
    response status indicated success.  You can inspect the response property
    to retrieve the value of the response or responseStatus to get the 
    status code.
    
    @param request {SC.Request} the request object
    @returns {void}
  */
  requestDidSucceed: function(request) { }
} ;
