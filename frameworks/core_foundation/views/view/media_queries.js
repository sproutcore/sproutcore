// ==========================================================================
// Project:   Sproutcore
// Copyright: ©2013 GestiXi
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

sc_require("system/media_query");
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
            '(max-window-width: 1200px)': { title: 'Hello', layout: { left: 15 } },
            '(max-width: 1000px)': { title: 'Hi', layout: { left: 10 } },
            '(max-width: 800px) or (max-height: 500px)': { layout: { left: 5 } }
          }
        })


    @property {Object}
    @default null
  */
  media: null,

  /**
    By default, the size of the parentView will be used. You can travel more
    levels up by increasing this property.

    @property Number
    @default 0
  */
  mediaParentDepth: 0,


  // ------------------------------------------------------------------------
  // Methods
  //

  /**
    @private

    Will apply media queries on child views depend of its size.
  */
  notifyMediaChilds: function () {
    var mediaChilds = this.mediaChilds;

    if (mediaChilds) mediaChilds.forEach(function(view) {
      view.applyMediaQueries();
    });
  },

  /** @private */
  registerMediaQueries: function () {
    var media = this.media;
    if (!media) return;

    var mediaParentDepth = this.mediaParentDepth,
      parent = this;

    while (parent && mediaParentDepth >= 0) {
      mediaParentDepth--;
      parent = parent.parentView;
    }
    if (parent) {
      if (!parent.mediaChilds) parent.mediaChilds = SC.Set.create();
      parent.mediaChilds.add(this);

      this._mediaParent = parent;
      this.applyMediaQueries();
    }
    else SC.error("Could not find the parent view to register the media queries");
  },

  unregisterMediaQueries: function () {
    if (!this._mediaParent) return;
    this._mediaParent.mediaChilds.remove(this);
    this._mediaParent = null;
  },

  applyMediaQueries: function() {
    var media = this.media,
      query, properties;

    for (query in media) {
      if (SC.MediaQuery.matchQuery(query || 'all', this._mediaParent.get('frame'))) {
        var props = SC.copy(media[query]);

        if (!properties) properties = props;
        else SC.mixin(properties, props);
      }
    }

    this._applyDesignMode(properties);
  }

});
