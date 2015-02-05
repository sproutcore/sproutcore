// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// License:   Licensed under MIT license (see license.js)
// ==========================================================================
/*globals module, test, ok, equals, same */


var state, params, context;
module("SC.AppSubstateRouteHandlerContext", {

  setup: function() {

    params = { };

    state = SC.Object.create({

      info: {},

      handler: function(params) {
        this.info.handler = {
          params: params
        };
      }

    });

    context = SC.AppSubstateRouteHandlerContext.create({

      state: state,

      params: params

    });

  },

  teardown: function() {
    params = state = context = null;
  }

});

/* Properties */


/* Methods */

// This method ...
test("Method: retry. Invoke retry with context's handler property assigned a function value", function() {

  context.set('handler', state.handler);
  context.retry();

  var info = state.info;

  ok(info.handler, "state's handler method was invoked");
  equals(info.handler.params, params, "state's handler was provided params");

});

test("Method: retry. Invoke retry with context's handler property assigned a string value", function() {

  context.set('handler', 'handler');
  context.retry();

  var info = state.info;

  ok(info.handler, "state's handler method was invoked");
  equals(info.handler.params, params, "state's handler was provided params");

});
