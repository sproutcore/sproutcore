// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

sc_require("system/utils/string_measurement");

/**
  @class
  Use this mixin to make your view automatically resize based upon its value,
  title, or other string property. Only works for views that support automatic
  resizing.

  Supporting Automatic Resizing
  -------------------------------------
  To support automatic resizing, your view must provide these properties:

  - *`supportsAutoResize`.* Must be set to YES.

  - *`autoResizeLayer`* A DOM element to use as a template for resizing the
    view. Font sizes and other styles will be copied to the measuring element
    SproutCore uses to measure the text.

  - *`autoResizeText`.* The text to measure. A button view might make a proxy
    to its `displayTitle`, for instance.

  Your view may also supply:

  - *`autoResizePadding`.* An amount to add to the measured size. This may be either
    a single number to be added to both width and height, or a hash containing
    separate `width` and `height` properties.


  NOTE: these properties are not defined in the mixin itself because the supporting view,
  rather than the user of SC.AutoResize, will be providing the properties, and mixing
  SC.AutoResize into the view should not override these properties.
*/
SC.AutoResize = {
  /*@scope SC.AutoResize.prototype */

  /**
    If YES, automatically resizes the view (default). If NO, only measures,
    setting 'measuredSize' to the measured value (you can bind to measuredSize
    and update size manually).

    @type Boolean
    @default YES
  */
  shouldAutoResize: YES,

  /**
    If NO, prevents SC.AutoResize from doing anything at all.

    @type Boolean
    @default YES
  */
  shouldMeasureSize: YES,

  /**
    Determines if the view's width should be resized
    on calculation.

    @type Boolean
    @default YES
  */
  shouldResizeWidth: YES,

  /**
    Determines if the view's height should be resized
    on calculation. Default is NO to retain backwards
    compatibility.
    
    @type Boolean
    @default NO
  */
  shouldResizeHeight: NO,
  
  /**
    The measured size of the view's content (the value of the autoResizeField). 
    This property is observable, and, if used in conjunction with setting
    shouldAutoResize to NO, allows you to customize the 'sizing' part, using
    SC.AutoResize purely for its measuring code.
    
    @type Rect
  */
  measuredSize: { width: 0, height: 0 },

  /**
    Observes the measured size and actually performs the resize if necessary.
  */
  measuredSizeDidChange: function() {
    var measuredSize = this.get('measuredSize'),
    calculatedWidth = measuredSize.width, calculatedHeight = measuredSize.height,
    paddingHeight, paddingWidth,
    autoResizePadding = this.get('autoResizePadding') || 0;

    if(SC.typeOf(autoResizePadding) === SC.T_NUMBER) {
      paddingHeight = paddingWidth = autoResizePadding;
    } else {
      paddingHeight = autoResizePadding.height;
      paddingWidth = autoResizePadding.width;
    }

    calculatedHeight += paddingHeight;
    calculatedWidth += paddingWidth;

    if(this.get('shouldAutoResize')) {
      // if we are allowed to autoresize, adjust the layout
      if (this.get('shouldResizeWidth')) {
        this.set('calculatedWidth', calculatedWidth);
        this.adjust('width', calculatedWidth);
      }

      if (this.get('shouldResizeHeight')) {
        this.set('calculatedHeight', calculatedHeight);
        this.adjust('height', calculatedHeight);
      }
    }

  }.observes('shouldAutoResize', 'measuredSize', 'autoResizePadding'),

  /**
    @private
    Begins observing the auto resize field.
  */
  initMixin: function() {
    // @if (debug)
    if (!this.get('supportsAutoResize')) {
      throw "View `%@` does not support automatic resize. See documentation for SC.AutoResize".fmt(this);
    }
    // @endif
  },

  /**
    If this property is provided, all views that share the same value for this property will be resized as a batch for increased performance.

    @type String
  */
  batchResizeId: null,

  /** @private */
  _scar_measurementPending: NO,
  
  /** @private */
  _scar_requestedBatchResizeId: null,

  /**
    Schedules a measurement to happen later.
  */
  scheduleMeasurement: function() {
    var batchResizeId = this.get('batchResizeId');

    // only measure if we are visible, active, and the text or style actually changed
    if (!this.get('shouldMeasureSize') || !this.get('isVisibleInWindow') || (this.get('autoResizeText') === this._lastMeasuredText && batchResizeId === this._lastMeasuredId)) return;

    var requestedBatchResizeId = this._scar_requestedBatchResizeId;

    // check if a request is out and the id changed
    if(this._scar_measurementPending && this._scar_requestedBatchResizeId !== batchResizeId) {
      // if so, cancel the old request
      SC.AutoResizeManager.cancelMeasurementForView(this, requestedBatchResizeId);
    }

    // batchResizeId is allowed to be undefined; views without an id will just
    // get measured one at a time
    SC.AutoResizeManager.scheduleMeasurementForView(this, batchResizeId);

    this._scar_measurementPending = YES;
    this._scar_requestedBatchResizeId = batchResizeId;
  }.observes('isVisibleInWindow', 'shouldMeasureSize', 'autoResizeText', 'batchResizeId'),

  _lastMeasuredText: null,

  /**
    Measures the size of the view.

    @param batch For internal use during batch resizing.
  */
  measureSize: function(batch) {
    var metrics, layer, value = this.get('autoResizeText'),
        autoSizePadding, paddingHeight, paddingWidth,
        ignoreEscape = !this.get('escapeHTML');

    // There are two special cases.
    //   - empty: we should do nothing. The metrics are 0.
    //   - batch mode: just call measureString.
    //
    // If we are in neither of those special cases, we should go ahead and
    // resize normally.
    //
    if (SC.none(value) || value === "") {
      metrics = { width: 0, height: 0 };
    } else if (batch) {
      metrics = SC.measureString(value, ignoreEscape);
    } else {
      // Normal resize pattern: get our own layer, pass it as a template to SC.metricsForString.
      layer = this.get('autoResizeLayer');

      if(!layer) {
        return;
      }

      metrics = SC.metricsForString(value, layer, this.get('classNames'), ignoreEscape);
    }

    // In any case, we set measuredSize.
    this.set('measuredSize', metrics);

    // set the measured value so we can avoid extra measurements in the future
    this._lastMeasuredText = value;
    this._lastMeasuredId = this.get('batchResizeId');

    this._scar_measurementPending = NO;

    return metrics;
  },

  /**
    @private
    When the layer is first created, measurement will need to take place.
  */
  didCreateLayer: function(orig) {
    orig();

    this.scheduleMeasurement();
  }.enhance()
};

