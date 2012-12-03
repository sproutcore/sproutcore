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
    The current design mode of the application and this view.

    If the application has designModes specified, this property will be set
    automatically when the view is created and as the window width changes
    across the design mode boundaries.

    @property {String}
    @default null
  */
  designMode: null,

  /**
    The dynamic adjustments to this view depending on the current design mode.

    If you specify designModes on the application, this hash will be checked
    for a matching design mode adjustment to apply for the current design mode.

    For example, if the application has designModes 'small' and 'large', you
    could specify matching designAdjustments 'small' and 'large' that would be
    used depending on the current design mode.

    @property {Object|null}
    @default null
  */
  designAdjustments: null,

  // ------------------------------------------------------------------------
  // Methods
  //

  /** @private Recursively set the designMode on each child view. */
  adjustChildDesignModes: function (lastDesignMode, designMode) {
    var childViews = this.get('childViews');

    var i, len = childViews.get('length');
    for (i = 0; i < len; i++) {
      var childView = childViews.objectAt(i);

      if (childView.updateDesignMode) {
        childView.updateDesignMode(lastDesignMode, designMode);
      }
    }
  },

  /**
    Updates the design mode for this view.

    This method is called automatically by the view's pane whenever the pane
    determines that the design mode, as specified in the pane's designModes
    property, has changed.  You should likely never need to call it manually.

    This method updates the designMode property of the view, adjusts
    the layout if a matching design adjustment in the view's designAdjustments
    property is found and adds a class name to the view for the current
    design mode.

    Note that updating the design mode also updates all child views of this
    view.

    @param {String} lastDesignMode the previously applied design mode
    @param {String} [designMode] the name of the design mode
   */
  updateDesignMode: function (lastDesignMode, designMode) {
    // Fast path.
    if (lastDesignMode === designMode) { return; }

    var classNames = this.get('classNames'),
      designAdjustments,
      elem,
      fallbackDesignMode,
      key,
      layer,
      newAdjustment,
      oldClass = this.oldClass,
      responder = SC.RootResponder.responder,
      prevAdjustment;

    this.set('designMode', designMode);

    // If the view has designAdjustments, adjust its layout to match.
    designAdjustments = this.get('designAdjustments');
    if (designMode && designAdjustments) {
      // Find new adjustments.
      fallbackDesignMode = designMode;
      while (fallbackDesignMode && !newAdjustment) {
        newAdjustment = designAdjustments[fallbackDesignMode];
        fallbackDesignMode = responder.fallbackDesignMode(fallbackDesignMode);
      }

      // Find previous adjustments.
      fallbackDesignMode = lastDesignMode;
      while (fallbackDesignMode && !prevAdjustment) {
        prevAdjustment = designAdjustments[fallbackDesignMode];
        fallbackDesignMode = responder.fallbackDesignMode(fallbackDesignMode);
      }

      // Unset previous adjustments.
      this.beginPropertyChanges();
      if (prevAdjustment) {
        for (key in prevAdjustment) {
          if (!newAdjustment || (newAdjustment && SC.none(newAdjustment[key]))) { this.adjust(key, null); }
        }
      }

      // Apply new adjustments.
      if (newAdjustment) {
        this.adjust(newAdjustment);
      } else {
        //@if(debug)
        // Developer support if they've implemented designAdjustments but maybe missed a layout for this mode.
        SC.warn("Developer Warning: The view %@ has designAdjustments, but none matching the current designMode: '%@'".fmt(this, designMode));
        //@endif
      }
      this.endPropertyChanges();
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
    this.adjustChildDesignModes(lastDesignMode, designMode);
  }

});
