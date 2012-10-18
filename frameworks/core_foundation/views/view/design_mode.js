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
    window width goes across a design mode boundary.

    @property {String}
    @default null
  */
  designMode: null,

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
  adjustChildDesignModes: function (designMode, lastDesignMode) {
    var childViews = this.get('childViews');

    var i, len = childViews.get('length');
    for (i = 0; i < len; i++) {
      var childView = childViews.objectAt(i);

      // childView.set('designMode', designMode);
      childView.updateDesignMode(designMode, lastDesignMode);
    }
  },

  /**
    Updates the design mode for this view.

    This method is called automatically by the view's pane whenever the pane
    determines that the design mode, as specified in the pane's designModes
    property, has changed.  You should likely never need to call it manually.

    This method updates the designMode property of the view, updates
    the layout if a matching design layout in the view's designLayouts
    property is found and adds a class name to the view for the current
    design mode.

    Note that updating the design mode also updates all child views of this
    view.

    @param {String} designMode the name of the design mode
    @param {String} [lastDesignMode] the previously applied
   */
  updateDesignMode: function (designMode, lastDesignMode) {
    var classNames = this.get('classNames'),
      designLayouts,
      elem,
      layer,
      newLayout,
      oldClass = this.oldClass;

    this.set('designMode', designMode);

    // If the view has a designModeLayout, adjust its layout to match.
    designLayouts = this.get('designLayouts');
    if (designLayouts) {
      newLayout = designLayouts[designMode] || null;

      if (newLayout) {
        this.set('layout', newLayout);
      }
      //@if(debug)
      else if (designMode) {
        // Developer support if they've implemented designLayouts but maybe missed a layout for this mode.
        SC.warn("Developer Warning: The view %@ has designLayouts, but none matching the current designMode: '%@'".fmt(this, designMode));
      }
      //@endif
    }

    // Apply the design mode as a class name.
    // This is done here rather than through classNameBindings, because we can
    // do it here without needing to setup a designMode observer for each view.
    layer = this.get('layer');
    if (layer) {
      elem = this.$();

      // If we had previously added a class to the element, remove it.
      if (lastDesignMode) {
        elem.removeClass(lastDesignMode);
        classNames.removeObject(lastDesignMode);
      }

      // If necessary, add a new class.
      if (designMode) {
        elem.addClass(designMode);
        classNames.push(designMode);
      }
    } else {
      if (designMode) {
        // Ensure that it gets into the classNames array
        // so it is displayed when we render.
        classNames.push(designMode);
      }
    }

    // Set the designMode on each child view (may be null).
    this.adjustChildDesignModes(designMode, lastDesignMode);
  }

});
