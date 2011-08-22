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
    If provided, will limit the maximum width to this value.
  */
  maxWidth: null,
  
  /**
    If provided, will limit the maximum height to this value.
  */
  maxHeight: null,
  
  /**
    If YES, the view's text will be resized to fit the view. This is applied _after_ any
    resizing, so will only take affect if shouldAutoResize is off, or a maximum width/height
    is set.
    
    You also must set a minimum and maximum font size. Any auto resizing will happen at the
    maximum size, and then the text will be resized as necessary.
  */
  shouldAutoFitText: NO,
  
  /**
    The minimum font size to use when automatically fitting text. If shouldAutoFitText is set,
    this _must_ be supplied.
    
    Font size is in pixels.
  */
  minFontSize: 12,
  
  /**
    The maximum font size to use when automatically fitting text. If shouldAutoFitText is set,
    this _must_ be supplied.
    
    Font size is in pixels.
  */
  maxFontSize: 20,
  
  /**
    If shouldAutoFitText is YES, this is the calculated font size.
  */
  calculatedFontSize: 20,
  
  fontPropertyDidChange: function() {
    if(this.get('shouldAutoFitText')) this.invokeLast(this.fitTextToFrame);
  }.observes('shouldAutoFitText', 'minFontSize', 'maxFontSize', 'measuredSize'),

  /**
    Observes the measured size and actually performs the resize if necessary.
  */
  measuredSizeDidChange: function() {
    var measuredSize = this.get('measuredSize'),
    calculatedWidth = measuredSize.width, calculatedHeight = measuredSize.height,
    paddingHeight, paddingWidth,
    autoResizePadding = this.get('autoResizePadding') || 0,
    maxWidth = this.get('maxWidth'), maxHeight = this.get('maxHeight');

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
        if (maxWidth && calculatedWidth > maxWidth) {
          calculatedWidth = maxWidth;
        }
        this.set('calculatedWidth', calculatedWidth);
        this.adjust('width', calculatedWidth);
      }

      if (this.get('shouldResizeHeight')) {
        if (maxHeight && calculatedHeight > maxHeight) {
          calculatedHeight = maxHeight;
        }
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

      this.prepareLayerForStringMeasurement(layer);
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
  
  
  //
  // FITTING TEXT
  //
  
  /**
    If we are fitting text, the layer must be measured with its font size set to our
    maximum font size.
  */
  prepareLayerForStringMeasurement: function(layer) {
    if (this.get('shouldAutoFitText')) {
      layer.style.fontSize = this.get('maxFontSize') + "px";
    }
  },
  
  /**
    Whenever the view resizes, the text fitting must be reevaluated.
  */
  viewDidResize: function(orig) {
    orig();

    if (this.get('shouldAutoFitText')) this.fontPropertyDidChange();
  }.enhance(),
  
  /**
    Fits the text into the frame's size, minus autoResizePadding.
  */
  fitTextToFrame: function() {      
    // we can only fit text when we have a layer.
    var layer = this.get('autoResizeLayer');
    if (!layer) return;

    // the max font size may have changed
    this.prepareLayerForStringMeasurement(layer);
    
    var frame = this.get('frame'),
    
        padding = this.get('autoResizePadding') || 0,
        
        width = frame.width, height = frame.height,
        measured = this.get('measuredSize'),
        mWidth = measured.width, mHeight = measured.height;

    // figure out and apply padding to the width/height
    if(SC.typeOf(padding) === SC.T_NUMBER) {
      width -= padding;
      height -= padding;
    } else {
      width -= padding.width;
      height -= padding.height;
    }
        
    // measured size is at maximum. If there is no resizing to be done, short-circuit.
    if (mWidth <= width && mHeight <= height) return;
    
    
    // now, we are going to make an estimate font size. We will figure out the proportion
    // of both actual width and actual height to the measured width and height, and then we'll
    // pick the smaller. We'll multiply that by the maximum font size to figure out
    // a rough guestimate of the proper font size.
    var xProportion = width / mWidth, yProportion = height / mHeight,
    
        maxFontSize = this.get('maxFontSize'),
        minFontSize = this.get('minFontSize'),
        
        guestimate = Math.floor(maxFontSize * Math.min(xProportion, yProportion)),
        actual,
        
        classNames = this.get('classNames'),
        ignoreEscape = !this.get('escapeHTML'),
        value = this.get('autoResizeText'),
        
        metrics;
    

    guestimate = Math.min(maxFontSize, Math.max(minFontSize, guestimate));

    // Now, we must test the guestimate. Based on that, we'll either loop down
    // or loop up, depending on the measured size.
    layer.style.fontSize = guestimate + "px";
    metrics = SC.metricsForString(value, layer, classNames, ignoreEscape);


    if (metrics.width > width || metrics.height > height) {
      actual = guestimate;
      
      // if we're larger, we must go down until we are smaller, at which point we are done.
      for (guestimate = guestimate - 1; guestimate >= minFontSize; guestimate--) {
        layer.style.fontSize = guestimate + "px";
        metrics = SC.metricsForString(value, layer, classNames, ignoreEscape);
        
        if (metrics.width <= width && metrics.height <= height) {
          break;
        }
        
        // always have an actual in this case; even if we can't get it small enough, we want
        // to keep this as close as possible.
        actual = guestimate;
      }
      
    } else if (metrics.width < width || metrics.height < height) {
      // if we're smaller, we must go up until we hit maxFontSize or get larger. If we get
      // larger, we want to use the previous guestimate (which we know was valid)
      //
      // So, we'll start actual at guestimate, and only increase it while we're smaller.
      actual = guestimate;
      for (guestimate = guestimate + 1; guestimate <= maxFontSize; guestimate++) {
        layer.style.fontSize = guestimate + "px";
        metrics = SC.metricsForString(value, layer, classNames, ignoreEscape);
        
        // we update actual only if it is still valid. Then below, whether valid
        // or not, if we are at or past the width/height we leave
        if (metrics.width <= width && metrics.height <= height) {
          actual = guestimate;
        }
        
        // we put this in a separate if statement JUST IN CASE it is ===.
        // Unlikely, but possible, and why ruin a good thing?
        if (metrics.width >= width || metrics.height >= height){
          break;
        }
        
      }
      
      
    }
    
    layer.style.fontSize = actual + "px";
    this.set('calculatedFontSize', actual);
    
  },
  
  /**
    Extends renderSettingsToContext to add font size if shouldAutoFitText is YES.
  */
  applyAttributesToContext: function(orig, context) {
    orig(context);
    
    if (this.get('shouldAutoFitText')) {
      context.css('font-size', this.get('calculatedFontSize') + "px");
    }
  }.enhance(),

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
              // this is a bit of a hack: before we can prepare string measurement, there are cases where we
              // need to reset the font size first (specifically, if we are also fitting text)
              //
              // It is expected that all views in a batch will have the same font settings.
              view.prepareLayerForStringMeasurement(layer);
              
              // now we can tell SC to prepare the layer with the settings from the view's layer
              SC.prepareStringMeasurement(layer, view.get('classNames'));
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
