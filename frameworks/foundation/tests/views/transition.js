// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// License:   Licensed under MIT license (see license.js)
// ==========================================================================
// ========================================================================
// View Transition Unit Tests
// ========================================================================

/*global module test htmlbody ok equals same stop start */

module("TRANSITION");

test("simulate SC.SheetPane transition", function () {
  var view = SC.Pane.create({
    layout: { width: 400, height: 200, top: 0, centerX: 0 },
    backgroundColor: '#ccc',

    transitionIn: SC.View.SLIDE_IN,
    transitionInOptions: {
      direction: 'down',
      duration: 0.1,
    },

    transitionOut: SC.View.SLIDE_OUT,
    transitionOutOptions: {
      direction: 'up',
      duration: 0.1,
    },

    render: function(context) {
      sc_super();

      this.invokeLast(function() {
        this.adjust({ width: 500, height: 300 });
      });
    }
  });

  SC.run(function() { view.append(); });

  equals(view.get('layout').top, -300, 'pane should be hidden before animating');
  equals(view.get('layout').height, 300, 'width should has been updated');
  equals(view.get('layout').width, 500, 'width should has been updated');

  stop(400);

  setTimeout(function() {
    equals(view.get('layout').top, 0, 'pane should be displayed at default position top after animating');
    equals(view.get('layout').height, 300, 'height should not has change');
    equals(view.get('layout').width, 500, 'width should not has change');

    SC.run(function() { view.remove().destroy(); });
    window.start();
  }, 200);
});

test("simulate SC.AutoResizingMenuPane transition", function () {
  var view = SC.Pane.create({
    layout: { width: 50, height: 200, top: 0, left: 0 },
    backgroundColor: '#ccc',

    transitionIn: SC.View.FADE_IN,
    transitionInOptions: {
      duration: 0.1,
    },
    transitionOut: SC.View.FADE_OUT,
    transitionOutOptions: {
      duration: 0.1,
    },

    init: function() {
      sc_super();

      this.invokeLast(function() {
        this.invokeOnce(function() {
          this.adjust({ width: 100 });
        });
      });
    },
  });

  SC.run(function() { view.append(); });

  equals(view.get('layout').width, 100, 'width should has been updated');

  stop(400);

  setTimeout(function() {
    equals(view.get('layout').width, 100, 'width should not has change');
    SC.run(function() { view.remove().destroy(); });
    window.start();
  }, 200);
});
