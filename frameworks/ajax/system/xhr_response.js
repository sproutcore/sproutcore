// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/**
  @class

  Concrete implementation of `SC.Response` that implements support for using XHR requests. This is
  the default response class that `SC.Request` uses and it is able to create cross-browser
  compatible XHR requests to the address defined on a request and to notify according to the status
  code fallbacks registered on the request.

  You will not typically deal with this class other than to receive an instance of it when handling
  `SC.Request` responses. For more information on how to create a request and handle an XHR response,
  please @see SC.Request.

  @extends SC.Response
  @since SproutCore 1.0
*/
SC.XHRResponse = SC.Response.extend(
/** @scope SC.XHRResponse.prototype */{

  /**
    Implement transport-specific support for fetching all headers
  */
  headers: function() {
    var xhr = this.get('rawRequest'),
        str = xhr ? xhr.getAllResponseHeaders() : null,
        ret = {};

    if (!str) { return ret; }

    str.split("\n").forEach(function(header) {
      var idx = header.indexOf(':'),
          key, value;

      if (idx >= 0) {
        key = header.slice(0,idx);
        value = header.slice(idx + 1).trim();
        ret[key] = value;
      }
    }, this);

    return ret;
  }.property('status').cacheable(),

  /**
    Returns a header value if found.

    @param {String} key The header key
    @returns {String}
  */
  header: function(key) {
    var xhr = this.get('rawRequest');
    return xhr ? xhr.getResponseHeader(key) : null;
  },

  /**
    Implement transport-specific support for fetching tasks

    @field
    @type String
    @default #rawRequest
  */
  encodedBody: function() {
    var xhr = this.get('rawRequest');

    if (!xhr) { return null; }
    if (this.get('isXML')) { return xhr.responseXML; }

    return xhr.responseText;
  }.property('status').cacheable(),

  /**
    The response body or the parsed JSON. Returns a SC.Error instance
    if there is a JSON parsing error. If isJSON was set, will be parsed
    automatically.

    @field
    @type {Hash|String|SC.Error}
  */
  body: function() {
    // TODO: support XML
    // TODO: why not use the content-type header?
    var ret = this.get('encodedBody');
    if (ret && this.get('isJSON')) {
      try {
        ret = SC.json.decode(ret);
      } catch(e) {
        return SC.Error.create({
          message: e.name + ': ' + e.message,
          label: 'Response',
          errorValue: this.get('status') });
      }
    }
    return ret;
  }.property('encodedBody').cacheable(),

  /**
    Cancels the request.
  */
  cancelTransport: function() {
    var rawRequest = this.get('rawRequest');
    if (rawRequest) { rawRequest.abort(); }
    this.set('rawRequest', null);
  },

  /**
    Starts the transport of the request

    @returns {XMLHttpRequest|ActiveXObject}
  */
  invokeTransport: function() {
    var listener, listeners, listenersForKey,
      rawRequest,
      request = this.get('request'),
      transport, handleReadyStateChange, async, headers;

    rawRequest = this.createRequest();
    this.set('rawRequest', rawRequest);

    // configure async callback - differs per browser...
    async = !!request.get('isAsynchronous');

    if (async) {
      if (SC.platform.get('supportsXHR2ProgressEvent')) {
        // XMLHttpRequest Level 2

        // Add progress event listeners that were specified on the request.
        listeners = request.get("listeners");
        if (listeners) {
          for (var key in listeners) {

            // Make sure the key is not an HTTP numeric status code.
            if (isNaN(parseInt(key, 10))) {
              // We still allow multiple notifiers on progress events, but we
              // don't try to optimize this by using a single listener, because
              // it is highly unlikely that the developer will add duplicate
              // progress event notifiers and if they did, it is also unlikely
              // that they would expect them to cascade in the way that the
              // status code notifiers do.
              listenersForKey = listeners[key];
              for (var i = 0, len = listenersForKey.length; i < len; i++) {
                listener = listenersForKey[i];

                var keyTarget = key.split('.');
                if (SC.none(keyTarget[1])) {
                  SC.Event.add(rawRequest, keyTarget[0], listener.target, listener.action, listener.args);
                } else {
                  SC.Event.add(rawRequest[keyTarget[0]], keyTarget[1], listener.target, listener.action, listener.args);
                }
              }
            }
          }
        }

        if (SC.platform.get('supportsXHR2LoadEndEvent')) {
          SC.Event.add(rawRequest, 'loadend', this, this.finishRequest);
        } else {
          SC.Event.add(rawRequest, 'load', this, this.finishRequest);
          SC.Event.add(rawRequest, 'error', this, this.finishRequest);
          SC.Event.add(rawRequest, 'abort', this, this.finishRequest);
        }
      } else if (window.XMLHttpRequest && rawRequest.addEventListener) {
        // XMLHttpRequest Level 1 + support for addEventListener (IE prior to version 9.0 lacks support for addEventListener)
        SC.Event.add(rawRequest, 'readystatechange', this, this.finishRequest);
      } else {
        transport = this;
        handleReadyStateChange = function() {
          if (!transport) { return null; }
          var ret = transport.finishRequest();
          if (ret) { transport = null; }
          return ret;
        };
        rawRequest.onreadystatechange = handleReadyStateChange;
      }
    }

    // initiate request.
    rawRequest.open(this.get('type'), this.get('address'), async);

    // headers need to be set *after* the open call.
    headers = this.getPath('request.headers');
    for (var headerKey in headers) {
      rawRequest.setRequestHeader(headerKey, headers[headerKey]);
    }

    // Do we need to allow Cookies for x-domain requests?
    if (!this.getPath('request.isSameDomain') && this.getPath('request.allowCredentials')) {
      rawRequest.withCredentials = true;
    }

    // now send the actual request body - for sync requests browser will
    // block here
    rawRequest.send(this.getPath('request.encodedBody'));
    if (!async) { this.finishRequest(); }

    return rawRequest;
  },

  /**
    Creates the correct XMLHttpRequest object for this browser.

    You can override this if you need to, for example, create an XHR on a
    different domain name from an iframe.

    @returns {XMLHttpRequest|ActiveXObject}
  */
  createRequest: function() {
    var rawRequest;

    // check native support first
    if (window.XMLHttpRequest) {
      rawRequest = new XMLHttpRequest();
    } else {
      // There are two relevant Microsoft MSXML object types.
      // See here for more information:
      // http://www.snook.ca/archives/javascript/xmlhttprequest_activex_ie/
      // http://blogs.msdn.com/b/xmlteam/archive/2006/10/23/using-the-right-version-of-msxml-in-internet-explorer.aspx
      // http://msdn.microsoft.com/en-us/library/windows/desktop/ms763742(v=vs.85).aspx
      try { rawRequest = new ActiveXObject("MSXML2.XMLHTTP.6.0");  } catch(e) {}
      try { if (!rawRequest) rawRequest = new ActiveXObject("MSXML2.XMLHTTP");  } catch(e) {}
    }

    return rawRequest;
  },

  /**
    @private

    Called by the XHR when it responds with some final results.

    @param {XMLHttpRequest} rawRequest the actual request
    @returns {Boolean} YES if completed, NO otherwise
  */
  finishRequest: function(evt) {
    var listener, listeners, listenersForKey,
      rawRequest = this.get('rawRequest'),
      readyState = rawRequest.readyState,
      request;

    if (readyState === 4 && !this.get('timedOut')) {
      this.receive(function(proceed) {
        if (!proceed) { return; }

        // collect the status and decide if we're in an error state or not
        var status = rawRequest.status || 0;
        // IE mangles 204 to 1223. See http://bugs.jquery.com/ticket/1450 and many others
        status = status === 1223 ? 204 : status;

        // if there was an error - setup error and save it
        if ((status < 200) || (status >= 300)) {
          this.set('isError', YES);
          this.set('errorObject', SC.$error(rawRequest.statusText || "HTTP Request failed", "Request", status));
        }

        // set the status - this will trigger changes on related properties
        this.set('status', status);
      }, this);

      // Avoid memory leaks
      if (SC.platform.get('supportsXHR2ProgressEvent')) {
        // XMLHttpRequest Level 2

        if (SC.platform.get('supportsXHR2LoadEndEvent')) {
          SC.Event.remove(rawRequest, 'loadend', this, this.finishRequest);
        } else {
          SC.Event.remove(rawRequest, 'load', this, this.finishRequest);
          SC.Event.remove(rawRequest, 'error', this, this.finishRequest);
          SC.Event.remove(rawRequest, 'abort', this, this.finishRequest);
        }

        request = this.get('request');
        listeners = request.get("listeners");
        if (listeners) {
          for (var key in listeners) {

            // Make sure the key is not an HTTP numeric status code.
            if (isNaN(parseInt(key, 10))) {
              listenersForKey = listeners[key];
              for (var i = 0, len = listenersForKey.length; i < len; i++) {
                listener = listenersForKey[i];

                var keyTarget = key.split('.');
                if (SC.none(keyTarget[1])) {
                  SC.Event.remove(rawRequest, keyTarget[0], listener.target, listener.action, listener.args);
                } else {
                  SC.Event.remove(rawRequest[keyTarget[0]], keyTarget[1], listener.target, listener.action, listener.args);
                }
              }
            }
          }
        }
      } else if (window.XMLHttpRequest && rawRequest.addEventListener) {
        // XMLHttpRequest Level 1 + support for addEventListener (IE prior to version 9.0 lacks support for addEventListener)
        SC.Event.remove(rawRequest, 'readystatechange', this, this.finishRequest);
      } else {
        rawRequest.onreadystatechange = null;
      }

      return YES;
    }
    return NO;
  }

});
