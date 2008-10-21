// ========================================================================
// SproutCore
// copyright 2006-2008 Sprout Systems, Inc.
// ========================================================================

require('foundation/object') ;
require('request/request') ;

/**
  The request manager controls the number of outstanding requests you may have
  inflight at one time.  Most browsers limit the number of Ajax requests you
  may have inflight at one time.  This request manager will help optimize the
  requests you send to fit within this limitation.
  
  To control the way this manager schedules your requests, you can set the
  requestPriority property on requests that you create.  See SC.Request docs
  for more information.
  
  
  h2. About Requestors
  
  The Request.manager manages objects that conform to a "requestor" interface.
  These objects are largely private, but the interface is documented here so
  that you can implement custom requestors if necessary.
  
  A requestor's function is to actually perform a low-level request and to 
  interpret the low-level response.  The requestor takes configuration 
  information from its owning SC.Request object and updates the state of the
  same object when it finishes executing.  It is actually controlled by the
  manager which will queue requestor objects until a slot if available in the
  browser's request queue.
  
  The object must be implemented as a standard JavaScript object with a 
  custom constructor and several prototype methods.  The constructor must
  accept an SC.Request object as its only property.  During the constructor
  call, it should collect any state information it will need from the 
  Request object initiate a request, but it should not yet send the request.
  
  It is important to note that a requestor object may be held in a queue for
  a while from the time it is created to the time when it is actually used. 
  During that time, the state of the SC.Request object may change, so it is
  important to collect all the state you might need during the constructor 
  call.
  
  The instantiated object must in turn implement the following methods and 
  properties on its prototype:
  
  - *send*: this function should actually send the request, initiating any timers etc.  It should also update the owning request object to indicate that it is in a pending state.
  - *cancel*: this function should abort the request immediately and terminate any timers and set the owning request object to an error state with the SC.REQUEST_ABORTED error code.
  - *destroy*: this function is called when the object is no longer needed.  Use this to cleanup any possible memory leaks.  In particular, be sure to null out the request property.
  - *request*: this property must point to the owning request object.

  Note also that when the requestor recieves a response from the server, it 
  must update the owning request object with the new state and then it should
  call SC.Request.manager.inflightRequestDidComplete().  This will allow the
  manager to clean up its inflight queues and move on to the next request.

  Other than this one callback to the request manager, requestor objects only
  need to worry about sending a request, receiving a response, and updating 
  the owning request object to reflect the response.  Queuing of these
  requests according to the overlappingRequest policy and priority you set 
  on the request are managed by SC.Request and the request manager.
  
  @extends SC.Object
*/
SC.Request.manager = SC.Object.create(
/** SC.Request.manager.prototype */ {

  /**
    The total number of concurrent requests that may be inflight at one time.
    This is set to a default based on the browser you are using but you can
    override this at anytime.
    
    @property {Number}
  */
  concurrentRequestLimit: (function() {
    return ((SC.browser.msie > 7) || (SC.browser.mozilla >= 3)) ? 6 : 2 ;
  })(),
  
  /** 
    Schedules a requestor object to run at the next available time according
    to the requestor's priority.
    
    @param requestor {Object} a private object used to send the request
    @returns {Object} receiver
  */
  schedule: function(requestor) {
    
    // put into queue based on requestor priority
    var optional = null ;
    switch(requestor.priority) {
      case SC.NORMAL_REQUEST:
        this.normalQueue.push(requestor) ;
        break ;
      case SC.CANCELLABLE_REQUEST:
        this.cancellableQueue.push(requestor) ;
        break ;
      default:
        if ((this.concurrentRequestLimit-this.inflightQueue.length) > 0) {
          optional = requestor;
        } else {
          requestor.cancel() ; 
          if (requestor.request) requestor.request.requestorDidComplete() ;
          requestor = null ;
        }
    }
    
    // if requestor was queued, issue a new request.
    if (request) this.sendNextRequest(optional) ;
    
    return this;    
  },

  /**
    Cancels the requestor object, removing it from the appropriate queue,
    notifying the requestor itself.  Returns the new value of the
    inflightQueue, which is used by sendNextRequest().
  */
  cancel: function(requestor, sendNextRequest) {
    var ret = this.inflightQueue, idx, queue ;
    
    // remove from any queue
    if ((queue = this.inflightQueue).indexOf(requestor) >= 0) {
      ret = this.inflightQueue = queue.without(requestor) ;
      
    } else switch(requestor.priority) {
      case SC.NORMAL_REQUEST:
        this.normalQueue = this.normalQueue.without(requestor) ;
        break ;
      case SC.CANCELLABLE_REQUEST:
        this.cancellableQueue = this.cancellableQueue.without(requestor) ;
        break ;
        
      // note: OPTIONAL_REQUEST is not queued.
    }
    
    // cancel requestor itself and notify the owning request.
    requestor.cancel() ;
    if (requestor.request) requestor.request.requestorDidComplete() ;
    
    // try to send the next request also, unless instructed not to.
    if (sendNextRequest) this.sendNextRequestl() ;
    
    return ret ; // return new inflight queue.
  },
  
  /**
    Sends the next request by queue priority.  If an optional requestor is 
    also passed, the requestor will be sent only if no other requests are 
    pending.
  */
  sendNextRequest: function(optional) {
    var limit = this.concurrentRequestLimit ;  
    var normal = this.normalQueue, cancellable = this.cancellableQueue,
      inflight = this.inflightQueue ;
    var len, idx ;

    // if there are normal or cancellable requests in queue, try to cancel an
    // optional request.
    if (normal.length+cancellable.length > 0) {
      var idx = 0 ;
      while(idx<inflight.length && inflight.length>=limit) {
        var requestor = inflight[idx++];
        if (requestor.priority > SC.CANCELLABLE_REQUEST) {
          inflight = this.cancel(requestor, NO) ;
        }
      }
    }
    
    // if there are still too many requests in flight and normal requests in
    // queue, try to cancel cancellable requests.
    if (normal.length > 0) {
      var idx = 0 ;
      while(idx<inflight.length && inflight.length>=limit) {
        var requestor = inflight[idx++];
        if (requestor.priority > SC.NORMAL_REQUEST) {
          inflight = this.cancel(requestor, NO) ;
        }
      }
    }
    
    // if there is now a slot open, send the next request...
    if (limit-inflight.length > 0) {
      var req = normal.pop() || cancellable.pop() || optional ;
      req.send() ;
      inflight.push(req) ;
      
      // if the request we sent was not the optional one, 
      // cancel the optional since it is not queued.
      if (req !== optional) optional.cancel() ;
    }
  },
  
  /**
    Called by a request when it has received a response or timed-out.  This 
    should only be called by requests that are in the inflight queue, but 
    should be indempotent for others as well.
  */
  inflightRequestDidComplete: function(requestor) {
    // remove from inflight queue
    this.inflightQueue = this.inflightQueue.without(requestor) ;

    // notify the owning request
    if (requestor.request) requestor.request.requestorDidComplete(requestor);

    // and send the next request.
    this.sendNextRequest() ;  
  },
  
  /** Pending requestors in the normal queue. */
  normalQueue: [],
  
  /** Pending requestors in the cancellable queue. */
  cancellableQueue: [],
  
  /** Requestors that are currently inflight. */
  inflightQueue: []  
    
}) ;
