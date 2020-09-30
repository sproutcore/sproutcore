
/*

  SC.View.extend({
    layout: { right: 0, top: 0, width: 19, height: 19 },

    init: function() {
      if (!SC.fullScreen.get('isSupported')) {
        this.set('isVisible', false);
      }
      sc_super();
    },

    childViews: [
      SC.ImageButtonView.extend({
        layout: { right: 5, top: 5, width: 12, height: 14 },
        classNames: 'fa fa-expand',
        action: function() { SC.fullScreen.toggle(); },
        isVisibleBinding: SC.Binding.oneWayNot('SC.fullScreen.isFullScreen')
      }),
      SC.ImageButtonView.extend({
        layout: { right: 5, top: 5, width: 12, height: 14 },
        classNames: 'fa fa-compress',
        action: function() { SC.fullScreen.toggle(); },
        isVisibleBinding: SC.Binding.oneWay('SC.fullScreen.isFullScreen')
      }),
    ]
  }),
*/

SC.fullScreen = SC.Object.create({

  isFullScreen: false,

  isSupported: false,

  init: function () {
    var val,
      valLength,
      fnMap = this._fnMap,
      i = 0,
      l = fnMap.length;

    for (; i < l; i++) {
      val = fnMap[i];
      if (val && val[1] in document) {
        for (i = 0, valLength = val.length; i < valLength; i++) {
          this[fnMap[0][i]] = val[i];
        }
      }
    }

    this.set('isSupported', !!document.body[this.requestFullscreen]);

    SC.Event.add(document, this.fullscreenchange, this, 'fullscreenDidChange');
    SC.Event.add(document, this.fullscreenerror, this, 'fullscreenDidError');

    sc_super();
  },

  toggle: function (view) {
    if (this.get('isFullScreen')) {
      this.exit();
    } else {
      this.request(view);
    }
  },

  request: function (view) {
    var request = this.requestFullscreen,
      elem = view ? view.get('layer') : document.body;

    // Work around Safari 5.1 bug: reports support for
    // keyboard in fullscreen even though it doesn't.
    // Browser sniffing, since the alternative with
    // setTimeout is even worse.
    if (/5\.1[\.\d]* Safari/.test(navigator.userAgent)) {
      elem[request]();
    } else {
      var keyboardAllowed = typeof Element !== 'undefined' && 'ALLOW_KEYBOARD_INPUT' in Element;

      elem[request](keyboardAllowed && Element.ALLOW_KEYBOARD_INPUT);
    }
  },

  exit: function () {
    document[this.exitFullscreen]();
  },

  fullscreenDidChange: function() {
    this.set('isFullScreen', !!document[this.fullscreenElement]);
  },

  fullscreenDidError: function(evt) {
    SC.Logger.error("A fullscreen request error has occurred");
  },


  // ..........................................................
  // PRIVATE
  //

  // Function
  requestFullscreen: null,
  exitFullscreen: null,

  // Property
  fullscreenElement: null,
  fullscreenEnabled: null,

  // Events
  fullscreenchange: null,
  fullscreenerror: null,

  _fn: null,

  _fnMap: [
    [
      'requestFullscreen',
      'exitFullscreen',
      'fullscreenElement',
      'fullscreenEnabled',
      'fullscreenchange',
      'fullscreenerror'
    ],
    // new WebKit
    [
      'webkitRequestFullscreen',
      'webkitExitFullscreen',
      'webkitFullscreenElement',
      'webkitFullscreenEnabled',
      'webkitfullscreenchange',
      'webkitfullscreenerror'

    ],
    // old WebKit (Safari 5.1)
    [
      'webkitRequestFullScreen',
      'webkitCancelFullScreen',
      'webkitCurrentFullScreenElement',
      'webkitCancelFullScreen',
      'webkitfullscreenchange',
      'webkitfullscreenerror'

    ],
    [
      'mozRequestFullScreen',
      'mozCancelFullScreen',
      'mozFullScreenElement',
      'mozFullScreenEnabled',
      'mozfullscreenchange',
      'mozfullscreenerror'
    ],
    [
      'msRequestFullscreen',
      'msExitFullscreen',
      'msFullscreenElement',
      'msFullscreenEnabled',
      'MSFullscreenChange',
      'MSFullscreenError'
    ]
  ]

});


SC.View.reopen({

  fullScreen: function() {
    SC.fullScreen.toggle(this);
  },

});
