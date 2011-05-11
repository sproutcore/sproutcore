sc_require('views/template');

SC.Button = SC.TemplateView.extend({
  classNames: ['sc-button'],

  // Setting isActive to true will trigger the classBinding and add
  // 'is-active' to our layer's class names.
  mouseDown: function() {
    this.set('isActive', true);
    this._isMouseDown = YES;
  },

  mouseExited: function() {
    this.set('isActive', false);
  },

  mouseEntered: function() {
    if (this._isMouseDown) {
      this.set('isActive', true);
    }
  },

  // Setting isActive to false will remove 'is-active' from our
  // layer's class names.
  mouseUp: function(event) {
    if (this.get('isActive')) {
      var action = this.get('action'),
          target = this.get('target') || null,
          rootResponder = this.getPath('pane.rootResponder');

      if (action && rootResponder) {
        rootResponder.sendAction(action, target, this, this.get('pane'), null, this);
      }

      this.set('isActive', false);
    }

    this._isMouseDown = NO;
  },

  touchStart: function(touch) {
    this.mouseDown(touch);
  },

  touchEnd: function(touch) {
    this.mouseUp(touch);
  }
});

