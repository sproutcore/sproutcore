// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/**
  @namespace
  Use this mixin to make your view automatically resize based upon its value,
  title, or other string property.
  
  The view uses SproutCore's text measuring API 
*/
SC.AutoResize = {
  /**
    Determines the property containing the string to measure.
    
    For efficiency, this may only be set _before_ initialization.
    
    @property {String}
  */
  autoResizeField: 'displayTitle',
  
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
    An amount to add to the calculated width and height to ensure that any parts
    not included in the measurement by the browser are covered (otherwise artifacts
    can occur).
    
    @private
  */
  autoSizePadding: 10,
  
  /**
    @private
    Begins observing the auto resize field.
  */
  initMixin: function() {
    this.addObserver(this.get('autoResizeField'), this, this._scar_valueDidChange);
  },
  
  /**
    If this property is provided, all views that share the same value for this property will be resized as a batch for increased performance.
    
    @property {String}
  */
  batchResizeId: null,
  
  _SCAR_measurementPending: NO,
  _SCAR_requestedBatchResizeId: null,
  
  // if the batch id changed while a request is out, we have to fix it
  _SCAR_batchResizeIdDidChange: function() {
    var batchResizeId = this.get('batchResizeId'),
    requestedBatchResizeId = this._SCAR_requestedBatchResizeId;
    
    // check if a request is out and the id changed
    if(this._SCAR_measurementPending && this._SCAR_requestedBatchResizeId !== batchResizeId) {
      // if so, cancel the old request and make a new one
      SC.AutoResize.cancelResize(this, requestedBatchResizeId);
      SC.AutoResize.requestResize(this, batchResizeId);
    }
  }.observes('batchResizeId'),
  
  measureSizeLater: function() {
    if (!this.get('shouldMeasureSize')) return;
    
    var batchResizeId = this.get('batchResizeId');
    
    SC.AutoResize.requestResize(this, batchResizeId);
    
    this._SCAR_measurementPending = YES;
    this._SCAR_requestedBatchResizeId = batchResizeId;
  },
  
  measureSize: function(batch) {
    var metrics, layer, value = this.get(this.get('autoResizeField')), autoSizePadding, paddingHeight, paddingWidth;
    
    // if there's nothing to measure, don't bother actually measuring it
    if(SC.none(value) || value === "") metrics = { width: 0, height: 0 };
    
    // get metrics in batch mode
    else if(batch) metrics = SC.measureString(value);
    
    // do a singleton measurement using our own layer
    else {
      layer = this.kindOf(SC.TextFieldView) ? this.$input()[0] : this.get('layer');
      if(!layer) return;
      metrics = SC.metricsForString(value, layer);
    }
    
    this.set('measuredSize', metrics);
    
    // if we are allowed to autoresize, add padding and adjust layout
    if (this.get('shouldAutoResize')) {
      autoSizePadding = this.get('autoSizePadding');
      
      if(SC.typeOf(autoSizePadding) === SC.T_NUMBER) paddingHeight = paddingWidth = autoSizePadding;
      else {
        paddingHeight = autoSizePadding.height;
        paddingWidth = autoSizePadding.width;
      }
      
      if (this.get('shouldResizeWidth')) this.adjust('width', metrics.width + paddingWidth);
      if (this.get('shouldResizeHeight')) this.adjust('height', metrics.height + paddingHeight);
    }
    
    this._SCAR_measurementPending = NO;
    
    return metrics;
  },
  
  // we need to update the measurement when the value changes
  _scar_valueDidChange: function() {
    this.measureSizeLater();
  },
  
  /**
    @private
    When the view is appended to the document, various factors (such as class names)
    could have changed, so it will need to be remeasured.
  */
  didAppendToDocument: function(){
    sc_super(); // just in case
    this.measureSizeLater();
  },
  
  /**
    @private
    When the layer is first created, measurement will need to take place.
  */
  didCreateLayer: function() {
    sc_super();
    this.measureSizeLater();
  },
  
  needResize: null,
  untaggedViews: null,

  requestResize: function(view, id) {
    // views with no tag just get put in their own list
    if(SC.none(id)) {
      var untaggedViews = SC.AutoResize.untaggedViews || (SC.AutoResize.untaggedViews = SC.CoreSet.create());
      
      untaggedViews.add(view);
      
    // views with a tag get a set for each tag
    } else {
      var needResize = SC.AutoResize.needResize || (SC.AutoResize.needResize = {}),
      views = needResize[id] || (needResize[id] = SC.CoreSet.create());
      
      views.add(view);
    }

    SC.RunLoop.currentRunLoop.invokeLast(SC.AutoResize.doBatchResize);
  },
  
  cancelResize: function(view, id) {
    var set = SC.none(id) ? SC.AutoResize.untaggedViews : SC.AutoResize.needResize[id];
    
    if(set) set.remove(view);
  },

  doBatchResize: function() {
    var tag, views, view, layer, batches;
    
    // first measure all the batched views
    batches = SC.AutoResize.needResize;
    for(tag in batches) {
      views = batches[tag];
      
      // step through until you find one with a layer
      while(view = views.pop()) {
        layer = view.get('layer');
        
        // use the layer to prepare the measurement
        if(layer) {
          SC.prepareStringMeasurement(layer);
          view.measureSize(YES);
          break;
        }
      }
      
      // now measure the rest using the same settings
      while(view = views.pop()) {
        view.measureSize(YES);
      }

      SC.teardownStringMeasurement();
    }
    
    // measure views with no batch id
    views = SC.AutoResize.untaggedViews;
    if(!views) return;
    while(view = views.pop()) {
      view.measureSize();
    }
  }
};
