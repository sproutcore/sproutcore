// ==========================================================================
// Project:   SproutCore
// Copyright: @2012 7x7 Software, Inc.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================
sc_require("views/view");


/** @private This adds design modes support to SC.View. */
SC.View.reopen(
  /** @scope SC.View.prototype */ {

  // ------------------------------------------------------------------------
  // Properties
  //

  /**
    The current design mode of the view.

    If the pane that this view belongs to has designModes specified, this
    property will be set automatically when the view is created and as the
    window size changes.

    Note that setting the design mode also updates all child views of this
    view.

    @property {String}
    @default null
  */
  designMode: function(key, value) {
    var designLayouts,
      newLayout;

    if (value !== undefined) {
      // If the view has a designModeLayout, adjust its layout to match.
      designLayouts = this.get('designLayouts');
      if (designLayouts) {
        newLayout = designLayouts[value] || null;

        if (newLayout) {
          this.set('layout', newLayout);
        }
        //@if(debug)
        else if (value) {
          // Developer support if they've implemented designLayouts but maybe missed a layout for this mode.
          SC.warn("Developer Warning: The view %@ has designLayouts, but none matching the current designMode: '%@'".fmt(this, value));
        }
        //@endif
      }

      // Set the designMode on each child view (may be null).
      this.adjustChildDesignModes(value);
    } else {
      value = null;
    }

    return value;
  }.property().cacheable(),

  /**
    The dynamic layouts for this view depending on the current design mode.

    If you specify designModes on the view's pane, this hash will be checked
    for a matching design mode layout to set for the current design mode.

    For example, if the pane has designModes 'small' and 'large', you could
    specify designLayouts 'small' and 'large' that would be used for
    the matching design mode.

    @property {Object|null}
    @default null
  */
  designLayouts: null,

  // ------------------------------------------------------------------------
  // Methods
  //

  /** @private Recursively set the designMode on each child view. */
  adjustChildDesignModes: function (designMode) {
    var childViews = this.get('childViews');

    var i, len = childViews.get('length');
    for (i = 0; i < len; i++) {
      var childView = childViews.objectAt(i);

      childView.set('designMode', designMode);
    }
  }

});
