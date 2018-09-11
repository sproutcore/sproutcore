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

  /** @private See: https://github.com/paulirish/matchMedia.js */
  matchMedia: function(media) {
    // For browsers that support matchMedium api such as IE 9 and webkit
    var styleMedia = (window.styleMedia || window.media);

    // For those that don't support matchMedium
    if (!styleMedia) {
      var style = document.createElement('style'),
          script = document.getElementsByTagName('script')[0],
          info = null;

      style.type = 'text/css';
      style.id = 'matchmediajs-test';

      if (!script) {
        document.head.appendChild(style);
      } else {
        script.parentNode.insertBefore(style, script);
      }

      // 'style.currentStyle' is used by IE <= 8 and 'window.getComputedStyle' for all other browsers
      info = ('getComputedStyle' in window) && window.getComputedStyle(style, null) || style.currentStyle;

      styleMedia = {
        matchMedium: function(media) {
          var text = '@media ' + media + '{ #matchmediajs-test { width: 1px; } }';

          // 'style.styleSheet' is used by IE <= 8 and 'style.textContent' for all other browsers
          if (style.styleSheet) {
              style.styleSheet.cssText = text;
          } else {
              style.textContent = text;
          }

          // Test if media query is true or false
          return info.width === '1px';
        }
      };
    }

    return styleMedia.matchMedium(media || 'all');
  }

});
