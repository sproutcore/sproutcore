sc_require("views/view");


SC.CoreView.reopen(
  /** @scope SC.CoreView.prototype */ {

  /**
    The transition plugin to use when this view is appended to the DOM.

    SC.CoreView uses a pluggable transition architecture where the transition setup,
    execution and cleanup can be handled by a specified transition plugin.

    There are a number of pre-built transition plugins available in the
    foundation framework:

      SC.View.BOUNCE
      SC.View.FADE
      SC.View.MOVE
      SC.View.SCALE
      SC.View.SPRING

    You can even provide your own custom transition plugins.  Just create a
    transition object that conforms to the SC.TransitionProtocol protocol.

    @type Object (SC.TransitionProtocol)
    @default null
    @since Version 1.10
  */
  transitionIn: null,

  /**
    The options for the given transition in plugin.

    These options are specific to the current transition plugin used and are
    used to modify the transition animation.  To determine what options
    may be used for a given plugin and to see what the default options are,
    see the documentation for the transition plugin being used.

    Most transitions will accept a duration and timing option, but may
    also use other options.  For example, SC.View.MOVE_IN accepts options
    like:

        transitionInOptions: {
          direction: 'left',
          duration: 0.25,
          timing: 'ease-in-out'
        }

    @type Object
    @default null
    @since Version 1.10
  */
  transitionInOptions: null,

  /**
    The transition plugin to use when this view is removed from the DOM.

    SC.View uses a pluggable transition architecture where the transition setup,
    execution and cleanup can be handled by a specified transition plugin.

    There are a number of pre-built transition plugins available in the
    foundation framework:

      SC.View.BOUNCE
      SC.View.FADE
      SC.View.MOVE
      SC.View.SCALE
      SC.View.SPRING

    You can even provide your own custom transition plugins.  Just create a
    transition object that conforms to the SC.TransitionProtocol protocol.

    @type Object (SC.TransitionProtocol)
    @default null
    @since Version 1.10
  */
  transitionOut: null,

  /**
    The options for the given transition out plugin.

    These options are specific to the current transition plugin used and are
    used to modify the transition animation.  To determine what options
    may be used for a given plugin and to see what the default options are,
    see the documentation for the transition plugin being used.

    Most transitions will accept a duration and timing option, but may
    also use other options.  For example, SC.View.MOVE accepts options
    like:

        transitionOutOptions: {
          direction: 'right',
          duration: 0.15,
          timing: 'ease-in'
        }

    @type Object
    @default null
    @since Version 1.10
  */
  transitionOutOptions: null,

  /**
    The transition plugin to use when this view is made shown from being
    hidden.

    SC.CoreView uses a pluggable transition architecture where the transition setup,
    execution and cleanup can be handled by a specified transition plugin.

    There are a number of pre-built transition plugins available in the
    foundation framework:

      SC.View.BOUNCE
      SC.View.FADE
      SC.View.MOVE
      SC.View.SCALE
      SC.View.SPRING

    You can even provide your own custom transition plugins.  Just create a
    transition object that conforms to the SC.TransitionProtocol protocol.

    @type Object (SC.TransitionProtocol)
    @default null
    @since Version 1.10
  */
  transitionShow: null,

  /**
    The options for the given transition show plugin.

    These options are specific to the current transition plugin used and are
    used to modify the transition animation.  To determine what options
    may be used for a given plugin and to see what the default options are,
    see the documentation for the transition plugin being used.

    Most transitions will accept a duration and timing option, but may
    also use other options.  For example, SC.View.MOVE accepts options
    like:

        transitionShowOptions: {
          direction: 'left',
          duration: 0.25,
          timing: 'ease-in-out'
        }

    @type Object
    @default null
    @since Version 1.10
  */
  transitionShowOptions: null,

  /**
    The transition plugin to use when this view is hidden after being shown.

    SC.View uses a pluggable transition architecture where the transition setup,
    execution and cleanup can be handled by a specified transition plugin.

    There are a number of pre-built transition plugins available in the
    foundation framework:

      SC.View.BOUNCE
      SC.View.FADE
      SC.View.MOVE
      SC.View.SCALE
      SC.View.SPRING

    You can even provide your own custom transition plugins.  Just create a
    transition object that conforms to the SC.TransitionProtocol protocol.

    @type Object (SC.TransitionProtocol)
    @default null
    @since Version 1.10
  */
  transitionHide: null,

  /**
    The options for the given transition hide plugin.

    These options are specific to the current transition plugin used and are
    used to modify the transition animation.  To determine what options
    may be used for a given plugin and to see what the default options are,
    see the documentation for the transition plugin being used.

    Most transitions will accept a duration and timing option, but may
    also use other options.  For example, SC.View.MOVE accepts options
    like:

        transitionHideOptions: {
          direction: 'right',
          duration: 0.15,
          timing: 'ease-in'
        }

    @type Object
    @default null
    @since Version 1.10
  */
  transitionHideOptions: null

});
