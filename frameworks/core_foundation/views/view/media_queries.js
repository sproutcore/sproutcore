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
    window size.

    The synthax to use for the media hash key is the same as CSS media query.

    If several hash matches, they will all be applied in order.

    exemple:

        SC.LabelView.extend({
          layout: { left: 20 },
          title: 'Hello World',
          media: {
            '(max-width: 1000px)': { title: 'Hello', layout: { left: 10 } },
            '(max-width: 800px) or (max-height: 500px)': { layout: { left: 5 } }
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

    this.handleMediaQueries();
  },

  unregisterMediaQueries: function () {
    var media = this.media;
    if (!media) return;

    SC.RootResponder.responder.mediaViews.remove(this);
  },

  handleMediaQueries: function() {
    var media = this.media,
      query, properties;

    for (query in media) {
      if (this.matchMedia(query)) {
        var props = SC.copy(media[query]);

        if (!properties) properties = props;
        else SC.mixin(properties, props);
      }
    }

    this._applyDesignMode(properties);
  },

  /** @private Modified version of: https://github.com/paulirish/matchMedia.js */
  matchMedia: function(media) {
    // For browsers that support matchMedium api such as IE 9 and webkit
    var styleMedia = (window.styleMedia || window.media);

    // For those that don't support matchMedium
    if (!styleMedia) {
      var mediaId = media.replace(/\W/g,'_');
      styleMedia = this._sc_styleMedias[mediaId];

      if (!styleMedia) {
        var style = document.createElement('style'),
          script = document.getElementsByTagName('script')[0],
          info = null;

        style.type = 'text/css';
        style.id = 'sc-matchmedia'+mediaId;

        if (!script) document.head.appendChild(style);
        else script.parentNode.insertBefore(style, script);

        info = window.getComputedStyle(style, null);

        styleMedia = {
          matchMedium: function(media) {
            style.textContent = '@media ' + media + '{ #sc-matchmedia'+mediaId+' { width: 1px; } }';
            return info.width === '1px';
          }
        };

        this._sc_styleMedias[mediaId] = styleMedia;
      }
    }

    return styleMedia.matchMedium(media || 'all');
  },

  /** @private */
  _sc_styleMedias: {}

});
