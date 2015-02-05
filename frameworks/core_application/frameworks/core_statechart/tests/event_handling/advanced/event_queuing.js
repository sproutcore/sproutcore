// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

var TestState, statechart, expectedEvents;

module("Statechart Event Queuing", {
  setup: function() {
    TestState = SC.State.extend({
      _handledEvents: null,

      init: function() {
        sc_super();
        this.reset();
      },

      reset: function() {
        this.set('_handledEvents', []);
      }
    });

    statechart = SC.Statechart.create({

      rootSubstate: TestState.extend({

        initialSubstate: 'a',

        eventA: function() {
          this._handledEvents.push('eventA');
        },

        eventB: function() {
          this._handledEvents.push('eventB');

          statechart.gotoSubstate('b');
        },

        eventC: function() {
          this._handledEvents.push('eventC');
        },

        a: TestState.extend({

        }),

        b: TestState.extend({
          enterSubstate: function() {
            statechart.sendEvent('eventC');
          }
        }),

        c: TestState.extend({
          enterSubstate: function() {
            statechart.sendEvent('eventA');
            stop();
            return this.performAsync('asyncFunction');
          },

          asyncFunction: function() {
            var self = this;
            setTimeout(function() {
              statechart.sendEvent('eventC');
            }, 100);
            setTimeout(function() {
              var rootSubstate = statechart.get('rootSubstate');
              self.resumeGotoState();
              same(rootSubstate._handledEvents, expectedEvents, 'expected events were handled');
              start();
            }, 500);
          }
        })

      })

    });

    statechart.initStatechart();
  },

  teardown: function() {
    statechart.destroy();
    statechart = null;
  }
});

test("Events are sent even when queued during state transitions", function() {
  var rootSubstate = statechart.get('rootSubstate'),
      stateA = statechart.getState('a'),
      stateB = statechart.getState('b');

  statechart.sendEvent('eventA');
  equals(rootSubstate._handledEvents.contains('eventA'), true, 'eventA was handled');

  rootSubstate.reset();
  statechart.sendEvent('eventB');
  same(rootSubstate._handledEvents, ['eventB', 'eventC'], 'eventB and eventC were handled');

  rootSubstate.reset();
  expectedEvents = ['eventA', 'eventC'];
  statechart.gotoSubstate('c');
});