/**
 * @private
 * @class
 * Manages batch auto resizing.
 *
 * This used to be part of SC.AutoResize, but we shouldn't mix these
 * methods/properties into each view.
 */
SC.AutoResizeManager = {

  /**
    A hash of views needing resizing, mapped from batch resize ID to SC.CoreSets
    of views.
  */
  viewsNeedingResize: null,

  /**
    Views queued for batch resizing, but with no batch resize id.

    @property {SC.CoreSet}
  */
  untaggedViews: null,

  /**
    Schedules a re-measurement for the specified view in the batch with the
    given id.

    If a batch does not exist by that id, it will be created. If there is no id,
    the view will be measured individually.

    @param view The view to measure.
    @param id The id of the batch to measure the view in.
  */
  scheduleMeasurementForView: function(view, id) {
    // views with no tag just get put in their own list
    if(SC.none(id)) {
      var untaggedViews = this.untaggedViews || (this.untaggedViews = SC.CoreSet.create());

      untaggedViews.add(view);

    // views with a batch resize id set for each tag
    } else {
      var needResize = this.viewsNeedingResize || (this.viewsNeedingResize = {}),
      views = needResize[id] || (needResize[id] = SC.CoreSet.create());

      views.add(view);
    }

    SC.RunLoop.currentRunLoop.invokeLast(this.doBatchResize);
  },

  /**
    Cancels a scheduled measurement for a view in the named batch id.

    @param view The view that was scheduled for measurement.
    @param id The batch id the view was scheduled in.
  */
  cancelMeasurementForView: function(view, id) {
    var set = SC.none(id) ? this.untaggedViews : this.viewsNeedingResize[id];

    if(set) {
      set.remove(view);
    }
  },

  /**
    Processes all autoResize batches. This will automatically be invoked at the
    end of any run loop in which measurements were scheduled.
  */
  doBatchResize: function() {
    // make sure we are called from the correct scope.
    // this will make our property references below clearer.
    if (this !== SC.AutoResizeManager) {
      return SC.AutoResizeManager.doBatchResize();
    }

    var tag, views, view, layer, batches, prepared, autoResizeText;

    // first measure all the batched views
    batches = this.viewsNeedingResize;
    for(tag in batches) {
      if (batches.hasOwnProperty(tag)) {
        views = batches[tag];
        prepared = NO;

        while ((view = views.pop())) {
          if(view.get('isVisibleInWindow') && view.get('shouldMeasureSize') && (layer = view.get('autoResizeLayer'))) {
            autoResizeText = view.get('autoResizeText');

            // if the text is empty don't bother preparing
            if(!SC.none(autoResizeText) && autoResizeText !== "" && !prepared) {
              SC.prepareStringMeasurement(layer);
              prepared = YES;
            }

            view.measureSize(YES);
          }
        }

        // don't call teardown if prepare was never called either
        if(prepared) {
          SC.teardownStringMeasurement();
        }
      }
    }

    // measure views with no batch id
    views = this.untaggedViews;

    if(!views) {
      return;
    }

    while((view = views.pop())) {
      view.measureSize();
    }
  }

};
