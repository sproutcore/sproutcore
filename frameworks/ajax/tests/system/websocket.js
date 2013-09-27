// ==========================================================================
// Project:   SC.WebSocket
// Copyright: ©2013 Nicolas BADIA and contributors
// License:   Licensed under MIT license (see license.js)
// ==========================================================================
// SC.WebSocket Base Tests

var url = 'ws://url';

SC.WebSocket.reopen({
  server: url,
  autoReconnect: false
});

module("SC.WebSocket", {
  setup: function () {},
  teardown: function () {}
});

test("Basic Requirements", function () {
  ok(SC.WebSocket, "SC.WebSocket is defined");

  var webSocket = SC.WebSocket.create().connect();

  ok(webSocket.isSupported === true, "webSocket should be supported");
  ok(webSocket.socket !== null, "webSocket.socket object is not null");
});

test("Test nofitications", function () {
  var webSocket = SC.WebSocket.create({
      isJSON: false
    }).connect(),
    socket = webSocket.socket,
    count = 0;

  webSocket.notify('onopen', this, function(websocket, response, arg) {
    equals(response.type, 'open', "response type should be 'open'");
    equals(arg, 'arg', "arg should be 'arg'");
    count++;
  }, 'arg');

  webSocket.notify('onmessage', this, function(websocket, response) {
    equals(response.type, 'message', "response type should be 'message'");
    count++;
  });

  webSocket.notify('onclose', this, function(websocket, response) {
    equals(response.type, 'close', "response type should be 'close'");
    count++;
  });

  webSocket.notify('onerror', this, function(websocket, response) {
    equals(response.type, 'error', "response type should be 'error'");
    count++;
  });


  stop(100);
  setTimeout(function () {
    socket.onopen({ type: 'open' });
    socket.onmessage({ data: { type: 'message' } });

    // Automatically call by the WebSocket object because the connection will fail
    // socket.onclose({ type: 'close' });
    // socket.onerror({ type: 'error' });

    equals(count, 4, "listeners should have been notified 4 times");
    window.start();
  }, 50);
});

test("Test delegate handling", function () {
  var webSocket = SC.WebSocket.create({
    delegate: SC.Object.create(SC.WebSocketDelegate, {
      webSocketDidOpen: function (webSocket, event) { return true; },
      webSocketDidReceiveMessage: function (webSocket, data) { return true; },
      webSocketDidClose: function (webSocket, closeEvent) { return true; },
      webSocketDidError: function (webSocket, event) { return true; },
    })
  }).connect(),
  socket = webSocket.socket,
  count = 0;

  webSocket.notify('onopen', this, function () { count++; });
  webSocket.notify('onmessage', this, function () { count++; });
  webSocket.notify('onclose', this, function () { count++; });
  webSocket.notify('onerror', this, function () { count++; });

  stop(100);
  setTimeout(function () {
    socket.onopen({ type: 'open' });
    socket.onmessage({ data: { type: 'message' } });
    socket.onclose({ type: 'close' });
    socket.onerror({ type: 'error' });

    equals(count, 0, "listeners should not have been notified");
    window.start();
  }, 50);
});

test("Test auto reconnection", function () {
  var count = 0,
    webSocket = SC.WebSocket.create({
      autoReconnect: true,
      reconnectInterval: 10,
      
      webSocketDidClose: function (webSocket, closeEvent) {
        count++;
        if (count > 1) {
          return true;
        }
      },
    }).connect();
  
  stop(100);
  setTimeout(function () {
    ok(count > 1, "should have try a reconnection");
    window.start();
  }, 50);
});
