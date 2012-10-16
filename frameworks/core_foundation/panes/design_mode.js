// ==========================================================================
// Project:   SproutCore
// Copyright: @2012 7x7 Software, Inc.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================
sc_require("panes/layout");


/** @private This adds design modes support to SC.Pane. */
SC.Pane.reopen(
  /** @scope SC.Pane.prototype */ {

  // ------------------------------------------------------------------------
  // Properties
  //

  /**
    A hash of the design modes for this pane and its child views.

    While a design may be flexible enough to stretch up for a large display and
    compress down for a medium sized display, at a certain point it
    makes more sense to stop stretching or compressing and implement an
    additional design specific to the much different display size.  In order to
    make this possible and with as much ease as possible, SC.Pane and SC.View
    have support for design "modes".  A design mode represents a specific
    design of the app for a range of the display width.  You may want to
    have a "small" design mode for smartphones and a "large" design mode for
    everything else, but you could even go so far as to have "small-portrait",
    "small-landscape", "medium-portrait", "medium-landscape", "large-portrait",
    etc.  No matter how many you implement, design modes can very easily be used
    to reposition, hide or show and modify the styles of your views as needed.

    To use design modes in your pane, set the property to a hash of mode names.
    The value of each mode represents the upper width limit at which the design
    mode of the pane should switch.  If the width of the window crosses the
    threshold value, the new design mode will be applied to the pane and each
    of its child views.

    If the pane or child view has a design mode layout in designLayouts that
    matches, the layout of the view will be updated.  As well, the pane or its
    child views can make computed properties dependent on designMode to update
    other properties, such as isVisible or classNames (using classNameBindings).

    For example,

        myPane = SC.PanelPane.create({

          // The pane will support three modes.
          designModes: {
            small: 480,       // 0 to 480
            medium: 768,      // 481 to 768
            large: Infinity   // 769 to Infinity
          },

          contentView: SC.View.design({

            // This view will change its layout for small and medium modes.
            designLayouts: {
              small: { height: 44 },
              medium: { width: 180 }
            },

            // This view will hide itself in large mode.
            isVisible: function() {
              return this.get('designMode') !== 'large';
            }.property('designMode').cacheable()

          })

        }).append();

        > myPane.adjust('width', 480);
        > myPane.get('designMode');
        > 'small'
        > myPane.getPath('contentView.layout');
        > { height: 44 }

        > myPane.adjust('width', 550);
        > myPane.get('designMode');
        > 'medium'
        > myPane.getPath('contentView.layout');
        > { width: 180 }

        > myPane.adjust('width', 1024);
        > myPane.get('designMode');
        > 'large'
        > myPane.getPath('contentView.layout');
        > { width: 180 } // Unchanged because this view doesn't have a 'large' design mode layout
        > myPane.getPath('contentView.isVisible');
        > false

        > myPane.adjust('width', 2048);
        > // Nothing new happens, design mode is already 'large'

    @property {Object|null}
    @default null
  */
  designModes: null,

  // ------------------------------------------------------------------------
  // Methods
  //

  /** @private designModes observer */
  _designModesDidChange: function() {
    var designModes = this.get('designModes'),
      designModeNames,
      designModeWidths;

    designModeNames = this._designModeNames = [];
    designModeWidths = this._designModeWidths = [];

    // Order the design modes for easier access later.
    if (designModes) {
      var key;

      outer:
        for (key in designModes) {
          var i, value;

          // Assume that the keys will be ordered smallest to largest so look.
          value = designModes[key];
          inner:
            for (i = designModeWidths.length - 1; i >= 0; i--) {
              if (designModeWidths[i] < value) {
                // Exit early!
                break inner;
              }
            }

          i += 1;
          designModeNames.splice(i, 0, key);
          designModeWidths.splice(i, 0, value);
        }
    }

    // this.invokeOnce(this._checkDesignMode);
    this.windowSizeDidChange(null, SC.RootResponder.responder.get('currentWindowSize'));
  },

  /** @private SC.Pane */
  recomputeDependentProperties: function(original) {
    original();

    this.addObserver('designModes', this, this._designModesDidChange);
    this._designModesDidChange();
  }.enhance(),

  /** @private SC.Pane */
  remove: function(original) {
    var ret = original();

    this.removeObserver('designModes', this, this.designModesDidChange);

    return ret;
  }.enhance(),

  /** @private SC.RootResponder */
  windowSizeDidChange: function(original, oldSize, newSize) {
    original();

    var designMode = null,
      designModeNames = this._designModeNames,
      designModeWidths = this._designModeWidths,
      lastDesignMode = this.get('designMode');

    // If no newSize is given set design mode with oldSize (ie. current size)
    if (SC.none(newSize)) { newSize = oldSize; }

    var i, len;
    for (i = 0, len = designModeWidths.get('length'); i < len; i++) {
      var layoutWidthThreshold = designModeWidths.objectAt(i);
      if (newSize.width < layoutWidthThreshold) {
        designMode = designModeNames.objectAt(i);
        break;
      }
    }

    // If no smaller designMode was found, use the biggest designMode.
    if (SC.none(designMode) && designModeNames && designModeNames.get('length') > 0) {
      designMode = designModeNames.objectAt(i);
    }

    // Update it if it has changed.
    if (lastDesignMode !== designMode) {
      this.set('designMode', designMode);

      //@if(debug)
      if (!designMode) {
        // Developer support if they've turned off designMode from previously having it on.
        SC.warn("Developer Warning: Design modes has been disabled for the pane %@.  The layout of the pane and its child views will remain whatever it was for the '%@' design mode.".fmt(this, lastDesignMode));
      }
      //@endif
    }
  }.enhance()

});
