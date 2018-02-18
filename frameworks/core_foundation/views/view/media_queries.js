// ==========================================================================
// Project:   Sproutcore
// Copyright: ©2013 GestiXi
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

sc_require("views/view");

/** @private This adds media queries support to SC.View. */
SC.View.reopen(
  /** @scope SC.View.prototype */ {

  // ------------------------------------------------------------------------
  // Properties
  //

  /**
    The dynamic adjustments to apply to this view depending on the current
    window width.

    The media hash will be applied if the window width is smaller than the
    media key.
    If several hash matches, they will all be applied.
    If some hashes contains the same property, the one from the smaller
    applicable media will be used.

    exemple:

        SC.LabelView.extend({
          layout: { left: 20 },
          title: 'Hello World',
          media: {
            500: { layout: { left: 5 } },
            1000: { title: 'Hello', layout: { left: 10 } }
          }
        })


    @property {Object}
    @default null
  */
  media: null,

  // ------------------------------------------------------------------------
  // Methods
  //

  /** @private */
  registerMediaQueries: function () {
    var media = this.media;
    if (!media) return;

    SC.RootResponder.responder.mediaViews.add(this);

    var mediaWidths = [];
    for (maxWidth in media) {
      mediaWidths.push(parseInt(maxWidth));
    }
    this._mediaWidths = mediaWidths.sort(function(a, b) { return a - b; });

    this.handleMediaQueries();
  },

  unregisterMediaQueries: function () {
    var media = this.media;
    if (!media) return;

    SC.RootResponder.responder.mediaViews.remove(this);
  },

  handleMediaQueries: function() {
    var ws = SC.RootResponder.responder.get('currentWindowSize').width,
      mediaWidths = this._mediaWidths,
      query, properties;

    for (var i = mediaWidths.length-1; i >= 0; i--) {
      query = mediaWidths[i];
      if (ws < query) {
        var props = SC.copy(this.media[query]);

        if (!properties) properties = props;
        else SC.mixin(properties, props);
      }
    }

    this._applyDesignMode(properties);
  },

});
