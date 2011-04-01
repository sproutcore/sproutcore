// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

sc_require("system/utils/string_measurement");

/**
  @mixin
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

    @property {Boolean}
  */
  shouldAutoResize: YES,

  /**
    If NO, prevents SC.AutoResize from doing anything at all.

    @property {Boolean}
  */
  shouldMeasureSize: YES,

  /**
    Determines if the view's width should be resized
    on calculation. Default is YES.

    @property {Boolean}
  */
  shouldResizeWidth: YES,

  /**
    Determines if the view's height should be resized
    on calculation. Default is NO to retain backwards
    compatibility.
    
    @property {Boolean}
  */
  shouldResizeHeight: NO,
  
  /**
    The measured size of the view's content (the value of the autoResizeField). 
    This property is observable, and, if used in conjunction with setting
    shouldAutoResize to NO, allows you to customize the 'sizing' part, using
    SC.AutoResize purely for its measuring code.
    
    @property {Rect}
  */
  measuredSize: { width: 0, height: 0 },

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
    Observe the autoResizePadding so we can update our measurements if it changes.

    @private
  */
  _scar_autoResizePaddingDidChange: function() {
    this.invokeOnce('measureSize');
  }.observes('autoResizePadding'),


  /**
    If this property is provided, all views that share the same value for this property will be resized as a batch for increased performance.

    @property {String}
  */
  batchResizeId: null,

  _scar_measurementPending: NO,
  _scar_requestedBatchResizeId: null,

  // if the batch id changed while a request is out, we have to fix it
  _scar_batchResizeIdDidChange: function() {
    var batchResizeId = this.get('batchResizeId'),
    requestedBatchResizeId = this._scar_requestedBatchResizeId;

    // check if a request is out and the id changed
    if(this._scar_measurementPending && this._scar_requestedBatchResizeId !== batchResizeId) {
      // if so, cancel the old request and make a new one
      SC.AutoResizeManager.cancelMeasurementForView(this, requestedBatchResizeId);
      SC.AutoResizeManager.scheduleMeasurementForView(this, batchResizeId);

      // update the requested batchResizeId to the new id
      this._scar_requestedBatchResizeId = batchResizeId;
    }
  }.observes('batchResizeId'),

  /**
    Schedules a measurement to happen later, in batch mode. Only valid when the view
    has a `batchResizeId`.
  */
  scheduleMeasurement: function() {
    if (!this.get('shouldMeasureSize')) {
      return;
    }

    var batchResizeId = this.get('batchResizeId');
    SC.AutoResizeManager.scheduleMeasurementForView(this, batchResizeId);

    this._scar_measurementPending = YES;
    this._scar_requestedBatchResizeId = batchResizeId;
  },

  /**
    Measures the size of the view.

    @param batch For internal use during batch resizing.
  */
  measureSize: function(batch) {
    var metrics, layer, value = this.get('autoResizeText'),
        autoSizePadding, paddingHeight, paddingWidth;

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
      metrics = SC.measureString(value);
    } else {
      // Normal resize pattern: get our own layer, pass it as a template to SC.metricsForString.
      layer = this.get('autoResizeLayer');

      if(!layer) {
        return;
      }

      metrics = SC.metricsForString(value, layer);
    }

    // metrics should include padding
    autoSizePadding = this.get('autoResizePadding') || 0;
    if(SC.typeOf(autoSizePadding) === SC.T_NUMBER) {
      paddingHeight = paddingWidth = autoSizePadding;
    } else {
      paddingHeight = autoSizePadding.height;
      paddingWidth = autoSizePadding.width;
    }

    metrics.width += paddingWidth;
    metrics.height += paddingHeight;

    // In any case, we set measuredSize.
    this.set('measuredSize', metrics);

    if (this.get('shouldAutoResize')) {
      // if we are allowed to autoresize, adjust the layout
      if (this.get('shouldResizeWidth')) {
        this.adjust('width', metrics.width);
      }

      if (this.get('shouldResizeHeight')) {
        this.adjust('height', metrics.height);
      }

    }

    this._scar_measurementPending = NO;

    return metrics;
  },

  /**
    
  */
  _scar_valueDidChange: function() {
    this.scheduleMeasurement();
  }.observes('autoResizeText'),

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

    var tag, views, view, layer, batches;

    // first measure all the batched views
    batches = this.viewsNeedingResize;
    for(tag in batches) {
      if (batches.hasOwnProperty(tag)) {
        views = batches[tag];

        // step through until you find one with a layer and also visible
        while ((view = views.pop())) {

          if(!view.get('isVisible')) continue;

          layer = view.get('autoResizeLayer');

          // use the layer to prepare the measurement
          if(layer) {
            SC.prepareStringMeasurement(layer);
            view.measureSize(YES);
            break;
          }
        }

        // now measure the rest using the same settings
        while ((view = views.pop())) {
          if(view.get('isVisible')) view.measureSize(YES);
        }

        SC.teardownStringMeasurement();

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
