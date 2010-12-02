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
    
    Currently, this may only be set _before_ initialization.
    
    @property {String}
  */
  autoResizeField: "value",
  
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
  shouldMeasureSize: YES, // if NO, nothing happens.
  
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
    this.addObserver(this.get("autoResizeField"), this, "_scar_valueDidChange");
  },
  
  /**
    If this property is provided, all views that share the same value for this property will be resized as a batch for increased performance.
    
    @property {String}
  */
  batchResizeId: null,
  
  measureSizeLater: function() {
    var batchResizeId = this.get('batchResizeId');
    
    if(batchResizeId) SC.AutoResize.requestResize(this, batchResizeId);
    else this.invokeOnce(this.measureSize);
  },
  
  measureSize: function(batch) {
    if (!this.get("shouldMeasureSize")) return;
    
    var metrics, layer = this.kindOf(SC.TextFieldView) ? this.$input()[0] : this.get("layer");
    
    // return if there wasn't one (no font sizes, etc. to use with measuring)
    if (!layer) return;
     
    // get metrics, using layer as example element
    if(batch) metrics = SC.measureString(this.get(this.get("autoResizeField")));
    else metrics = SC.metricsForString(this.get(this.get("autoResizeField")), layer);
    
    // set it
    this.set("measuredSize", metrics);
    if (this.get("shouldAutoResize")) {
      if (this.get('shouldResizeWidth')) this.adjust("width", metrics.width + this.get("autoSizePadding"));
      if (this.get('shouldResizeHeight')) this.adjust("height", metrics.height + this.get("autoSizePadding"));
    }
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
  
  needResize: {},

  requestResize: function(view, id) {
    var views = SC.AutoResize.needResize[id] || (SC.AutoResize.needResize[id] = SC.CoreSet.create());

    views.add(view);

    SC.RunLoop.currentRunLoop.invokeLast(SC.AutoResize.doBatchResize);
  },

  doBatchResize: function() {
    var tag, views, view, layer;

    for(tag in SC.AutoResize.needResize) {
      views = SC.AutoResize.needResize[tag];

      while(view = views.pop()) {
        layer = view.get('layer');

        if(layer) {
          SC.prepareStringMeasurement(layer);
          view.measureSize(YES);
          break;
        }
      }

      while(view = views.pop()) {
        view.measureSize(YES);
      }

      SC.teardownStringMeasurement();
    }
  }
};
