// ==========================================================================
// Project:   Sproutcore
// Copyright: ©2013 GestiXi
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

sc_require('system/response');

/**
  @class

  Concrete implementation of `SC.Response` that implements support for using Fetch requests. This is
  the default response class that `SC.Request` uses and it is able to create cross-browser compatible
  Fetch requests to the address defined on a request and to notify according to the status
  code fallbacks registered on the request.

  You will not typically deal with this class other than to receive an instance of it when handling
  `SC.Request` responses. For more information on how to create a request and handle a Fetch response,
  please @see SC.Request.

  @extends SC.Response
  @since SproutCore 1.12
*/
SC.FetchResponse = SC.Response.extend(
/** @scope SC.FetchResponse.prototype */{

  /**
    Returns a header value if found.

    @param {String} key The header key
    @returns {String}
  */
  header: function(key) {
    var headers = this.get('headers');
    return headers ? headers[key] : null;
  },

  /**
    Cancels the request.
  */
  cancelTransport: function() {
    var abortController = this.abortController;
    if (abortController) abortController.abort();
  },

  /**
    Starts the transport of the request
  */
  invokeTransport: function() {
    var that = this,
      request = this.get('request'),
      allowCredentials = request.get('allowCredentials'),
      credentials = allowCredentials === null ? 'same-origin' : (allowCredentials ? 'include' : 'omit'),
      controller, signal;

    if (typeof AbortController !== 'undefined') {
      controller = new AbortController();
      signal = controller.signal;

      this.abortController = controller;
    }

    fetch(this.get('address'), {
      method: this.get('type'),
      headers: request.get('headers'),
      body: request.get('encodedBody'),
      credentials: credentials,
      signal: signal
    })
    .then(function(response) {
      that.set('headers', response.headers);
      that.set('status', response.status);

      if (!response.ok) {
        that.receive(function(proceed) {
          if (!proceed) { return; }
          that.set('isError', YES);
          that.set('errorObject', SC.$error(response.statusText || "HTTP Request failed", "Request", response.status));
        }, that);
      }
      else {
        (that.get('isJSON') ? response.json() : response.text()).then(function(body) {
          that.set('body', body);
          that.receive();
        }).catch(function(error) {
          that.receive(function(proceed) {
            if (!proceed) { return; }
            that.set('isError', YES);
            that.set('errorObject', SC.$error("HTTP Request parsing error", "Request"));
          }, that);
        });
      }
    })
    .catch(function(error) {
      that.receive(function(proceed) {
        if (!proceed) { return; }
        that.set('isError', YES);
        that.set('errorObject', SC.$error("HTTP Request error", "Request"));
      }, that);
    });
  }

});
